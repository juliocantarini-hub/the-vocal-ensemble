import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'

function useEsMovil() {
  const [esMovil, setEsMovil] = useState(window.innerWidth <= 768)
  useEffect(() => {
    const fn = () => setEsMovil(window.innerWidth <= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return esMovil
}

export default function AppLayout({ children }) {
  const esMovil = useEsMovil()
  const [abierto, setAbierto] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1EFE8' }}>

      {/* Overlay solo en móvil cuando está abierto */}
      {esMovil && abierto && (
        <div
          onClick={() => setAbierto(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar — en móvil solo se muestra si está abierto */}
      {(!esMovil || abierto) && (
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          zIndex: 50,
        }}>
          <Sidebar
            seccionAdmin={false}
            toggleAdmin={() => {}}
            onCerrar={() => setAbierto(false)}
          />
        </div>
      )}

      {/* Botón hamburguesa — solo en móvil */}
      {esMovil && (
        <button
          onClick={() => setAbierto(v => !v)}
          style={{
            position: 'fixed', top: '12px', left: '12px',
            zIndex: 60,
            width: '40px', height: '40px',
            borderRadius: '10px',
            background: '#0F6E56',
            border: 'none', cursor: 'pointer',
            display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            {abierto
              ? <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              : <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            }
          </svg>
        </button>
      )}

      {/* Contenido */}
      <main style={{
        marginLeft: esMovil ? 0 : '210px',
        padding: esMovil ? '60px 16px 24px' : '28px 32px',
        flex: 1,
        minHeight: '100vh',
        width: esMovil ? '100%' : 'auto',
      }}>
        {children}
      </main>

    </div>
  )
}