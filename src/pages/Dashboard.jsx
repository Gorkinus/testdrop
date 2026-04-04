import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const PLATFORMS = ['Android', 'iOS', 'PC / Mac', 'Juegos']

export default function Dashboard() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [testers, setTesters] = useState({})
  const [testerNames, setTesterNames] = useState({})
  const [testerIds, setTesterIds] = useState({})
  const [expanded, setExpanded] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState({})
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    if (profile) {
      fetchData()
      const cleanup = trackPresence()
      return cleanup
    }
  }, [profile])

  function trackPresence() {
    const channel = supabase.channel('dashboard-presence', {
      config: { presence: { key: user.id } }
    })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const online = {}
      Object.values(state).flat().forEach(p => { online[p.user_id] = p.name })
      setOnlineUsers(online)
      setOnlineCount(Object.keys(online).length)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ user_id: user.id, name: profile?.name })
      }
    })

    return () => supabase.removeChannel(channel)
  }

  async function fetchData() {
    const { data } = await supabase
      .from('projects').select('*').eq('developer_id', user.id).order('created_at', { ascending: false })
    const joined = await supabase.from('project_testers').select('*, projects(*)').eq('tester_id', user.id).order('joined_at', { ascending: false })

    const myProjects = data || []
    const joinedProjects = (joined.data || []).map(d => d.projects).filter(p => p && !myProjects.find(mp => mp.id === p.id))
    setProjects([...myProjects, ...joinedProjects])

    for (const p of myProjects) {
      const { count } = await supabase.from('project_testers').select('*', { count: 'exact', head: true }).eq('project_id', p.id)
      setTesters(prev => ({ ...prev, [p.id]: count || 0 }))
    }
    setLoading(false)
  }

  async function loadTesters(projectId) {
    if (expanded === projectId) { setExpanded(null); return }
    setExpanded(projectId)
    if (testerNames[projectId]) return
    const { data } = await supabase
      .from('project_testers')
      .select('tester_id, profiles(id, name)')
      .eq('project_id', projectId)
    setTesterNames(prev => ({ ...prev, [projectId]: (data || []).map(d => d.profiles?.name || 'Sin nombre') }))
    setTesterIds(prev => ({ ...prev, [projectId]: (data || []).map(d => d.profiles?.id) }))
  }

  function startEdit(project) {
    setEditing(project.id)
    setEditForm({
      title: project.title,
      description: project.description || '',
      type: project.type || 'app',
      platforms: project.platforms || [],
      status: project.status
    })
  }

  function togglePlatform(p) {
    setEditForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) ? prev.platforms.filter(x => x !== p) : [...prev.platforms, p]
    }))
  }

  async function saveEdit(projectId) {
    setSaving(true)
    await supabase.from('projects').update(editForm).eq('id', projectId)
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...editForm } : p))
    setEditing(null)
    setSaving(false)
  }

  function timeAgo(date) {
    const days = Math.floor((Date.now() - new Date(date)) / 86400000)
    if (days === 0) return 'hoy'
    if (days === 1) return 'hace 1 día'
    return `hace ${days} días`
  }

  const myProjects = projects.filter(p => p.developer_id === user.id)
  const joinedProjects = projects.filter(p => p.developer_id !== user.id)
  const otherOnline = Object.entries(onlineUsers).filter(([id]) => id !== user.id)

  if (loading) return <div style={{ padding: '3rem 2rem', color: '#9e9e9a', fontSize: 14 }}>Cargando...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Hola, {profile?.name}</h1>
          <p style={{ fontSize: 14, color: '#6b6b67' }}>Panel de usuario</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/new-project"><button className="btn-primary">+ Nuevo proyecto</button></Link>
          <Link to="/profile"><button className="btn-outline">Mi perfil</button></Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12, marginBottom: '2rem' }}>
        {[
          { label: 'Mis proyectos', value: myProjects.length },
          { label: 'Abiertos', value: myProjects.filter(p => p.status === 'open').length },
          { label: 'Testeando', value: joinedProjects.length },
          { label: 'Total testers', value: Object.values(testers).reduce((a, b) => a + b, 0) },
          { label: 'Conectados ahora', value: onlineCount },
        ].map(s => (
          <div key={s.label} style={{ background: '#f7f6f3', borderRadius: 8, padding: '1rem' }}>
            <div style={{ fontSize: 12, color: '#6b6b67', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 500 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {otherOnline.length > 0 && (
        <div style={{ background: '#fff', border: '0.5px solid #e0e0db', borderRadius: 12, padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Usuarios conectados ahora</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {otherOnline.map(([id, name]) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#f7f6f3', borderRadius: 100 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b6d11' }} />
                <span style={{ fontSize: 13 }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {myProjects.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, color: '#6b6b67' }}>Mis proyectos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myProjects.map(project => (
              <div key={project.id} style={{ background: '#fff', border: '0.5px solid #e0e0db', borderRadius: 12, padding: '1.25rem' }}>
                {editing === project.id ? (
                  <div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: '#6b6b67', display: 'block', marginBottom: 4 }}>Título</label>
                      <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                        style={{ width: '100%', padding: '8px 12px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: '#6b6b67', display: 'block', marginBottom: 4 }}>Descripción</label>
                      <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})}
                        rows={3} style={{ width: '100%', padding: '8px 12px', border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: '#6b6b67', display: 'block', marginBottom: 4 }}>Tipo</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['app', 'game'].map(t => (
                          <button key={t} type="button" onClick={() => setEditForm({...editForm, type: t})}
                            style={{ flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 13, border: editForm.type === t ? '2px solid #1a1a18' : '1px solid #ccc', background: editForm.type === t ? '#1a1a18' : '#fff', color: editForm.type === t ? '#fff' : '#666' }}>
                            {t === 'app' ? '📱 Aplicación' : '🎮 Juego'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: '#6b6b67', display: 'block', marginBottom: 4 }}>Plataformas</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {PLATFORMS.map(p => (
                          <button key={p} type="button" onClick={() => togglePlatform(p)}
                            style={{ padding: '5px 14px', borderRadius: 100, cursor: 'pointer', fontSize: 12, border: editForm.platforms.includes(p) ? '2px solid #1a1a18' : '1px solid #ccc', background: editForm.platforms.includes(p) ? '#1a1a18' : '#fff', color: editForm.platforms.includes(p) ? '#fff' : '#666' }}>
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: '#6b6b67', display: 'block', marginBottom: 4 }}>Estado</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['open', 'closed'].map(s => (
                          <button key={s} type="button" onClick={() => setEditForm({...editForm, status: s})}
                            style={{ flex: 1, padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: 13, border: editForm.status === s ? '2px solid #1a1a18' : '1px solid #ccc', background: editForm.status === s ? '#1a1a18' : '#fff', color: editForm.status === s ? '#fff' : '#666' }}>
                            {s === 'open' ? '🟢 Abierto' : '🔴 Cerrado'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary" style={{ flex: 1, padding: '9px' }} onClick={() => saveEdit(project.id)} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button className="btn-outline" style={{ flex: 1, padding: '9px' }} onClick={() => setEditing(null)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <h3 style={{ fontSize: 14, fontWeight: 500 }}>{project.title}</h3>
                          <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '3px 8px', borderRadius: 100, background: project.status === 'open' ? '#eaf3de' : '#f0ede8', color: project.status === 'open' ? '#3b6d11' : '#9e9e9a' }}>
                            {project.status === 'open' ? 'abierto' : 'cerrado'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                          {(project.platforms || []).map(p => (
                            <span key={p} style={{ fontFamily: 'monospace', fontSize: 11, padding: '2px 8px', borderRadius: 100, border: '0.5px solid #e0e0db', color: '#6b6b67' }}>{p}</span>
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: '#9e9e9a' }}>
                          {timeAgo(project.created_at)} · {testers[project.id] || 0} testers
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-outline" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => loadTesters(project.id)}>
                          {expanded === project.id ? 'Ocultar testers' : 'Ver testers'}
                        </button>
                        <button className="btn-outline" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => navigate(`/chat/${project.id}`)}>
                          💬 Chat
                        </button>
                        <button className="btn-outline" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => startEdit(project)}>
                          Editar
                        </button>
                      </div>
                    </div>

                    {expanded === project.id && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid #e0e0db' }}>
                        <p style={{ fontSize: 12, color: '#6b6b67', marginBottom: 10 }}>Testers apuntados:</p>
                        {!testerNames[project.id] ? (
                          <p style={{ fontSize: 13, color: '#9e9e9a' }}>Cargando...</p>
                        ) : testerNames[project.id].length === 0 ? (
                          <p style={{ fontSize: 13, color: '#9e9e9a' }}>Aún no hay testers apuntados.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {testerNames[project.id].map((name, i) => {
                              const testerId = testerIds[project.id]?.[i]
                              const isOnline = testerId && onlineUsers[testerId]
                              return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f7f6f3', borderRadius: 8 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e0db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: '#6b6b67', position: 'relative' }}>
                                      {name[0]?.toUpperCase()}
                                      {isOnline && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#3b6d11', border: '2px solid #f7f6f3' }} />}
                                    </div>
                                    <span style={{ fontSize: 14 }}>{name}</span>
                                    {isOnline && <span style={{ fontSize: 11, color: '#3b6d11', fontFamily: 'monospace' }}>conectado</span>}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {joinedProjects.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, color: '#6b6b67' }}>Proyectos que testeo</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {joinedProjects.map(project => project && (
              <div key={project.id} style={{ background: '#fff', border: '0.5px solid #e0e0db', borderRadius: 12, padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 500 }}>{project.title}</h3>
                    <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '3px 8px', borderRadius: 100, background: project.status === 'open' ? '#eaf3de' : '#f0ede8', color: project.status === 'open' ? '#3b6d11' : '#9e9e9a' }}>
                      {project.status === 'open' ? 'abierto' : 'cerrado'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    {(project.platforms || []).map(p => (
                      <span key={p} style={{ fontFamily: 'monospace', fontSize: 11, padding: '2px 8px', borderRadius: 100, border: '0.5px solid #e0e0db', color: '#6b6b67' }}>{p}</span>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: '#9e9e9a' }}>{timeAgo(project.created_at)}</p>
                </div>
                <button className="btn-outline" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => navigate(`/chat/${project.id}`)}>
                  💬 Chat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: '#9e9e9a', fontSize: 14, marginBottom: '1rem' }}>Aún no tienes actividad.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link to="/new-project"><button className="btn-primary">Publicar proyecto</button></Link>
            <Link to="/projects"><button className="btn-outline">Explorar proyectos</button></Link>
          </div>
        </div>
      )}
    </div>
  )
}