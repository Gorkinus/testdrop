import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import styles from './Auth.module.css'

const PLATFORMS = ['Android', 'iOS', 'Windows', 'Mac', 'Linux']

export default function NewProject() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    download_url: '',
    type: 'app',
    duration: 14,
    tested_by_dev: false
  })
  const [platforms, setPlatforms] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function togglePlatform(p) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (platforms.length === 0) { setError('Selecciona al menos una plataforma'); return }
    setSubmitting(true)
    const { error } = await supabase.from('projects').insert({
      developer_id: user.id,
      title: form.title,
      description: form.description,
      download_url: form.download_url,
      platforms,
      type: form.type,
      duration: form.duration,
      tested_by_dev: form.tested_by_dev,
      status: 'open'
    })
    if (error) { setError(error.message); setSubmitting(false) }
    else navigate('/dashboard')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card} style={{maxWidth:520}}>
        <h2 className={styles.title}>Nuevo proyecto</h2>
        <p className={styles.sub}>Publica tu app o juego para encontrar testers</p>
        <form onSubmit={handleSubmit}>

          <div className={styles.field}>
            <label>Título</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Nombre de tu app o juego" required />
          </div>

          <div className={styles.field}>
            <label>Descripción</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Qué hace tu app y qué quieres que prueben los testers..."
              rows={3} style={{resize:'vertical',width:'100%',padding:'9px 12px',border:'0.5px solid #ccc',borderRadius:8,fontFamily:'inherit',fontSize:14,outline:'none'}} />
          </div>

          <div className={styles.field}>
            <label>Enlace de descarga</label>
            <input value={form.download_url} onChange={e => setForm({...form, download_url: e.target.value})}
              placeholder="https://play.google.com/... o enlace directo" />
          </div>

          <div className={styles.field}>
            <label>Tipo</label>
            <div style={{display:'flex',gap:10}}>
              {[['app','📱 Aplicación'],['game','🎮 Juego']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setForm({...form, type: val})}
                  style={{flex:1,padding:'9px',borderRadius:8,cursor:'pointer',fontSize:13,
                    border: form.type===val ? '2px solid #1a1a18' : '1px solid #ccc',
                    background: form.type===val ? '#1a1a18' : '#fff',
                    color: form.type===val ? '#fff' : '#666',
                    fontWeight: form.type===val ? 500 : 400}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>Plataformas</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:6}}>
              {PLATFORMS.map(p => (
                <button key={p} type="button" onClick={() => togglePlatform(p)}
                  style={{padding:'6px 16px',borderRadius:100,cursor:'pointer',fontSize:12,
                    border: platforms.includes(p) ? '2px solid #1a1a18' : '1px solid #ccc',
                    background: platforms.includes(p) ? '#1a1a18' : '#fff',
                    color: platforms.includes(p) ? '#fff' : '#666',
                    fontWeight: platforms.includes(p) ? 500 : 400}}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>Duración del testing</label>
            <div style={{display:'flex',gap:10}}>
              {[[7,'7 días'],[14,'14 días']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setForm({...form, duration: val})}
                  style={{flex:1,padding:'9px',borderRadius:8,cursor:'pointer',fontSize:13,
                    border: form.duration===val ? '2px solid #1a1a18' : '1px solid #ccc',
                    background: form.duration===val ? '#1a1a18' : '#fff',
                    color: form.duration===val ? '#fff' : '#666',
                    fontWeight: form.duration===val ? 500 : 400}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>¿Ya la has probado tú?</label>
            <div style={{display:'flex',gap:10}}>
              {[[true,'✅ Sí, la he probado'],[false,'❌ No la he probado']].map(([val, label]) => (
                <button key={String(val)} type="button" onClick={() => setForm({...form, tested_by_dev: val})}
                  style={{flex:1,padding:'9px',borderRadius:8,cursor:'pointer',fontSize:13,
                    border: form.tested_by_dev===val ? '2px solid #1a1a18' : '1px solid #ccc',
                    background: form.tested_by_dev===val ? '#1a1a18' : '#fff',
                    color: form.tested_by_dev===val ? '#fff' : '#666',
                    fontWeight: form.tested_by_dev===val ? 500 : 400}}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className="btn-primary"
            style={{width:'100%',padding:'11px',marginTop:8}} disabled={submitting}>
            {submitting ? 'Publicando...' : 'Publicar proyecto'}
          </button>
        </form>
      </div>
    </div>
  )
}