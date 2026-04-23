import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  useAvisos, marcarLeido, marcarTodosLeidos,
  tiempoRelativo, TIPO_AVISO
} from '../../hooks/useAvisos'

const FILTROS = [
  { valor: '',         label: 'Todos' },
  { valor: 'material', label: 'Material' },
  { valor: 'horario',  label: 'Horarios' },
  { valor: 'evento',   label: 'Eventos' },
  { valor: 'blog',     label: 'Blog' },
  { valor: 'urgente',  label: 'Urgente' },
]

export default function Avisos() {
  const navigate       = useNavigate()
  const { perfil }     = useAuth()
  const [tipo, setTipo] = useState('')
  const [soloNoLeidos, setSoloNoLeidos] = useState(false)
  const { avisos, cargando, error, noLeidos, recargar } = useAvisos({ tipo: tipo || undefined })

  const avisosFiltrados = soloNoLeidos ? avisos.filter(a => !a.leido) : avisos

  async function handleMarcarLeido(aviso) {
    if (aviso.leido || !perfil) return
    await marcarLeido(aviso.id, perfil.id)
    recargar()
  }

  async function handleMarcarTodos() {
    if (!perfil) return
    const ids = avisos.filter(a => !a.leido).map(a => a.id)
    await marcarTodosLeidos(ids, perfil.id)
    recargar()
  }

  function irADestino(aviso) {
    if (aviso.obra_id)    navigate(`/repertorio/${aviso.obra_id}`)
    else if (aviso.evento_id) navigate(`/calendario/${aviso.evento_id}`)
  }

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'normal', color: '#1A1A18', margin: '0 0 2px' }}>
            Avisos
          </h2>
          <p style={{ fontSize: '13px', color: '#888780', margin: 0 }}>
            {noLeidos > 0
              ? <span style={{ color: '#D85A30', fontWeight: '500' }}>{noLeidos} sin leer</span>
              : 'Todo al día'
            }
          </p>
        </div>
        {noLeidos > 0 && (
          <button onClick={handleMarcarTodos}
            style={{ fontSize: '12px', color: '#0F6E56', background: '#E1F5EE', border: '1px solid #B4D8CE', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: '500' }}>
            Marcar todos como leídos
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {FILTROS.map(f => (
          <button key={f.valor} onClick={() => setTipo(f.valor)} style={{
            padding: '4px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
            border: `1px solid ${tipo === f.valor ? '#1D9E75' : '#D3D1C7'}`,
            background: tipo === f.valor ? '#E1F5EE' : 'none',
            color: tipo === f.valor ? '#04342C' : '#5F5E5A',
            fontWeight: tipo === f.valor ? '500' : '400',
          }}>
            {f.label}
          </button>
        ))}
        <button onClick={() => setSoloNoLeidos(v => !v)} style={{
          padding: '4px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
          border: `1px solid ${soloNoLeidos ? '#D85A30' : '#D3D1C7'}`,
          background: soloNoLeidos ? '#FAECE7' : 'none',
          color: soloNoLeidos ? '#712B13' : '#5F5E5A',
          fontWeight: soloNoLeidos ? '500' : '400',
          marginLeft: 'auto',
        }}>
          Solo no leídos
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FCEBEB', border: '1px solid #E24B4A', borderRadius: '8px', padding: '12px 14px', fontSize: '13px', color: '#501313', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          {error}
          <button onClick={recargar} style={{ background: 'none', border: 'none', color: '#A32D2D', cursor: 'pointer', fontWeight: '500', fontSize: '12px' }}>Reintentar</button>
        </div>
      )}

      {/* Skeleton */}
      {cargando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: '80px', background: '#F1EFE8', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        </div>
      )}

      {/* Vacío */}
      {!cargando && avisosFiltrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: '56px 24px', color: '#888780' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="#D3D1C7" style={{ marginBottom: '14px' }}>
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <p style={{ fontSize: '14px', margin: '0 0 8px' }}>
            {soloNoLeidos ? 'No tenés avisos sin leer.' : 'No hay avisos todavía.'}
          </p>
          {soloNoLeidos && (
            <button onClick={() => setSoloNoLeidos(false)} style={{ fontSize: '12px', color: '#0F6E56', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
              Ver todos los avisos
            </button>
          )}
        </div>
      )}

      {/* Lista */}
      {!cargando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {avisosFiltrados.map(aviso => {
            const tc = TIPO_AVISO[aviso.tipo] || TIPO_AVISO.material
            const tieneDestino = aviso.obra_id || aviso.evento_id

            return (
              <div
                key={aviso.id}
                onClick={() => handleMarcarLeido(aviso)}
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${aviso.leido ? '#E8E6DF' : '#B4D8CE'}`,
                  borderLeft: `3px solid ${aviso.leido ? '#E8E6DF' : tc.dot}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  cursor: aviso.leido ? 'default' : 'pointer',
                  transition: 'border-color 0.12s',
                  opacity: aviso.leido ? 0.75 : 1,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Tipo + no leído */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: tc.color, background: tc.bg, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        {tc.label}
                      </span>
                      {!aviso.leido && (
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: tc.dot, display: 'inline-block', flexShrink: 0 }} />
                      )}
                    </div>

                    {/* Título */}
                    <div style={{ fontSize: '14px', fontWeight: aviso.leido ? '400' : '500', color: '#1A1A18', marginBottom: '4px' }}>
                      {aviso.titulo}
                    </div>

                    {/* Cuerpo */}
                    {aviso.cuerpo && (
                      <p style={{ fontSize: '13px', color: '#5F5E5A', margin: '0 0 8px', lineHeight: '1.5' }}>
                        {aviso.cuerpo}
                      </p>
                    )}

                    {/* Acciones */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#B4B2A9' }}>
                        {tiempoRelativo(aviso.creado_en)}
                      </span>
                      {aviso.obras && (
                        <span style={{ fontSize: '11px', color: '#888780' }}>
                          · Obra: {aviso.obras.titulo}
                        </span>
                      )}
                      {aviso.eventos && (
                        <span style={{ fontSize: '11px', color: '#888780' }}>
                          · Evento: {aviso.eventos.titulo}
                        </span>
                      )}
                      {tieneDestino && (
                        <button
                          onClick={e => { e.stopPropagation(); irADestino(aviso) }}
                          style={{ fontSize: '12px', color: '#0F6E56', background: '#E1F5EE', border: 'none', padding: '3px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                        >
                          {aviso.obra_id ? 'Abrir obra →' : 'Ver evento →'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
