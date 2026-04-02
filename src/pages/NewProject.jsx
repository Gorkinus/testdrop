import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import styles from './Auth.module.css'

const PLATFORMS = ['Android', 'iOS', 'PC / Mac', 'Juegos']

export default function NewProject() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', type: 'app' })
  const [platforms, setPlatforms] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function togglePlatform(p) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.from('projects').insert({
      developer_id: user.id,
      title: form.title,
      description: form.description,
      platforms,
      type: form.type,
      status: 'open'
    })
    if (error) { setError(error.message); setSubmitting(false) }
    else navigate('/dashboard')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card} style={{maxWidth: 500}}>
        <h2 className={styles.title}>Nuevo proyecto</h2>
        <p className={styles.sub}>Publica tu app o juego para encontrar testers</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Título</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Nombre de tu app o juego" required />
          </div>
          <div className={styles.field}>
            <label>Descripción</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Qué hace tu proyecto y qué feedback buscas..." rows={3} style={{resize:'vertical', width:'100%', padding:'9px 12px', border:'0.5px solid var(--color-border-strong)', borderRadius:'var(--radius-md)', fontFamily:'var(--font-sans)', fontSize:14}} />
          </div>
          <div className={styles.field}>
            <label>Tipo</label>
            <div style={{display:'flex', gap:10}}>
              {['app','game'].map(t => (
                <button key={t} type="button" onClick={() => setForm({...form, type: t})}
                  style={{flex:1, padding:'9px', borderRadius:'var(--radius-md)', border:'0.5px solid var(--color-border)', background: form.type===t?'var(--color-text)':'transparent', color:form.type===t?'var(--color-bg)':'var(--color-text-secondary)', fontSize:13, cursor:'pointer'}}>
                  {t === 'app' ? 'Aplicación' : 'Juego'}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <label>Plataformas</label>
            <div className={styles.pillSelect}>
              {PLATFORMS.map(p => (
                <button key={p} type="button"
                  className={`${styles.pillBtn} ${platforms.includes(p) ? styles.pillActive : ''}`}
                  onClick={() => togglePlatform(p)}>{p}</button>
              ))}
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className="btn-primary" style={{width:'100%', padding:'11px', marginTop:8}} disabled={submitting}>
            {submitting ? 'Publicando...' : 'Publicar proyecto'}
          </button>
        </form>
      </div>
    </div>
  )
}