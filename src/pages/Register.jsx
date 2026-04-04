import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../i18n'
import styles from './Auth.module.css'

export default function Register() {
  const { signUp } = useAuth()
  const { t } = useI18n()
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
        <h2 className={styles.title}>{t.auth.createAccount}</h2>
        <p className={styles.sub}>{t.auth.joinFree}</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>{t.auth.name}</label>
            <input type="text" placeholder={t.auth.namePlaceholder} value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className={styles.field}>
            <label>{t.auth.email}</label>
            <input type="email" placeholder="tu@email.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className={styles.field}>
            <label>{t.auth.password}</label>
            <input type="password" placeholder={t.auth.passwordPlaceholder} value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required minLength={8} />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className="btn-primary" style={{width:'100%',padding:'11px'}} disabled={loading}>
            {loading ? t.auth.creating : t.auth.createBtn}
          </button>
        </form>
        <p className={styles.footer}>{t.auth.haveAccount} <Link to="/login" className={styles.flink}>{t.auth.loginHere}</Link></p>
      </div>
    </div>
  )
}