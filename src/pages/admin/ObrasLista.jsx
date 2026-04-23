import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useObrasAdmin, publicarObra, eliminarObra } from '../../hooks/useObras'

const BADGE = {
  estudio:   { bg: '#E1F5EE', color: '#04342C', txt: 'En estudio' },
  activo:    { bg: '#EAF3DE', color: '#27500A', txt: 'Activo' },
  concierto: { bg: '#FAECE7', color: '#712B13', txt: 'Concierto' },
  archivado: { bg: '#F1EFE8', color: '#888780', txt: 'Archivado' },
}

function contarMateriales(obra) {
  const campos = ['drive_partitura_id','drive_audio_general','drive_audio_soprano','drive_audio_contralto','drive_audio_tenor','drive_audio_bajo']
  return campos.filter(c => !!obra[c]).length
}

export default function ObrasLista() {
  const navigate = useNavigate()
  const { obras, cargando, error, recargar } = useObrasAdmin()
  const [confirmEliminar, setConfirmEliminar] = useState(null)
  const [procesando, setProcesando] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const obrasFiltradas = obras.filter(o =>
    !busqueda ||
    o.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    o.compositor?.toLowerCase().includes(busqueda.toLowerCase())
  )

  async function togglePublicar(obra) {
    setProcesando(obra.id)
    await publicarObra(obra.id, !obra.publicada)
    await recargar()
    setProcesando(null)
  }

  async function handleEliminar(obraId) {
    setProcesando(obraId)
    await eliminarObra(obraId)
    setConfirmEliminar(null)
    await recargar()
    setProcesando(null)
  }

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 'normal', color: '#1A1A18', margin: '0 0 2px' }}>
            Gestión de obras
          </h2>
          <p style={{ fontSize: '12px', color: '#888780', margin: 0 }}>
            {cargando ? 'Cargando...' : `${obras.length} obra${obras.length !== 1 ? 's' : ''} en total`}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/obras/nueva')}
          style={{
            background: '#0F6E56', color: '#FFFFFF', border: 'none',
            borderRadius: '8px', padding: '8px 16px', fontSize: '13px',
            cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          Nueva obra
        </button>
      </div>

      {/* Búsqueda */}
      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '320px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#B4B2A9"
          style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }}>
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar obra..." style={{ width: '100%', height: '36px', border: '1px solid #D3D1C7', borderRadius: '8px', padding: '0 12px 0 32px', fontSize: '13px', outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FCEBEB', border: '1px solid #E24B4A', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#501313', marginBottom: '16px' }}>
          {error} <button onClick={recargar} style={{ color: '#A32D2D', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Reintentar</button>
        </div>
      )}

      {/* Skeleton */}
      {cargando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '64px', background: '#F1EFE8', borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        </div>
      )}

      {/* Tabla */}
      {!cargando && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 100px 100px', gap: '0', padding: '10px 16px', background: '#F8F7F3', borderBottom: '1px solid #E8E6DF', fontSize: '11px', fontWeight: '600', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            <span>Obra</span>
            <span>Estado</span>
            <span style={{ textAlign: 'center' }}>Archivos</span>
            <span style={{ textAlign: 'center' }}>Publicada</span>
            <span style={{ textAlign: 'right' }}>Acciones</span>
          </div>

          {obrasFiltradas.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#888780', fontSize: '13px' }}>
              {busqueda ? 'No hay obras que coincidan.' : 'Aún no hay obras. Creá la primera.'}
            </div>
          )}

          {obrasFiltradas.map((obra, i) => {
            const badge = BADGE[obra.estado] || BADGE.archivado
            const mats  = contarMateriales(obra)
            const esUltima = i === obrasFiltradas.length - 1
            return (
              <div key={obra.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 80px 100px 100px',
                gap: '0', padding: '12px 16px', alignItems: 'center',
                borderBottom: esUltima ? 'none' : '1px solid #F1EFE8',
                opacity: procesando === obra.id ? 0.5 : 1,
                transition: 'opacity 0.15s',
              }}>
                {/* Nombre */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A18' }}>{obra.titulo}</div>
                  <div style={{ fontSize: '11px', color: '#888780', marginTop: '2px' }}>{obra.compositor || '—'}</div>
                </div>

                {/* Estado */}
                <span style={{ background: badge.bg, color: badge.color, fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', display: 'inline-block' }}>
                  {badge.txt}
                </span>

                {/* Archivos */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: mats > 0 ? '#0F6E56' : '#B4B2A9', fontWeight: '500' }}>
                    {mats}/6
                  </span>
                </div>

                {/* Publicada toggle */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => togglePublicar(obra)}
                    disabled={!!procesando}
                    style={{
                      width: '44px', height: '24px', borderRadius: '12px',
                      border: 'none', cursor: procesando ? 'not-allowed' : 'pointer',
                      background: obra.publicada ? '#0F6E56' : '#D3D1C7',
                      position: 'relative', transition: 'background 0.2s',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '3px',
                      left: obra.publicada ? '22px' : '3px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: '#FFFFFF', transition: 'left 0.2s',
                    }} />
                  </button>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => navigate(`/admin/obras/${obra.id}`)}
                    style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', color: '#0F6E56', fontWeight: '500' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmEliminar(obra)}
                    style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #F0C5B4', background: 'none', cursor: 'pointer', color: '#A32D2D' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {confirmEliminar && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '24px',
        }}>
          <div style={{ background: '#FFFFFF', borderRadius: '14px', padding: '28px 24px', maxWidth: '360px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'normal', margin: '0 0 10px' }}>
              Eliminar obra
            </h3>
            <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.6', margin: '0 0 24px' }}>
              ¿Estás segura/o de que querés eliminar <strong>"{confirmEliminar.titulo}"</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setConfirmEliminar(null)}
                style={{ flex: 1, height: '40px', borderRadius: '8px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', fontSize: '13px' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(confirmEliminar.id)}
                style={{ flex: 1, height: '40px', borderRadius: '8px', border: 'none', background: '#A32D2D', color: '#FFFFFF', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
