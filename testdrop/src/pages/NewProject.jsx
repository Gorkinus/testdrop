import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const PLATFORMS = ['Android', 'iOS', 'PC / Mac', 'Mac', 'Web']

export default function NewProject() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', type: 'app' })
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function togglePlatform(p) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (platforms.length === 0) return setError('Selecciona al menos una plataforma.')
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.from('projects').insert({
        developer_id: user.id,
        title: form.title,
        description: form.description,
        type: form.type,
        platforms,
        status: 'open'
      })
      if (err) throw err
      navigate('/projects')
    } catch (err) {
      setError('Error al publicar el proyecto. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 540, margin: '4rem auto', padding: '0 1.5rem' }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: '0.5rem' }}>Publicar proyecto</h1>
      <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: '2rem' }}>Encuentra testers para tu app o juego</p>

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-600)', marginBottom: 5 }}>Título del proyecto</label>
            <input type="text" placeholder="Ej: Mi App v1.2" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-600)', marginBottom: 5 }}>Descripción</label>
            <textarea
              placeholder="Describe qué hace tu app y qué tipo de feedback buscas..."
              rows={4}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-600)', marginBottom: 8 }}>Tipo</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[['app', 'Aplicación'], ['game', 'Juego']].map(([val, label]) => (
                <button type="button" key={val} onClick={() => setForm({ ...form, type: val })} style={{
                  flex: 1, padding: 9, border: '0.5px solid',
                  borderColor: form.type === val ? 'var(--black)' : '#e0e0db',
                  borderRadius: 6, fontSize: 13, fontFamily: 'var(--font)',
                  background: form.type === val ? 'var(--gray-50)' : 'transparent',
                  color: form.type === val ? 'var(--black)' : 'var(--gray-600)',
                  fontWeight: form.type === val ? 500 : 400
                }}>{label}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-600)', marginBottom: 8 }}>Plataformas</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PLATFORMS.map(p => (
                <button type="button" key={p} onClick={() => togglePlatform(p)} style={{
                  padding: '5px 12px', borderRadius: 100, fontSize: 12, fontFamily: 'var(--mono)',
                  border: '0.5px solid', borderColor: platforms.includes(p) ? 'var(--black)' : '#e0e0db',
                  background: platforms.includes(p) ? 'var(--black)' : 'transparent',
                  color: platforms.includes(p) ? 'var(--white)' : 'var(--gray-600)'
                }}>{p}</button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: 12 }} disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar proyecto'}
          </button>
        </form>
      </div>
    </div>
  )
}
