import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Hook: listas de asistencia (admin) ──────────────────────────────────────
export function useListasAsistencia() {
  const [listas, setListas]     = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error: err } = await supabase
      .from('listas_asistencia')
      .select(`*, registros_asistencia(estado, perfil_id)`)
      .order('fecha', { ascending: false })
    if (err) { setError(err.message); setCargando(false); return }
    setListas(data || [])
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])
  return { listas, cargando, error, recargar: cargar }
}

// ─── Hook: historial del cantante ────────────────────────────────────────────
export function useHistorialAsistencia(perfilId) {
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando]   = useState(true)

  useEffect(() => {
    if (!perfilId) return
    supabase
      .from('registros_asistencia')
      .select(`*, listas_asistencia(fecha, descripcion)`)
      .eq('perfil_id', perfilId)
      .order('listas_asistencia(fecha)', { ascending: false })
      .then(({ data }) => {
        setHistorial(data || [])
        setCargando(false)
      })
  }, [perfilId])

  return { historial, cargando }
}

// ─── Hook: registros de una lista (admin) ────────────────────────────────────
export function useRegistrosLista(listaId) {
  const [registros, setRegistros] = useState([])
  const [cantantes, setCantantes] = useState([])
  const [cargando, setCargando]   = useState(true)

  const cargar = useCallback(async () => {
    if (!listaId) return
    setCargando(true)
    const [{ data: regs }, { data: cants }] = await Promise.all([
      supabase.from('registros_asistencia').select('*').eq('lista_id', listaId),
      supabase.from('perfiles').select('id, nombre, voz').eq('estado', 'activo').order('nombre'),
    ])
    setRegistros(regs || [])
    setCantantes(cants || [])
    setCargando(false)
  }, [listaId])

  useEffect(() => { cargar() }, [cargar])
  return { registros, cantantes, cargando, recargar: cargar }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────
export async function crearLista(fecha, descripcion) {
  const { data, error } = await supabase
    .from('listas_asistencia')
    .insert([{ fecha, descripcion }])
    .select().single()
  return { ok: !error, data, error: error?.message }
}

export async function eliminarLista(id) {
  const { error } = await supabase.from('listas_asistencia').delete().eq('id', id)
  return { ok: !error, error: error?.message }
}

export async function marcarAsistencia(listaId, perfilId, estado, nota = null) {
  const { error } = await supabase
    .from('registros_asistencia')
    .upsert({ lista_id: listaId, perfil_id: perfilId, estado, nota },
      { onConflict: 'lista_id,perfil_id' })
  return { ok: !error, error: error?.message }
}

export async function resetearAsistencia() {
  const { error } = await supabase.from('listas_asistencia').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  return { ok: !error, error: error?.message }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function calcularEstadisticas(historial) {
  const meses = {}
  historial.forEach(r => {
    if (!r.listas_asistencia) return
    const fecha = new Date(r.listas_asistencia.fecha)
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
    if (!meses[key]) meses[key] = { total: 0, presentes: 0 }
    meses[key].total++
    if (r.estado === 'presente') meses[key].presentes++
  })
  return Object.entries(meses)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => ({
      mes: key,
      label: new Date(key + '-01').toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
      porcentaje: Math.round((val.presentes / val.total) * 100),
      presentes: val.presentes,
      total: val.total,
    }))
}