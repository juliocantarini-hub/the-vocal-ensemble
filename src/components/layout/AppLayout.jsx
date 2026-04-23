import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  const location = useLocation()
  const [seccionAdmin, setSeccionAdmin] = useState(
    location.pathname.startsWith('/admin')
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F1EFE8' }}>
      <Sidebar seccionAdmin={seccionAdmin} toggleAdmin={setSeccionAdmin} />
      <main style={{
        marginLeft: '210px',
        flex: 1,
        padding: '28px 32px',
        maxWidth: '900px',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}
