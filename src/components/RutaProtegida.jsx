import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Pantalla de carga mientras se verifica la sesión
function Cargando() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F1EFE8',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid #E1F5EE',
        borderTopColor: '#0F6E56',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <p style={{ fontSize: '13px', color: '#888780', margin: 0 }}>
        Cargando...
      </p>
    </div>
  )
}

// Pantalla de acceso denegado (usuario autenticado pero sin el rol necesario)
function AccesoDenegado() {
  const { cerrarSesion } = useAuth()
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F1EFE8',
      padding: '24px',
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '40px 32px',
        maxWidth: '400px',
        textAlign: 'center',
        border: '1px solid #E8E6DF',
      }}>
        <div style={{
          width: '56px', height: '56px',
          background: '#FCEBEB',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#A32D2D">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
          </svg>
        </div>
        <h2 style={{
          fontFamily: 'Georgia, serif', fontSize: '20px',
          fontWeight: 'normal', color: '#1A1A18', margin: '0 0 10px',
        }}>
          Acceso restringido
        </h2>
        <p style={{ fontSize: '14px', color: '#5F5E5A', lineHeight: '1.6', margin: '0 0 24px' }}>
          No tenés permiso para ver esta sección.
          Si creés que es un error, contactá a la administración del coro.
        </p>
        <button
          onClick={cerrarSesion}
          style={{
            background: 'none',
            border: '1px solid #D3D1C7',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '13px',
            color: '#5F5E5A',
            cursor: 'pointer',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

/**
 * RutaProtegida — envuelve cualquier página que requiera autenticación.
 *
 * Props:
 *   children         — el componente a renderizar si el acceso está permitido
 *   rolesPermitidos  — array de roles ['admin', 'director', 'cantante']
 *                      si se omite, cualquier usuario autenticado puede acceder
 *
 * Ejemplo de uso en App.jsx:
 *   <RutaProtegida rolesPermitidos={['admin', 'director']}>
 *     <AdminDashboard />
 *   </RutaProtegida>
 */
export default function RutaProtegida({ children, rolesPermitidos }) {
  const { usuario, perfil, cargando } = useAuth()
  const location = useLocation()

  // Mientras verifica la sesión, mostrar pantalla de carga
  if (cargando) return <Cargando />

  // Sin sesión → redirigir al login guardando la ruta destino
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Con sesión pero sin perfil cargado aún → esperar
  if (!perfil) return <Cargando />

  // Si se especificaron roles y el usuario no los tiene → acceso denegado
  if (rolesPermitidos && !rolesPermitidos.includes(perfil.rol)) {
    return <AccesoDenegado />
  }

  return children
}
