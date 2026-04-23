import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const ROLES  = ['cantante', 'director', 'admin']
const VOCES  = ['soprano', 'contralto', 'tenor', 'bajo']
const ESTADOS = ['activo', 'pausa', 'inactivo']

const ROL_BADGE = {
  cantante: { bg: '#E1F5EE', color: '#04342C' },
  director: { bg: '#FAECE7', color: '#712B13' },
  admin:    { bg: '#E6F1FB', color: '#042C53' },
}

export default function Usuarios() {
  const [usuarios, setUsuarios]   = useState([])
  const [cargando, setCargando]   = useState(true)
  const [busqueda, setBusqueda]   = useState('')
  const [editando, setEditando]   = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cargar = useCallback(async () => {
    setCargando(true)
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .order('nombre')
    setUsuarios(data || [])
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const filtrados = usuarios.filter(u =>
    !busqueda ||
    u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.voz?.toLowerCase().includes(busqueda.toLowerCase())
  )

  async function guardarEdicion() {
    if (!editando) return
    setGuardando(true)
    await supabase.from('perfiles')
      .update({ rol: editando.rol, voz: editando.voz, estado: editando.estado })
      .eq('id', editando.id)
    await cargar()
    setEditando(null)
    setGuardando(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 'normal', color: '#1A1A18', margin: '0 0 2px' }}>Usuarios</h2>
          <p style={{ fontSize: '12px', color: '#888780', margin: 0 }}>{cargando ? 'Cargando...' : `${usuarios.length} registrados`}</p>
        </div>
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o voz..."
          style={{ height: '34px', border: '1px solid #D3D1C7', borderRadius: '8px', padding: '0 12px', fontSize: '13px', outline: 'none', width: '220px' }} />
      </div>

      {cargando && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '56px', background: '#F1EFE8', borderRadius: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
        </div>
      )}

      {!cargando && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E6DF', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 80px 80px', padding: '10px 16px', background: '#F8F7F3', borderBottom: '1px solid #E8E6DF', fontSize: '11px', fontWeight: '600', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            <span>Cantante</span><span>Voz</span><span>Rol</span><span>Estado</span><span style={{ textAlign: 'right' }}>Editar</span>
          </div>

          {filtrados.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: '#888780', fontSize: '13px' }}>No hay usuarios que coincidan.</div>
          )}

          {filtrados.map((u, i) => {
            const rb = ROL_BADGE[u.rol] || ROL_BADGE.cantante
            return (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 80px 80px', padding: '11px 16px', alignItems: 'center', borderBottom: i < filtrados.length - 1 ? '1px solid #F1EFE8' : 'none' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A18' }}>{u.nombre || '—'}</div>
                <span style={{ fontSize: '12px', color: '#5F5E5A', textTransform: 'capitalize' }}>{u.voz || '—'}</span>
                <span style={{ background: rb.bg, color: rb.color, fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', textTransform: 'capitalize', display: 'inline-block' }}>{u.rol}</span>
                <span style={{ fontSize: '12px', color: u.estado === 'activo' ? '#27500A' : '#888780', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.estado === 'activo' ? '#639922' : '#B4B2A9', display: 'inline-block' }} />
                  {u.estado}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => setEditando({ ...u })}
                    style={{ padding: '4px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', color: '#0F6E56', fontWeight: '500' }}>
                    Editar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal editar usuario */}
      {editando && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px 24px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 'normal', margin: '0 0 6px' }}>{editando.nombre}</h3>
            <p style={{ fontSize: '12px', color: '#888780', margin: '0 0 20px' }}>Modificar rol, voz y estado</p>

            <CampoEditar label="Voz">
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {VOCES.map(v => (
                  <Chip key={v} activo={editando.voz === v} onClick={() => setEditando(e => ({ ...e, voz: v }))}>{v}</Chip>
                ))}
              </div>
            </CampoEditar>

            <CampoEditar label="Rol">
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {ROLES.map(r => (
                  <Chip key={r} activo={editando.rol === r} color={r === 'admin' ? '#042C53' : r === 'director' ? '#712B13' : '#04342C'}
                    bg={r === 'admin' ? '#E6F1FB' : r === 'director' ? '#FAECE7' : '#E1F5EE'}
                    onClick={() => setEditando(e => ({ ...e, rol: r }))}>
                    {r}
                  </Chip>
                ))}
              </div>
            </CampoEditar>

            <CampoEditar label="Estado">
              <div style={{ display: 'flex', gap: '6px' }}>
                {ESTADOS.map(s => (
                  <Chip key={s} activo={editando.estado === s} onClick={() => setEditando(e => ({ ...e, estado: s }))}>{s}</Chip>
                ))}
              </div>
            </CampoEditar>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditando(null)}
                style={{ flex: 1, height: '40px', borderRadius: '8px', border: '1px solid #D3D1C7', background: 'none', cursor: 'pointer', fontSize: '13px' }}>
                Cancelar
              </button>
              <button onClick={guardarEdicion} disabled={guardando}
                style={{ flex: 2, height: '40px', borderRadius: '8px', border: 'none', background: guardando ? '#9FE1CB' : '#0F6E56', color: '#FFFFFF', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CampoEditar({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#888780', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '7px' }}>{label}</label>
      {children}
    </div>
  )
}

function Chip({ activo, onClick, children, color = '#04342C', bg = '#E1F5EE' }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: '5px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize', border: `1.5px solid ${activo ? color : '#D3D1C7'}`, background: activo ? bg : '#FFFFFF', color: activo ? color : '#5F5E5A', fontWeight: activo ? '500' : '400' }}>
      {children}
    </button>
  )
}
