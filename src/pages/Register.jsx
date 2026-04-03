import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Auth.module.css'

const PLATFORMS = ['Android', 'iOS', 'PC / Mac', 'Juegos']

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('developer')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function togglePlatform(p) {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        role,
        platforms: role === 'tester' ? selectedPlatforms : []
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>Crear cuenta</h2>
        <p className={styles.sub}>Únete a TestDrop gratis</p>

        <div className={styles.roleRow}>
          <button type="button"
            className={`${styles.roleBtn} ${role === 'developer' ? styles.roleActive : ''}`}
            onClick={() => setRole('developer')}>Desarrollador</button>
          <button type="button"
            className={`${styles.roleBtn} ${role === 'tester' ? styles.roleActive : ''}`}
            onClick={() => setRole('tester')}>Tester</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Nombre</label>
            <input type="text" placeholder="Tu nombre" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" placeholder="tu@email.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className={styles.field}>
            <label>Contraseña</label>
            <input type="password" placeholder="Mínimo 8 caracteres" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required minLength={8} />
          </div>

          {role === 'tester' && (
            <div className={styles.field}>
              <label>Plataformas que testeas</label>
              <div className={styles.pillSelect}>
                {PLATFORMS.map(p => (
                  <button key={p} type="button"
                    className={`${styles.pillBtn} ${selectedPlatforms.includes(p) ? styles.pillActive : ''}`}
                    onClick={() => togglePlatform(p)}>{p}</button>
                ))}
              </div>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className="btn-primary" style={{width:'100%',padding:'11px'}} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className={styles.footer}>¿Ya tienes cuenta? <Link to="/login" className={styles.flink}>Entra aquí</Link></p>
      </div>
    </div>
  )
}