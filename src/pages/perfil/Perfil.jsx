import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const VOCES = ['soprano', 'contralto', 'tenor', 'bajo']

export default function Perfil() {
  const { perfil, actualizarPerfil, cerrarSesion } = useAuth()

  const [form, setForm] = useState({
    nombre:   perfil?.nombre   || '',
    telefono: perfil?.telefono || '',
    voz:      perfil?.voz      || '',
  })
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje]     = useState('')
  const [error, setError]         = useState('')
  const [notifApp, setNotifApp]   = useState(true)
  const [notifEmail, setNotifEmail] = useState(true)

  function set(campo) {
    return e => setForm(f => ({ ...f, [campo]: e.target.value }))
  }

  async function guardar(e) {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es obligatorio.'); return }
    setError('')
    setGuardando(true)
    const { ok } = await actualizarPerfil(form)
    setGuardando(false)
    if (ok) {
      setMensaje('Perfil actualizado correctamente.')
      setTimeout(() => setMensaje(''), 3000)
    } else {
      setError('No se pudo guardar. Intentá de nuevo.')
    }
  }

  const iniciales = perfil?.nombre
    ? perfil.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const rolLabel = { cantante: 'Cantante', director: 'Director/a', admin: 'Administrador/a' }

  return (
    <div style={{ maxWidth: '560px' }}>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'normal', color: '#1A1A18', margin: '0 0 24px' }}>
        Mi perfil
      </h2>

      {/* Avatar y rol */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '14px', padding: '22px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '18px', borderBottom: '1px solid #F1EFE8' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0F6E56, #1D9E75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: '600', color: 'white',
            fontFamily: 'Georgia, serif', flexShrink: 0,
          }}>
            {iniciales}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#1A1A18' }}>{perfil?.nombre || '—'}</div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
              {perfil?.voz && (
                <span style={{ fontSize: '11px', background: '#E1F5EE', color: '#04342C', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', textTransform: 'capitalize' }}>
                  {perfil.voz}
                </span>
              )}
              {perfil?.rol && (
                <span style={{ fontSize: '11px', background: '#F1EFE8', color: '#5F5E5A', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' }}>
                  {rolLabel[perfil.rol] || perfil.rol}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={guardar} noValidate>
          {mensaje && (
            <div style={{ background: '#EAF3DE', border: '1px solid #639922', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#27500A', marginBottom: '16px' }}>
              ✓ {mensaje}
            </div>
          )}
          {error && (
            <div style={{ background: '#FCEBEB', border: '1px solid #E24B4A', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#501313', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Campo label="Nombre completo">
              <input value={form.nombre} onChange={set('nombre')} style={inputStyle} placeholder="Tu nombre" />
            </Campo>
            <Campo label="Teléfono (opcional)">
              <input value={form.telefono} onChange={set('telefono')} style={inputStyle} placeholder="+54 11 …" />
            </Campo>
          </div>

          <Campo label="Voz">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {VOCES.map(v => (
                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, voz: v }))}
                  style={{
                    padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                    border: `1.5px solid ${form.voz === v ? '#0F6E56' : '#D3D1C7'}`,
                    background: form.voz === v ? '#E1F5EE' : '#FFFFFF',
                    color: form.voz === v ? '#04342C' : '#5F5E5A',
                    fontWeight: form.voz === v ? '500' : '400',
                    textTransform: 'capitalize',
                  }}>
                  {v}
                </button>
              ))}
            </div>
          </Campo>

          <Campo label="Correo electrónico">
            <input value={perfil?.email || ''} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
            <p style={{ fontSize: '11px', color: '#B4B2A9', margin: '4px 0 0' }}>El correo no se puede cambiar desde aquí.</p>
          </Campo>

          <button type="submit" disabled={guardando}
            style={{ width: '100%', height: '42px', borderRadius: '8px', border: 'none', background: guardando ? '#9FE1CB' : '#0F6E56', color: '#FFFFFF', fontSize: '14px', cursor: guardando ? 'not-allowed' : 'pointer', fontWeight: '500', marginTop: '4px' }}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Preferencias de notificación */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px' }}>
          Preferencias de notificación
        </h3>
        <ToggleRow
          label="Notificaciones en la app"
          sub="Avisos, materiales y novedades"
          activo={notifApp}
          onToggle={() => setNotifApp(v => !v)}
        />
        <ToggleRow
          label="Avisos por correo electrónico"
          sub="Recordatorios de ensayos y conciertos"
          activo={notifEmail}
          onToggle={() => setNotifEmail(v => !v)}
        />
      </div>

      {/* Seguridad */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '14px', padding: '18px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#5F5E5A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px' }}>
          Seguridad
        </h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ flex: 1, height: '38px', borderRadius: '8px', border: '1px solid #D3D1C7', background: '#FFFFFF', fontSize: '13px', cursor: 'pointer', color: '#1A1A18' }}>
            Cambiar contraseña
          </button>
          <button onClick={cerrarSesion}
            style={{ flex: 1, height: '38px', borderRadius: '8px', border: '1px solid #F0C5B4', background: '#FFFFFF', fontSize: '13px', cursor: 'pointer', color: '#A32D2D', fontWeight: '500' }}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#5F5E5A', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</label>
      {children}
    </div>
  )
}

function ToggleRow({ label, sub, activo, onToggle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1EFE8' }}>
      <div>
        <div style={{ fontSize: '13px', color: '#1A1A18' }}>{label}</div>
        <div style={{ fontSize: '11px', color: '#888780', marginTop: '1px' }}>{sub}</div>
      </div>
      <button onClick={onToggle}
        style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activo ? '#0F6E56' : '#D3D1C7', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: '3px', left: activo ? '22px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#FFFFFF', transition: 'left 0.2s' }} />
      </button>
    </div>
  )
}

const inputStyle = {
  width: '100%', height: '38px', border: '1px solid #D3D1C7', borderRadius: '8px',
  padding: '0 12px', fontSize: '13px', color: '#1A1A18', background: '#FFFFFF',
  outline: 'none', boxSizing: 'border-box',
}
