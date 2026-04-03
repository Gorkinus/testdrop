import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Admin() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [tab, setTab] = useState('users')
  const [loading, setLoading] = useState(true)
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/')
    if (profile?.is_admin) { fetchUsers(); fetchProjects(); trackOnline() }
  }, [profile])

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function fetchProjects() {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data || [])
  }

  function trackOnline() {
    const channel = supabase.channel('online-users', {
      config: { presence: { key: user.id } }
    })
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() })
        }
      })
  }

  async function deleteUser(id) {
    if (!confirm('¿Seguro que quieres borrar este usuario?')) return
    await supabase.rpc('delete_user_completely', { user_id: id })
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  async function deleteProject(id) {
    if (!confirm('¿Seguro que quieres borrar este proyecto?')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <div style={{ padding: '3rem 2rem', fontSize: 14, color: '#9e9e9a' }}>Cargando...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Panel de moderación</h1>
        <p style={{ fontSize: 14, color: '#6b6b67' }}>Gestiona usuarios y proyectos</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12, marginBottom: '2rem' }}>
        {[
          { label: 'Total usuarios', value: users.length },
          { label: 'Total proyectos', value: projects.length },
          { label: 'Conectados ahora', value: onlineCount },
        ].map(s => (
          <div key={s.label} style={{ background: '#f7f6f3', borderRadius: 8, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: '#6b6b67', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 500 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 0, border: '0.5px solid #e0e0db', borderRadius: 6, overflow: 'hidden', width: 'fit-content', marginBottom: '1.5rem' }}>
        {[['users', 'Usuarios'], ['projects', 'Proyectos']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)} style={{
            padding: '7px 16px', fontSize: 13, fontFamily: 'inherit',
            background: tab === val ? '#1a1a18' : 'transparent',
            color: tab === val ? '#fff' : '#6b6b67',
            border: 'none', borderRight: val === 'users' ? '0.5px solid #e0e0db' : 'none',
            cursor: 'pointer'
          }}>{label}</button>
        ))}
      </div>

      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.length === 0 ? (
            <p style={{ color: '#9e9e9a', fontSize: 14, textAlign: 'center', padding: '2rem' }}>No hay usuarios.</p>
          ) : users.map(u => (
            <div key={u.id} style={{ background: '#fff', border: '0.5px solid #e0e0db', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</span>
                  {u.is_admin && <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 8px', borderRadius: 100, background: '#faeeda', color: '#ba7517' }}>admin</span>}
                </div>
                <div style={{ fontSize: 12, color: '#9e9e9a' }}>{new Date(u.created_at).toLocaleDateString('es-ES')}</div>
              </div>
              {u.id !== user.id && (
                <button onClick={() => deleteUser(u.id)}
                  style={{ padding: '6px 12px', borderRadius: 8, border: '0.5px solid #e24b4a', background: 'transparent', fontSize: 12, cursor: 'pointer', color: '#e24b4a' }}>
                  Borrar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {projects.length === 0 ? (
            <p style={{ color: '#9e9e9a', fontSize: 14, textAlign: 'center', padding: '2rem' }}>No hay proyectos.</p>
          ) : projects.map(project => (
            <div key={project.id} style={{ background: '#fff', border: '0.5px solid #e0e0db', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{project.title}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '2px 8px', borderRadius: 100, background: project.status === 'open' ? '#eaf3de' : '#f0ede8', color: project.status === 'open' ? '#3b6d11' : '#9e9e9a' }}>
                    {project.status === 'open' ? 'abierto' : 'cerrado'}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#9e9e9a' }}>{new Date(project.created_at).toLocaleDateString('es-ES')}</div>
              </div>
              <button onClick={() => deleteProject(project.id)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '0.5px solid #e24b4a', background: 'transparent', fontSize: 12, cursor: 'pointer', color: '#e24b4a' }}>
                Borrar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}