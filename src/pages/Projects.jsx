import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Projects() {
  const { user, profile } = useAuth()
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  async function joinProject(projectId) {
    await supabase.from('project_testers').insert({ project_id: projectId, tester_id: user.id })
    alert('¡Te has apuntado! El desarrollador recibirá tu solicitud.')
  }

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  function timeAgo(date) {
    const diff = Date.now() - new Date(date)
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'hoy'
    if (days === 1) return 'hace 1 día'
    return `hace ${days} días`
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Proyectos</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>{filtered.length} proyecto{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {profile?.role === 'developer' && (
          <Link to="/new-project"><button className="btn-primary">+ Publicar proyecto</button></Link>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 0, border: '0.5px solid #e0e0db', borderRadius: 6, overflow: 'hidden', width: 'fit-content', marginBottom: '1.5rem' }}>
        {[['all', 'Todos'], ['open', 'Abiertos'], ['closed', 'Cerrados']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '7px 16px', fontSize: 13, fontFamily: 'var(--font)',
            background: filter === val ? 'var(--black)' : 'transparent',
            color: filter === val ? 'var(--white)' : 'var(--gray-600)',
            border: 'none', borderRight: val !== 'closed' ? '0.5px solid #e0e0db' : 'none'
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>Cargando proyectos...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--gray-400)', fontSize: 14 }}>No hay proyectos todavía.</p>
          {profile?.role === 'developer' && (
            <Link to="/new-project"><button className="btn-outline" style={{ marginTop: '1rem' }}>Sé el primero en publicar</button></Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {filtered.map(project => (
            <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>{project.title}</h3>
                <span className={`badge badge-${project.status}`}>{project.status === 'open' ? 'abierto' : 'cerrado'}</span>
              </div>

              <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                {timeAgo(project.created_at)} · por {project.profiles?.name || 'Desconocido'}
              </p>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(project.platforms || []).map(p => <span key={p} className="pill">{p}</span>)}
                {project.type && <span className="pill" style={{ background: 'var(--gray-50)' }}>{project.type === 'game' ? 'Juego' : 'App'}</span>}
              </div>

              {project.description && (
                <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>{project.description}</p>
              )}

              {user && profile?.role === 'tester' && project.status === 'open' && (
                <button className="btn-outline" style={{ marginTop: 'auto', fontSize: 13, padding: '8px' }} onClick={() => joinProject(project.id)}>
                  Apuntarme como tester
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
