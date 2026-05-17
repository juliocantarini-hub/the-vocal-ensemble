import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { PresenciaProvider } from './hooks/usePresencia'
import RutaProtegida from './components/RutaProtegida'
import AppLayout from './components/layout/AppLayout'

// Auth
import Login               from './pages/auth/Login'
import Registro            from './pages/auth/Registro'
import RecuperarContrasena from './pages/auth/RecuperarContrasena'
import ResetContrasena     from './pages/auth/ResetContrasena'

// Cantante
import Inicio          from './pages/Inicio'
import Repertorio      from './pages/repertorio/Repertorio'
import ObraDetalle     from './pages/repertorio/ObraDetalle'
import Calendario      from './pages/calendario/Calendario'
import EventoDetalle   from './pages/calendario/EventoDetalle'
import Avisos          from './pages/avisos/Avisos'
import { Blog, ArticuloDetalle } from './pages/blog/Blog'
import Perfil          from './pages/perfil/Perfil' 
import MisCompaneros   from './pages/cantantes/MisCompaneros' 
import MiAsistencia    from './pages/asistencia/MiAsistencia' 
import AsistenciaAdmin from './pages/admin/AsistenciaAdmin'

// Admin
import AdminDashboard  from './pages/admin/AdminDashboard'
import Usuarios        from './pages/admin/Usuarios'
import ObrasLista      from './pages/admin/ObrasLista'
import ObraForm        from './pages/admin/ObraForm'
import EventosLista    from './pages/admin/EventosLista'
import EventoForm      from './pages/admin/EventoForm'
import { AvisosAdmin } from './pages/admin/AvisosAdmin'
import { ArticulosAdmin, ArticuloForm } from './pages/admin/ArticulosAdmin'
import EstudioAdmin    from './pages/admin/EstudioAdmin'

function RutaPublica({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (usuario)  return <Navigate to="/" replace />
  return children
}

function AppConLayout() {
  const { usuario, cargando } = useAuth()
  if (cargando || !usuario) return null
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
        <Route path="/repertorio" element={<RutaProtegida><Repertorio /></RutaProtegida>} />
        <Route path="/repertorio/:id" element={<RutaProtegida><ObraDetalle /></RutaProtegida>} />
        <Route path="/calendario" element={<RutaProtegida><Calendario /></RutaProtegida>} />
        <Route path="/calendario/:id" element={<RutaProtegida><EventoDetalle /></RutaProtegida>} />
        <Route path="/avisos" element={<RutaProtegida><Avisos /></RutaProtegida>} />
        <Route path="/blog" element={<RutaProtegida><Blog /></RutaProtegida>} />
        <Route path="/blog/:id" element={<RutaProtegida><ArticuloDetalle /></RutaProtegida>} />
        <Route path="/asistencia" element={<RutaProtegida><MiAsistencia /></RutaProtegida>} />
        <Route path="/companeros" element={<RutaProtegida><MisCompaneros /></RutaProtegida>} />
        <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
        <Route path="/admin" element={<RutaProtegida rolesPermitidos={['admin','director']}><AdminDashboard /></RutaProtegida>} />
        <Route path="/admin/usuarios" element={<RutaProtegida rolesPermitidos={['admin','director']}><Usuarios /></RutaProtegida>} />
        <Route path="/admin/obras" element={<RutaProtegida rolesPermitidos={['admin','director']}><ObrasLista /></RutaProtegida>} />
        <Route path="/admin/obras/nueva" element={<RutaProtegida rolesPermitidos={['admin','director']}><ObraForm /></RutaProtegida>} />
        <Route path="/admin/obras/:id" element={<RutaProtegida rolesPermitidos={['admin','director']}><ObraForm /></RutaProtegida>} />
        <Route path="/admin/eventos" element={<RutaProtegida rolesPermitidos={['admin','director']}><EventosLista /></RutaProtegida>} />
        <Route path="/admin/eventos/nuevo" element={<RutaProtegida rolesPermitidos={['admin','director']}><EventoForm /></RutaProtegida>} />
        <Route path="/admin/eventos/:id" element={<RutaProtegida rolesPermitidos={['admin','director']}><EventoForm /></RutaProtegida>} />
        <Route path="/admin/asistencia" element={<RutaProtegida rolesPermitidos={['admin','director']}><AsistenciaAdmin /></RutaProtegida>} />
        <Route path="/admin/avisos" element={<RutaProtegida rolesPermitidos={['admin','director']}><AvisosAdmin /></RutaProtegida>} />
        <Route path="/admin/blog" element={<RutaProtegida rolesPermitidos={['admin','director']}><ArticulosAdmin /></RutaProtegida>} />
        <Route path="/admin/blog/nuevo" element={<RutaProtegida rolesPermitidos={['admin','director']}><ArticuloForm /></RutaProtegida>} />
        <Route path="/admin/blog/:id" element={<RutaProtegida rolesPermitidos={['admin','director']}><ArticuloForm /></RutaProtegida>} />
        <Route path="/admin/estudio" element={<RutaProtegida rolesPermitidos={['admin','director']}><EstudioAdmin /></RutaProtegida>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}

function ConPresencia({ children }) {
  const { perfil } = useAuth()
  return <PresenciaProvider perfil={perfil}>{children}</PresenciaProvider>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConPresencia>
          <Routes>
            <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
            <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />
            <Route path="/recuperar" element={<RutaPublica><RecuperarContrasena /></RutaPublica>} />
            <Route path="/reset-password" element={<ResetContrasena />} />
            <Route path="*" element={<AppConLayout />} />
          </Routes>
        </ConPresencia>
      </AuthProvider>
    </BrowserRouter>
  )
}
