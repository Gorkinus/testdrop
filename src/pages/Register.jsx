import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Auth.module.css'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
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