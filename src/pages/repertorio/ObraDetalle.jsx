import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useObra, marcarProgreso } from '../../hooks/useObras'
import { useAuth } from '../../hooks/useAuth'
import { DriveVisor, ListaAudios } from '../../components/drive/DriveComponents'

const TABS = ['partitura', 'audios', 'notas']

const PROGRESO_OPTS = [
  { valor: 'pendiente',    label: 'Pendiente',   color: '#888780', bg: '#F1EFE8' },
  { valor: 'en_progreso',  label: 'En progreso', color: '#D85A30', bg: '#FAECE7' },
  { valor: 'estudiada',    label: 'Estudiada ✓', color: '#27500A', bg: '#EAF3DE' },
]

export default function ObraDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario, perfil } = useAuth()
  const { obra, cargando, error } = useObra(id)
  const [tabActiva, setTabActiva] = useState('partitura')
  const [progreso, setProgreso] = useState(null) // null = usar el de la obra
  const [guardando, setGuardando] = useState(false)
  const [mensajeGuardado, setMensajeGuardado] = useState('')

  const progresoActual = progreso ?? obra?.progreso ?? 'pendiente'
  const opcionProgreso = PROGRESO_OPTS.find(p => p.valor === progresoActual) || PROGRESO_OPTS[0]

  async function cambiarProgreso(nuevoEstado) {
    if (!usuario || guardando) return
    setGuardando(true)
    const { ok } = await marcarProgreso(usuario.id, id, nuevoEstado)
    if (ok) {
      setProgreso(nuevoEstado)
      setMensajeGuardado('Guardado')
      setTimeout(() => setMensajeGuardado(''), 2000)
    }
    setGuardando(false)
  }

  // ── Cargando ─────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div>
        <div style={{ height: '24px', width: '120px', background: '#F1EFE8', borderRadius: '6px', marginBottom: '20px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '60px', background: '#F1EFE8', borderRadius: '10px', marginBottom: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '400px', background: '#F1EFE8', borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !obra) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ color: '#A32D2D', marginBottom: '16px' }}>
          {error || 'No encontramos esta obra.'}
        </p>
        <button onClick={() => navigate('/repertorio')}
          style={{ color: '#0F6E56', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
          ← Volver al repertorio
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Volver */}
      <button
        onClick={() => navigate('/repertorio')}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          color: '#888780', background: 'none', border: 'none',
          cursor: 'pointer', fontSize: '13px', marginBottom: '16px', padding: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Volver al repertorio
      </button>

      {/* Cabecera de la obra */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E8E6DF',
        borderRadius: '12px', padding: '20px', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{
              fontFamily: 'Georgia, serif', fontSize: '22px',
              fontWeight: 'normal', color: '#1A1A18', margin: '0 0 4px',
            }}>
              {obra.titulo}
            </h2>
            <p style={{ fontSize: '14px', color: '#888780', margin: '0 0 10px' }}>
              {obra.compositor || 'Compositor desconocido'}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <EstadoBadge estado={obra.estado} />
              {obra.eventos?.length > 0 && (
                <span style={{ fontSize: '12px', color: '#888780' }}>
                  Evento: {obra.eventos[0].titulo}
                </span>
              )}
            </div>
          </div>

          {/* Selector de progreso */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '11px', color: '#B4B2A9', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Mi progreso
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {PROGRESO_OPTS.map(op => (
                <button
                  key={op.valor}
                  onClick={() => cambiarProgreso(op.valor)}
                  disabled={guardando}
                  style={{
                    padding: '5px 10px', borderRadius: '6px', fontSize: '11px',
                    cursor: guardando ? 'not-allowed' : 'pointer',
                    border: `1px solid ${progresoActual === op.valor ? op.color : '#D3D1C7'}`,
                    background: progresoActual === op.valor ? op.bg : 'none',
                    color: progresoActual === op.valor ? op.color : '#888780',
                    fontWeight: progresoActual === op.valor ? '600' : '400',
                    transition: 'all 0.12s',
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
            {mensajeGuardado && (
              <span style={{ fontSize: '11px', color: '#639922' }}>✓ {mensajeGuardado}</span>
            )}
          </div>
        </div>

        {/* Descripción si existe */}
        {obra.descripcion && (
          <p style={{ fontSize: '13px', color: '#5F5E5A', margin: '14px 0 0', lineHeight: '1.6', borderTop: '1px solid #F1EFE8', paddingTop: '12px' }}>
            {obra.descripcion}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '14px', borderBottom: '1px solid #E8E6DF' }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setTabActiva(tab)}
            style={{
              padding: '8px 18px', fontSize: '13px', cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: `2px solid ${tabActiva === tab ? '#0F6E56' : 'transparent'}`,
              color: tabActiva === tab ? '#0F6E56' : '#888780',
              fontWeight: tabActiva === tab ? '500' : '400',
              transition: 'all 0.12s',
              textTransform: 'capitalize',
              marginBottom: '-1px',
            }}
          >
            {tab === 'partitura' ? 'Partitura' : tab === 'audios' ? 'Audios' : 'Notas del director'}
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '12px', padding: '20px' }}>

        {/* Tab: Partitura */}
        {tabActiva === 'partitura' && (
          <DriveVisor fileId={obra.drive_partitura_id} titulo={obra.titulo} />
        )}

        {/* Tab: Audios */}
        {tabActiva === 'audios' && (
          <div>
            {perfil?.voz && (
              <div style={{
                background: '#FAECE7', border: '1px solid #F0C5B4',
                borderRadius: '8px', padding: '8px 12px',
                fontSize: '12px', color: '#712B13', marginBottom: '14px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#D85A30">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                El audio de tu voz ({perfil.voz}) está resaltado en naranja.
              </div>
            )}
            <ListaAudios obra={obra} vozUsuario={perfil?.voz} />
          </div>
        )}

        {/* Tab: Notas del director */}
        {tabActiva === 'notas' && (
          obra.notas_director ? (
            <div>
              <div style={{
                background: '#FAECE7', borderLeft: '3px solid #D85A30',
                borderRadius: '0 8px 8px 0', padding: '14px 16px',
                fontSize: '14px', color: '#3D1608', lineHeight: '1.7',
                fontStyle: 'italic',
              }}>
                "{obra.notas_director}"
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: '#888780' }}>
              <p style={{ fontSize: '13px' }}>El director no ha dejado notas para esta obra todavía.</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

function EstadoBadge({ estado }) {
  const map = {
    estudio:   { bg: '#E1F5EE', color: '#04342C', txt: 'En estudio' },
    activo:    { bg: '#EAF3DE', color: '#27500A', txt: 'Activo' },
    concierto: { bg: '#FAECE7', color: '#712B13', txt: 'Próximo concierto' },
    archivado: { bg: '#F1EFE8', color: '#888780', txt: 'Archivado' },
  }
  const b = map[estado] || map.archivado
  return (
    <span style={{
      background: b.bg, color: b.color, fontSize: '11px',
      fontWeight: '600', padding: '3px 10px', borderRadius: '10px',
    }}>
      {b.txt}
    </span>
  )
}
