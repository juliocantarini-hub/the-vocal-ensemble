import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ─── Hook: artículos del blog ─────────────────────────────────────────────────
export function useArticulos(filtros = {}) {
  const [articulos, setArticulos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      let query = supabase
        .from('articulos')
        .select(`*, perfiles(nombre)`)
        .eq('publicado', true)
        .order('creado_en', { ascending: false })

      if (filtros.categoria) query = query.eq('categoria', filtros.categoria)
      if (filtros.busqueda) {
        query = query.or(
          `titulo.ilike.%${filtros.busqueda}%,resumen.ilike.%${filtros.busqueda}%`
        )
      }
      if (filtros.limite) query = query.limit(filtros.limite)

      const { data, error: err } = await query
      if (err) throw err
      setArticulos(data || [])
    } catch (err) {
      setError('No pudimos cargar el blog.')
      console.error(err)
    } finally {
      setCargando(false)
    }
  }, [filtros.categoria, filtros.busqueda, filtros.limite])

  useEffect(() => { cargar() }, [cargar])
  return { articulos, cargando, error, recargar: cargar }
}

// ─── Hook: artículo individual ────────────────────────────────────────────────
export function useArticulo(id) {
  const [articulo, setArticulo]   = useState(null)
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!id) return
    setCargando(true)
    supabase
      .from('articulos')
      .select(`*, perfiles(nombre)`)
      .eq('id', id)
      .eq('publicado', true)
      .single()
      .then(({ data, error: err }) => {
        if (err) { setError('Artículo no encontrado.'); setCargando(false); return }
        setArticulo(data)
        setCargando(false)
      })
  }, [id])

  return { articulo, cargando, error }
}

// ─── Hook: admin ──────────────────────────────────────────────────────────────
export function useArticulosAdmin() {
  const [articulos, setArticulos] = useState([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data, error: err } = await supabase
      .from('articulos')
      .select(`*, perfiles(nombre)`)
      .order('creado_en', { ascending: false })
    if (err) { setError(err.message); setCargando(false); return }
    setArticulos(data || [])
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])
  return { articulos, cargando, error, recargar: cargar }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────
export async function crearArticulo(datos) {
  const { data, error } = await supabase
    .from('articulos')
    .insert([{ ...datos, publicado: false }])
    .select()
    .single()
  return { ok: !error, data, error: error?.message }
}

export async function actualizarArticulo(id, datos) {
  const { data, error } = await supabase
    .from('articulos')
    .update(datos)
    .eq('id', id)
    .select()
    .single()
  return { ok: !error, data, error: error?.message }
}

export async function publicarArticulo(id, publicado) {
  const { error } = await supabase
    .from('articulos')
    .update({ publicado })
    .eq('id', id)
  return { ok: !error, error: error?.message }
}

export async function eliminarArticulo(id) {
  const { error } = await supabase.from('articulos').delete().eq('id', id)
  return { ok: !error, error: error?.message }
}

// ─── Categorías ───────────────────────────────────────────────────────────────
export const CATEGORIAS = [
  { valor: '',          label: 'Todas' },
  { valor: 'tecnica',   label: 'Técnica vocal' },
  { valor: 'estudio',   label: 'Estudio' },
  { valor: 'noticias',  label: 'Noticias' },
  { valor: 'formacion', label: 'Formación' },
  { valor: 'avisos',    label: 'Avisos institucionales' },
]

export const CATEGORIA_COLOR = {
  tecnica:   { bg: '#E1F5EE', color: '#04342C' },
  estudio:   { bg: '#E6F1FB', color: '#042C53' },
  noticias:  { bg: '#FAECE7', color: '#712B13' },
  formacion: { bg: '#F3EFF8', color: '#3D1C6E' },
  avisos:    { bg: '#F1EFE8', color: '#5F5E5A' },
}
