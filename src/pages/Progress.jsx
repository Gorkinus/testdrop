import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Progress() {
  const { projectId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [myProgress, setMyProgress] = useState([])
  const [allProgress, setAllProgress] = useState([])
  const [testers, setTesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    if (!user || !profile) return
    fetchAll()
  }, [projectId, user, profile])

  async function fetchAll() {
    setLoading(true)

    const { data: proj } = await supabase
      .from('projects').select('*').eq('id', projectId).single()

    if (!proj) { setLoading(false); return }

    setProject(proj)
    const owner = proj.developer_id === user.id
    setIsOwner(owner)

    const { data: progress } = await supabase
      .from('testing_progress').select('*').eq('project_id', projectId)
    setAllProgress(progress || [])
    setMyProgress((progress || []).filter(p => p.tester_id === user.id).map(p => p.day))

    if (owner) {
      const { data: testerData } = await supabase
        .from('project_testers')
        .select('tester_id, profiles(id, name)')
        .eq('project_id', projectId)
      setTesters((testerData || []).map(d => ({ id: d.profiles?.id, name: d.profiles?.name })))
    }

    setLoading(false)
  }

  async function toggleDay(day) {
    if (isOwner) return
    const today = new Date()
    const projectStart = new Date(project.created_at)
    const daysSinceStart = Math.floor((today - projectStart) / 86400000) + 1
    if (day > daysSinceStart) return

    setMarking(true)
    if (myProgress.includes(day)) {
      await supabase.from('testing_progress').delete()
        .eq('project_id', projectId).eq('tester_id', user.id).eq('day', day)
      setMyProgress(prev => prev.filter(d => d !== day))
      setAllProgress(prev => prev.filter(p => !(p.tester_id === user.id && p.day === day)))
    } else {
      await supabase.from('testing_progress').insert({
        project_id: projectId, tester_id: user.id, day
      })
      setMyProgress(prev => [...prev, day])
      setAllProgress(prev => [...prev, { project_id: projectId, tester_id: user.id, day }])
    }
    setMarking(false)
  }

  function getTesterProgress(testerId) {
    return allProgress.filter(p => p.tester_id === testerId).map(p => p.day)
  }

  function getDaysSinceStart() {
    if (!project) return 0
    const today = new Date()
    const projectStart = new Date(project.created_at)
    return Math.min(Math.floor((today - projectStart) / 86400000) + 1, project.duration || 14)
  }

  const totalDays = project?.duration || 14
  const daysSinceStart = getDaysSinceStart()

  if (loading) return <div style={{ padding: '3rem 2rem', color: '#9e9e9a', fontSize: 14 }}>Cargando...</div>

  if (!project) return (
    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#9e9e9a', fontSize: 14 }}>
      Proyecto no encontrado.
    </div>
  )

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
        <button onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b6b67' }}>←</button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500 }}>{project.title}</h1>
          <p style={{ fontSize: 13, color: '#9e9e9a' }}>Progreso de testing — {totalDays} días</p>
        </div>
      </div>

      {!isOwner && (
        <div style={{ background: '#fff', border: '0.5px solid #e0e0db', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: 14, fontWeight: 500 }}>Mi progreso</p>
            <span style={{ fontSize: 13, color: '#6b6b67', fontFamily: 'monospace' }}>{myProgress.length}/{totalDays} días</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
              const checked = myProgress.includes(day)
              const available = day <= daysSinceStart
              return (
                <button key={day} onClick={() => available && !marking && toggleDay(day)}
                  title={`Día ${day}`}
                  style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none',
                    cursor: available ? 'pointer' : 'default',
                    background: checked ? '#1a1a18' : available ? '#f7f6f3' : '#f0ede8',
                    color: checked ? '#fff' : available ? '#1a1a18' : '#ccc',
                    fontSize: 12, fontWeight: 500, transition: 'all 0.15s'
                  }}>
                  {checked ? '✓' : day}
                </button>
              )
            })}
          </div>
          <p style={{ fontSize: 12, color: '#9e9e9a', marginTop: 12 }}>
            Haz click en cada día que hayas probado la app. Solo puedes marcar días que ya han pasado.
          </p>
        </div>
      )}

      {isOwner && (
        <div style={{ background: '#fff', border: '0.5px solid #e0e0db', borderRadius: 12, padding: '1.5rem' }}>
          <p style={{ fontSize: 14, fontWeight: 500, marginBottom: '1rem' }}>
            Progreso de testers {testers.length > 0 ? `(${testers.length})` : ''}
          </p>
          {testers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9e9e9a', fontSize: 14 }}>
              Aún no hay testers apuntados a este proyecto.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {testers.map(tester => {
                const progress = getTesterProgress(tester.id)
                return (
                  <div key={tester.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e0e0db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#6b6b67' }}>
                          {tester.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: 14 }}>{tester.name}</span>
                      </div>
                      <span style={{ fontSize: 12, color: '#6b6b67', fontFamily: 'monospace' }}>{progress.length}/{totalDays}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
                        <div key={day} style={{
                          width: 28, height: 28, borderRadius: 6,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: progress.includes(day) ? '#eaf3de' : '#f7f6f3',
                          color: progress.includes(day) ? '#3b6d11' : '#ccc',
                          fontSize: 11, fontWeight: 500
                        }}>
                          {progress.includes(day) ? '✓' : day}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}