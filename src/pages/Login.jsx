import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../i18n'
import styles from './Auth.module.css'

export default function Login() {
  const { signIn, resetPassword } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetMode, setResetMode] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(form)
      navigate('/dashboard')
    } catch (err) {
      setError(t.auth.wrongCredentials)
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(form.email)
      setResetSent(true)
    } catch (err) {
      setError(t.auth.wrongCredentials)
    } finally {
      setLoading(false)
    }
  }

  if (resetSent) return (
    <div className={styles.wrap}>
      <div className={styles.card} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: '1rem' }}>✉️</div>
        <h2 className={styles.title}>{t.auth.emailSent}</h2>
        <p className={styles.sub}>{t.auth.recoverSub}</p>
        <button className="btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}
          onClick={() => { setResetMode(false); setResetSent(false) }}>
          {t.auth.backToLogin}
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>
          {resetMode ? t.auth.recoverPassword : t.auth.welcome}
        </h2>
        <p className={styles.sub}>
          {resetMode ? t.auth.recoverSub : t.auth.enterAccount}
        </p>

        <form onSubmit={resetMode ? handleReset : handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label>{t.auth.email}</label>
            <input type="email" placeholder="tu@email.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          {!resetMode && (
            <div className={styles.field}>
              <label>{t.auth.password}</label>
              <input type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          )}

          {!resetMode && (
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <button type="button" onClick={() => setResetMode(true)}
                style={{ fontSize: 12, color: '#6b6b67', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                {t.auth.forgotPassword}
              </button>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: 12 }} disabled={loading}>
            {loading ? t.auth.loggingIn : resetMode ? t.auth.sendLink : t.auth.loginBtn}
          </button>
        </form>

        {resetMode ? (
          <p className={styles.footer}>
            <button onClick={() => setResetMode(false)}
              style={{ color: '#1a1a18', textDecoration: 'underline', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
              {t.auth.backToLogin}
            </button>
          </p>
        ) : (
          <p className={styles.footer}>
            {t.auth.noAccount} <Link to="/register" className={styles.flink}>{t.auth.registerFree}</Link>
          </p>
        )}
      </div>
    </div>
  )
}