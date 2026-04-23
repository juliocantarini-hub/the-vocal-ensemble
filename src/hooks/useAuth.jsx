import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

// ─── Contexto ───────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuthLogic()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

// ─── Lógica principal ────────────────────────────────────────────────────────
function useAuthLogic() {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil]   = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    // Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null)
      if (session?.user) cargarPerfil(session.user.id)
      else setCargando(false)
    })

    // Escuchar cambios de sesión (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUsuario(session?.user ?? null)
        if (session?.user) cargarPerfil(session.user.id)
        else {
          setPerfil(null)
          setCargando(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function cargarPerfil(userId) {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setPerfil(data)
    } catch (err) {
      console.error('Error cargando perfil:', err)
    } finally {
      setCargando(false)
    }
  }

  // ── Login con email y contraseña ─────────────────────────────────────────
  async function login(email, password) {
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) {
      setError(traducirError(error.message))
      return { ok: false, error: traducirError(error.message) }
    }
    return { ok: true, data }
  }

  // ── Login con Google OAuth ───────────────────────────────────────────────
  async function loginConGoogle() {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) setError(traducirError(error.message))
  }

  // ── Registro con email ───────────────────────────────────────────────────
  async function registro(email, password, nombre) {
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: nombre.trim() },
        emailRedirectTo: `${window.location.origin}/`,
      },
    })
    if (error) {
      setError(traducirError(error.message))
      return { ok: false, error: traducirError(error.message) }
    }
    // Supabase envía email de confirmación si está activado
    return {
      ok: true,
      necesitaConfirmacion: !data.session,
      data,
    }
  }

  // ── Recuperar contraseña ─────────────────────────────────────────────────
  async function recuperarContrasena(email) {
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )
    if (error) {
      setError(traducirError(error.message))
      return { ok: false, error: traducirError(error.message) }
    }
    return { ok: true }
  }

  // ── Nueva contraseña (desde link de email) ───────────────────────────────
  async function actualizarContrasena(nuevaContrasena) {
    setError(null)
    const { error } = await supabase.auth.updateUser({
      password: nuevaContrasena,
    })
    if (error) {
      setError(traducirError(error.message))
      return { ok: false, error: traducirError(error.message) }
    }
    return { ok: true }
  }

  // ── Actualizar perfil ────────────────────────────────────────────────────
  async function actualizarPerfil(datos) {
    if (!usuario) return { ok: false, error: 'No hay sesión activa' }
    const { data, error } = await supabase
      .from('perfiles')
      .update({ ...datos, actualizado_en: new Date().toISOString() })
      .eq('id', usuario.id)
      .select()
      .single()
    if (error) return { ok: false, error: error.message }
    setPerfil(data)
    return { ok: true, data }
  }

  // ── Cerrar sesión ────────────────────────────────────────────────────────
  async function cerrarSesion() {
    await supabase.auth.signOut()
    setPerfil(null)
    setUsuario(null)
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const esAdmin    = perfil?.rol === 'admin'
  const esDirector = perfil?.rol === 'director' || esAdmin
  const esCantante = !!perfil

  return {
    usuario,
    perfil,
    cargando,
    error,
    setError,
    login,
    loginConGoogle,
    registro,
    recuperarContrasena,
    actualizarContrasena,
    actualizarPerfil,
    cerrarSesion,
    esAdmin,
    esDirector,
    esCantante,
  }
}

// ─── Traducción de errores de Supabase al español ────────────────────────────
function traducirError(msg) {
  if (!msg) return 'Ocurrió un error inesperado.'
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials'))  return 'Correo o contraseña incorrectos.'
  if (m.includes('email not confirmed'))        return 'Confirmá tu correo antes de ingresar. Revisá tu bandeja de entrada.'
  if (m.includes('user already registered'))   return 'Ya existe una cuenta con ese correo.'
  if (m.includes('password should be'))        return 'La contraseña debe tener al menos 6 caracteres.'
  if (m.includes('rate limit'))                return 'Demasiados intentos. Esperá unos minutos antes de volver a intentarlo.'
  if (m.includes('network'))                   return 'Error de conexión. Revisá tu internet e intentá de nuevo.'
  if (m.includes('user not found'))            return 'No encontramos una cuenta con ese correo.'
  return 'Ocurrió un error inesperado. Intentá de nuevo.'
}
