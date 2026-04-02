import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { profile, user } = useAuth()
  const [projects, setProjects] = useState([])
  const [testers, setTesters] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) fetchData()
  }, [profile])

  async function fetchData() {
    if (profile.role === 'developer') {
      const { data } = await supabase
        .from('projects').select('*').eq('developer_id', user.id).order('created_at', { ascending: false })
      setProjects(data || [])
      for (const p of data || []) {
        const { count } = await supabase.from('project_testers').select('*', { count: 'exact', head: true }).eq('project_id', p.id)
        setTesters(prev => ({ ...prev, [p.id]: count || 0 }))
      }
    } else {
      const { data } = await supabase.from('project_testers').select('*, projects(*, profiles(name))').eq('tester_id', user.id).order('joined_at', { ascending: false })
      setProjects((data || []).map(d => d.projects))
    }
    setLoading(false)
  }

  async function toggleStatus(project) {
    const newStatus = project.status === 'open' ? 'closed' : 'open'
    await supabase.from('projects').update({ status: newStatus }).eq('id', project.id)
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: newStatus } : p))
  }

  function timeAgo(date) {
    const days = Math.floor((Date.now() - new Date(date)) / 86400000)
    if (days === 0) return 'hoy'
    if (days === 1) return 'hace 1 día'
    return `hace ${days} días`
  }

  if (loading) return <div style={{ padding: '3rem 2rem', color: 'var(--gray-400)', fontSize: 14 }}>Cargando...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Hola, {profile?.name}</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-600)' }}>{profile?.role === 'developer' ? 'Panel de desarrollador' : 'Proyectos en los que participas'}</p>
        </div>
        {profile?.role === 'developer' && <Link to="/new-project"><button className="btn-primary">+ Nuevo proyecto</button></Link>}
      </div>

      {profile?.role === 'developer' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12, marginBottom: '2rem' }}>
          {[
            { label: 'Total proyectos', value: projects.length },
            { label: 'Abiertos', value: projects.filter(p => p.status === 'open').length },
            { label: 'Total testers', value: Object.values(testers).reduce((a, b) => a + b, 0) },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '1rem' }}>
              <div style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 500 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <p style={{ color: 'var(--gray-400)', fontSize: 14, marginBottom: '1rem' }}>
            {profile?.role === 'developer' ? 'Aún no has publicado ningún proyecto.' : 'Aún no te has apuntado a ningún proyecto.'}
          </p>
          <Link to={profile?.role === 'developer' ? '/new-project' : '/projects'}>
            <button className="btn-outline">{profile?.role === 'developer' ? 'Publicar primer proyecto' : 'Explorar proyectos'}</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {projects.map(project => project && (
            <div key={project.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 500 }}>{project.title}</h3>
                  <span className={`badge badge-${project.status}`}>{project.status === 'open' ? 'abierto' : 'cerrado'}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                  {(project.platforms || []).map(p => <span key={p} className="pill">{p}</span>)}
                </div>
                <p style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                  {timeAgo(project.created_at)}{profile?.role === 'developer' && ` · ${testers[project.id] || 0} tester${testers[project.id] !== 1 ? 's' : ''}`}
                </p>
              </div>
              {profile?.role === 'developer' && (
                <button className="btn-outline" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => toggleStatus(project)}>
                  {project.status === 'open' ? 'Cerrar proyecto' : 'Reabrir proyecto'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
