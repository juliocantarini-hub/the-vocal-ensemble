import { useState, useRef, useEffect } from 'react'

// ─── Helpers para construir URLs de Google Drive ──────────────────────────────
export function driveUrlPDF(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`
}
export function driveUrlAudio(fileId) {
  return `https://drive.google.com/uc?export=open&id=${fileId}`
}
export function driveUrlDescarga(fileId) {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

// ─── Visor de PDF desde Drive ─────────────────────────────────────────────────
export function DriveVisor({ fileId, titulo = 'Partitura' }) {
  const [estado, setEstado] = useState('cargando') // cargando | ok | error

  if (!fileId) {
    return (
      <div style={estilos.vacio}>
        <IconDoc />
        <p style={estilos.vaciTxt}>Partitura no disponible todavía.</p>
      </div>
    )
  }

  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #E8E6DF' }}>
      {estado === 'cargando' && (
        <div style={{ ...estilos.vacio, height: '80px' }}>
          <Spinner color="#0F6E56" />
          <p style={{ fontSize: '12px', color: '#888780', marginTop: '8px' }}>Cargando partitura...</p>
        </div>
      )}
      {estado === 'error' && (
        <div style={estilos.vacio}>
          <p style={{ fontSize: '13px', color: '#A32D2D' }}>
            No se pudo cargar la partitura.
          </p>
          <a
            href={driveUrlPDF(fileId)}
            target="_blank"
            rel="noopener noreferrer"
            style={estilos.linkBtn}
          >
            Abrir en Drive →
          </a>
        </div>
      )}
      <iframe
        src={driveUrlPDF(fileId)}
        title={titulo}
        width="100%"
        height="520px"
        allow="autoplay"
        style={{
          border: 'none',
          display: estado === 'error' ? 'none' : 'block',
        }}
        onLoad={() => setEstado('ok')}
        onError={() => setEstado('error')}
      />
      {estado === 'ok' && (
        <div style={estilos.pdfFooter}>
          <a
            href={driveUrlPDF(fileId)}
            target="_blank"
            rel="noopener noreferrer"
            style={estilos.linkBtn}
          >
            Abrir en pestaña nueva ↗
          </a>
          <a
            href={driveUrlDescarga(fileId)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...estilos.linkBtn, color: '#5F5E5A' }}
          >
            Descargar PDF
          </a>
        </div>
      )}
    </div>
  )
}

