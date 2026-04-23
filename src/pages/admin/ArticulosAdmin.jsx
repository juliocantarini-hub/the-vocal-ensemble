import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  crearArticulo, actualizarArticulo, publicarArticulo,
  eliminarArticulo, useArticulosAdmin, CATEGORIAS, CATEGORIA_COLOR
} from '../../hooks/useBlog'

// ─── Lista de artículos admin ─────────────────────────────────────────────────
export function ArticulosAdmin() {
  const navigate = useNavigate()
  const { articulos, cargando, recargar } = useArticulosAdmin()
  const [procesando, setProcesando] = useState(null)
  const [confirmEliminar, setConfirmEliminar] = useState(null)

  async function togglePublicar(art) {
    setProcesando(art.id)
    await publicarArticulo(art.id, !art.publicado)
    await recargar()
    setProcesando(null)
  }

  async function toggleDestacado(art) {
    setProcesando(art.id)
    await supabase.from('articulos').update({ destacado: !art.destacado }).eq('id', art.id)
    await recargar()
    setProcesando(null)
  }

  async function handleEliminar(id) {
    setProcesando(id)
    await eliminarArticulo(id)
    setConfirmEliminar(null)
    await recargar()
    setProcesando(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 'normal', color: '#1A1A18', margin: '0 0 2px' }}>Gestión del blog</h2>
          <p style={{ fontSize: '12px', color: '#888780', margin: 0 }}>
            {cargando ? 'Cargando...' : `${articulos.length} artículo${articulos.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => navigate('/admin/blog/nuevo')}
          style={{ background: '#0F6E56', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Nuevo artículo
        </button>
      </div>

      {cargando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '64px', background: '#F1EFE8', borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        </div>
      )}

      {!cargando && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 80px 100px', padding: '10px 16px', background: '#F8F7F3', borderBottom: '1px solid #E8E6DF', fontSize: '11px', fontWeight: '600', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            <span>Artículo</span><span>Categoría</span><span>Autor</span>
            <span style={{ textAlign: 'center' }}>Destacado</span>
            <span style={{ textAlign: 'center' }}>Publicado</span>
            <span style={{ textAlign: 'right' }}>Acciones</span>
          </div>

          {articulos.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#888780', fontSize: '13px' }}>No hay artículos. Creá el primero.</div>
          )}

          {articulos.map((art, i) => {
            const cc = CATEGORIA_COLOR[art.categoria] || { bg: '#F1EFE8', color: '#5F5E5A' }
            const catLabel = CATEGORIAS.find(c => c.valor === art.categoria)?.label || '—'
            return (
              <div key={art.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px 80px 100px',
                padding: '12px 16px', alignItems: 'center',
                borderBottom: i < articulos.length - 1 ? '1px solid #F1EFE8' : 'none',
                opacity: procesando === art.id ? 0.5 : 1,
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A18' }}>{art.titulo}</div>
                  <div style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>
                    {new Date(art.creado_en).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <span style={{ background: cc.bg, color: cc.color, fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '10px', display: 'inline-block' }}>{catLabel}</span>
                <span style={{ fontSize: '12px', color: '#888780' }}>{art.perfiles?.nombre?.split(' ')[0] || '—'}</span>
                {/* Toggle destacado */}
                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => toggleDestacado(art)} disabled={!!procesando}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: art.destacado ? 1 : 0.3 }} title={art.destacado ? 'Quitar destacado' : 'Marcar como destacado'}>
                    ⭐
                  </button>
                </div>
                {/* Toggle publicado */}
                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => togglePublicar(art)} disabled={!!procesando}
                    style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: art.publicado ? '#0F6E56' : '#D3D1C7', position: 'relative', transition: 'background 0.2s' }}>
                    <span style={{ position: 'absolute', top: '3px', left: art.publicado ? '22px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#FFFFFF', transition: 'left 0.2s' }} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button onClick={() => navigate(`/admin/blog/${art.id}`)}
                    style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', color: '#0F6E56', fontWeight: '500' }}>
                    Editar
                  </button>
                  <button onClick={() => setConfirmEliminar(art)}
                    style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #F0C5B4', background: 'none', cursor: 'pointer', color: '#A32D2D' }}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {confirmEliminar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '28px 24px', maxWidth: '360px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'normal', margin: '0 0 10px' }}>Eliminar artículo</h3>
            <p style={{ fontSize: '14px', color: '#5F5E5A', margin: '0 0 24px' }}>
              ¿Eliminás <strong>"{confirmEliminar.titulo}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setConfirmEliminar(null)} style={{ flex: 1, height: '40px', borderRadius: '8px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', fontSize: '13px' }}>Cancelar</button>
              <button onClick={() => handleEliminar(confirmEliminar.id)} style={{ flex: 1, height: '40px', borderRadius: '8px', border: 'none', background: '#A32D2D', color: '#FFFFFF', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Formulario de artículo ───────────────────────────────────────────────────
export function ArticuloForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const esEdicion = !!id
  const [form, setForm] = useState({ titulo: '', resumen: '', contenido: '', categoria: 'tecnica', destacado: false })
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState('')
  const [publicado, setPublicado] = useState(false)

  useEffect(() => {
    if (!esEdicion) return
    supabase.from('articulos').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      setForm({ titulo: data.titulo || '', resumen: data.resumen || '', contenido: data.contenido || '', categoria: data.categoria || 'tecnica', destacado: data.destacado || false })
      setPublicado(data.publicado || false)
      setCargando(false)
    })
  }, [id, esEdicion])

  function set(campo) { return e => setForm(f => ({ ...f, [campo]: e.target.value })) }

  async function guardar(publicar) {
    setErrorGlobal('')
    if (!form.titulo.trim()) { setErrores({ titulo: 'El título es obligatorio.' }); return }
    setGuardando(true)
    const datos = { titulo: form.titulo.trim(), resumen: form.resumen.trim() || null, contenido: form.contenido.trim() || null, categoria: form.categoria, destacado: form.destacado }
    if (publicar) datos.publicado = true
    const { ok, data, error } = esEdicion ? await actualizarArticulo(id, datos) : await crearArticulo(datos)
    if (!ok) { setErrorGlobal(error); setGuardando(false); return }
    if (publicar && !esEdicion && data?.id) await publicarArticulo(data.id, true)
    setGuardando(false)
    navigate('/admin/blog')
  }

  if (cargando) return <div style={{ padding: '40px', textAlign: 'center', color: '#888780' }}>Cargando...</div>

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/admin/blog')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888780', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Volver
        </button>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 'normal', color: '#1A1A18', margin: 0 }}>
          {esEdicion ? 'Editar artículo' : 'Nuevo artículo'}
        </h2>
      </div>

      {errorGlobal && <div style={{ background: '#FCEBEB', border: '1px solid #E24B4A', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#501313', marginBottom: '16px' }}>{errorGlobal}</div>}

      <Campo label="Título *" error={errores.titulo}>
        <input value={form.titulo} onChange={set('titulo')} placeholder="Título del artículo" style={inputStyle} autoFocus />
      </Campo>

      <Campo label="Categoría">
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CATEGORIAS.filter(c => c.valor).map(c => {
            const cc = CATEGORIA_COLOR[c.valor] || { bg: '#F1EFE8', color: '#5F5E5A' }
            return (
              <button key={c.valor} type="button" onClick={() => setForm(f => ({ ...f, categoria: c.valor }))}
                style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: `1.5px solid ${form.categoria === c.valor ? cc.color : '#D3D1C7'}`, background: form.categoria === c.valor ? cc.bg : '#FFFFFF', color: form.categoria === c.valor ? cc.color : '#5F5E5A', fontWeight: form.categoria === c.valor ? '500' : '400' }}>
                {c.label}
              </button>
            )
          })}
        </div>
      </Campo>

      <Campo label="Resumen (se muestra en la lista)">
        <textarea value={form.resumen} onChange={set('resumen')} placeholder="Breve descripción del artículo..." rows={2} style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }} />
      </Campo>

      <Campo label="Contenido">
        <textarea value={form.contenido} onChange={set('contenido')} placeholder="Escribí el contenido del artículo aquí..." rows={12} style={{ ...inputStyle, height: 'auto', padding: '12px', resize: 'vertical', lineHeight: '1.6' }} />
      </Campo>

      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 0', marginBottom: '16px' }}>
        <input type="checkbox" checked={form.destacado} onChange={e => setForm(f => ({ ...f, destacado: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#0F6E56' }} />
        <span style={{ fontSize: '13px', color: '#1A1A18' }}>Marcar como artículo destacado</span>
      </label>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => guardar(false)} disabled={guardando} style={{ flex: 1, height: '42px', borderRadius: '8px', border: '1px solid #D3D1C7', background: '#FFFFFF', color: '#1A1A18', fontSize: '14px', cursor: 'pointer' }}>
          {guardando ? 'Guardando...' : 'Guardar borrador'}
        </button>
        <button onClick={() => guardar(true)} disabled={guardando} style={{ flex: 2, height: '42px', borderRadius: '8px', border: 'none', background: guardando ? '#9FE1CB' : '#0F6E56', color: '#FFFFFF', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>
          {guardando ? 'Publicando...' : publicado ? 'Guardar y publicar' : 'Publicar'}
        </button>
      </div>
    </div>
  )
}

function Campo({ label, error, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#5F5E5A', marginBottom: '5px' }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: '12px', color: '#A32D2D', margin: '4px 0 0' }}>{error}</p>}
    </div>
  )
}

const inputStyle = { width: '100%', height: '38px', border: '1px solid #D3D1C7', borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#1A1A18', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }
