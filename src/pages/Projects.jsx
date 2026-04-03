import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState([])

  useEffect(() => {
    fetchProjects()
    if (user) fetchJoined()
  }, [user])

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  async function fetchJoined() {
    const { data } = await supabase
      .from('project_testers')
      .select('project_id')
      .eq('tester_id', user.id)
    setJoined((data || []).map(r => r.project_id))
  }

  async function joinProject(projectId) {
    await supabase.from('project_testers').insert({ project_id: projectId, tester_id: user.id })
    setJoined(prev => [...prev, projectId])
  }

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  function timeAgo(date) {
    const days = Math.floor((Date.now() - new Date(date)) / 86400000)
    if (days === 0) return 'hoy'
    if (days === 1) return 'hace 1 día'
    return `hace ${days} días`
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Proyectos</h1>
          <p style={{ fontSize: 14, color: '#6b6b67' }}>{filtered.length} proyecto{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {user && <Link to="/new-project"><button className="btn-primary">+ Publicar proyecto</button></Link>}
      </div>

      <div style={{ display: 'flex', gap: 0, border: '0.5px solid #e0e0db', borderRadius: 6, overflow: 'hidden', width: 'fit-content', marginBottom: '1.5rem' }}>
        {[['all', 'Todos'], ['open', 'Abiertos'], ['closed', 'Cerrados']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '7px 16px', fontSize: 13, fontFamily: 'inherit',
            background: filter === val ? '#1a1a18' : 'transparent',
            color: filter === val ? '#fff' : '#6b6b67',
            border: 'none', borderRight: val !== 'closed' ? '0.5px solid #e0e0db' : 'none',
            cursor: 'pointer'
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#9e9e9a', fontSize: 14 }}>Cargando proyectos...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: '#9e9e9a', fontSize: 14 }}>No hay proyectos todavía.</p>
          {user && <Link to="/new-project"><button className="btn-outline" style={{ marginTop: '1rem' }}>Sé el primero en publicar</button></Link>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {filtered.map(project => (
            <div key={project.id} style={{ background: '#fff', border: '0.5px solid #e0e0db', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>{project.title}</h3>
                <span style={{
                  fontFamily: 'monospace', fontSize: 10, padding: '3px 8px', borderRadius: 100,
                  background: project.status === 'open' ? '#eaf3de' : '#f0ede8',
                  color: project.status === 'open' ? '#3b6d11' : '#9e9e9a'
                }}>{project.status === 'open' ? 'abierto' : 'cerrado'}</span>
              </div>

              <p style={{ fontSize: 12, color: '#9e9e9a' }}>{timeAgo(project.created_at)}</p>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(project.platforms || []).map(p => (
                  <span key={p} style={{ fontFamily: 'monospace', fontSize: 11, padding: '2px 8px', borderRadius: 100, border: '0.5px solid #e0e0db', color: '#6b6b67' }}>{p}</span>
                ))}
                {project.type && (
                  <span style={{ fontFamily: 'monospace', fontSize: 11, padding: '2px 8px', borderRadius: 100, border: '0.5px solid #e0e0db', color: '#6b6b67' }}>{project.type === 'game' ? 'Juego' : 'App'}</span>
                )}
              </div>

              {project.description && (
                <p style={{ fontSize: 13, color: '#6b6b67', lineHeight: 1.5 }}>{project.description}</p>
              )}

              {project.download_url && (
                <a href={project.download_url} target="_blank" rel="noreferrer"
                  style={{ display: 'block', textAlign: 'center', padding: '8px', borderRadius: 8, background: '#1a1a18', color: '#fff', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
                  ⬇ Descargar / Probar
                </a>
              )}

              {user && project.developer_id !== user.id && project.status === 'open' && (
                <button
                  style={{
                    fontSize: 13, padding: '8px', borderRadius: 8, cursor: 'pointer',
                    border: joined.includes(project.id) ? '0.5px solid #e0e0db' : '0.5px solid #1a1a18',
                    background: joined.includes(project.id) ? '#eaf3de' : 'transparent',
                    color: joined.includes(project.id) ? '#3b6d11' : '#1a1a18'
                  }}
                  disabled={joined.includes(project.id)}
                  onClick={() => joinProject(project.id)}
                >
                  {joined.includes(project.id) ? '✓ Apuntado' : 'Apuntarme como tester'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}