// ─── Reproductor de audio desde Drive ────────────────────────────────────────
export function AudioPlayer({ fileId, nombre, destacado = false }) {
  const audioRef            = useRef(null)
  const [playing, setPlaying]   = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [duracion, setDuracion] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState(false)

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      setCargando(true)
      audio.play()
        .then(() => { setPlaying(true); setCargando(false) })
        .catch(() => { setError(true); setCargando(false) })
    }
  }

  function handleTimeUpdate() {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    setProgreso((audio.currentTime / audio.duration) * 100)
  }

  function handleLoadedMetadata() {
    setDuracion(audioRef.current?.duration || 0)
  }

  function handleEnded() {
    setPlaying(false)
    setProgreso(0)
  }

  function handleBarClick(e) {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = (e.clientX - rect.left) / rect.width
    audio.currentTime = pct * audio.duration
    setProgreso(pct * 100)
  }

  function formatTime(s) {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec < 10 ? '0' : ''}${sec}`
  }

  if (!fileId) {
    return (
      <div style={{ ...estilos.audioRow, opacity: 0.45 }}>
        <div style={estilos.playBtn(false, false)}>
          <IconPlay />
        </div>
        <div style={{ flex: 1 }}>
          <div style={estilos.audioNombre(false)}>{nombre}</div>
          <div style={estilos.barraWrap}>
            <div style={estilos.barra}><div style={estilos.barraFill(0)} /></div>
          </div>
        </div>
        <span style={estilos.duracion}>No disponible</span>
      </div>
    )
  }

  return (
    <div style={estilos.audioRow}>
      <audio
        ref={audioRef}
        src={driveUrlAudio(fileId)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      <button
        onClick={togglePlay}
        style={estilos.playBtn(playing, destacado)}
        title={playing ? 'Pausar' : 'Reproducir'}
      >
        {cargando ? <Spinner color="white" size={12} /> : playing ? <IconPause /> : <IconPlay />}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={estilos.audioNombre(destacado)}>{nombre}</div>
        {error ? (
          <p style={{ fontSize: '11px', color: '#A32D2D', margin: '3px 0 0' }}>
            No se pudo cargar. Intentá abrirlo en Drive directamente.
          </p>
        ) : (
          <div style={estilos.barraWrap} onClick={handleBarClick}>
            <div style={estilos.barra}>
              <div style={estilos.barraFill(progreso)} />
            </div>
          </div>
        )}
      </div>

      <span style={estilos.duracion}>
        {playing || progreso > 0
          ? formatTime(audioRef.current?.currentTime)
          : formatTime(duracion)
        }
      </span>

      {fileId && (
        <a
          href={driveUrlAudio(fileId)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#B4B2A9', fontSize: '11px', marginLeft: '4px', textDecoration: 'none' }}
          title="Abrir en Drive"
        >
          ↗
        </a>
      )}
    </div>
  )
}

// ─── Lista completa de audios de una obra ─────────────────────────────────────
export function ListaAudios({ obra, vozUsuario }) {
  const audios = [
    { key: 'drive_audio_general',   nombre: 'Audio general',   voz: null },
    { key: 'drive_audio_soprano',   nombre: 'Soprano',         voz: 'soprano' },
    { key: 'drive_audio_contralto', nombre: 'Contralto',       voz: 'contralto' },
    { key: 'drive_audio_tenor',     nombre: 'Tenor',           voz: 'tenor' },
    { key: 'drive_audio_bajo',      nombre: 'Bajo',            voz: 'bajo' },
  ]

  const disponibles = audios.filter(a => obra[a.key])
  if (disponibles.length === 0) {
    return (
      <div style={estilos.vacio}>
        <p style={estilos.vaciTxt}>No hay audios disponibles todavía.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {audios.map(audio => (
        <AudioPlayer
          key={audio.key}
          fileId={obra[audio.key]}
          nombre={audio.nombre}
          destacado={audio.voz === vozUsuario}
        />
      ))}
    </div>
  )
}

// ─── Iconos ───────────────────────────────────────────────────────────────────
function IconPlay() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>
  )
}
function IconPause() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  )
}
function IconDoc() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#D3D1C7">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 16h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V8z"/>
    </svg>
  )
}
function Spinner({ color = '#0F6E56', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  )
}

// ─── Estilos compartidos ──────────────────────────────────────────────────────
const estilos = {
  vacio: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '32px 16px', gap: '10px',
    background: '#F8F7F3', borderRadius: '10px',
    border: '1px solid #E8E6DF',
  },
  vaciTxt: { fontSize: '13px', color: '#888780', margin: 0 },
  pdfFooter: {
    display: 'flex', gap: '12px', padding: '10px 14px',
    background: '#F8F7F3', borderTop: '1px solid #E8E6DF',
  },
  linkBtn: {
    fontSize: '12px', color: '#0F6E56', fontWeight: '500',
    textDecoration: 'none', padding: '4px 0',
  },
  audioRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid #F1EFE8',
  },
  playBtn: (playing, destacado) => ({
    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
    background: destacado ? '#D85A30' : playing ? '#0F6E56' : '#1D9E75',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', transition: 'background 0.15s',
  }),
  audioNombre: (destacado) => ({
    fontSize: '13px', fontWeight: destacado ? '600' : '400',
    color: destacado ? '#D85A30' : '#1A1A18',
    marginBottom: '4px',
  }),
  barraWrap: { cursor: 'pointer', padding: '4px 0' },
  barra: {
    height: '3px', background: '#E8E6DF', borderRadius: '2px', overflow: 'hidden',
  },
  barraFill: (pct) => ({
    height: '100%', width: `${pct}%`,
    background: '#1D9E75', borderRadius: '2px',
    transition: 'width 0.1s linear',
  }),
  duracion: { fontSize: '11px', color: '#B4B2A9', flexShrink: 0, minWidth: '32px', textAlign: 'right' },
}
