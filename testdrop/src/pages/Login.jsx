import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn, resetPassword } = useAuth()
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
      setError('Email o contraseña incorrectos.')
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
      setError('No se pudo enviar el email. Verifica la dirección.')
    } finally {
      setLoading(false)
    }
  }

  if (resetSent) return (
    <div style={{ maxWidth: 400, margin: '5rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: '1rem' }}>✉️</div>
      <h2 style={{ fontWeight: 500, fontSize: 20, marginBottom: 8 }}>Email enviado</h2>
      <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>
        Revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña.
      </p>
      <button className="btn-outline" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => { setResetMode(false); setResetSent(false) }}>
        Volver al login
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: '0 1.5rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>
          {resetMode ? 'Recuperar contraseña' : 'Bienvenido de nuevo'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
          {resetMode ? 'Te enviaremos un enlace a tu email' : 'Entra en tu cuenta de TestDrop'}
        </p>

        <form onSubmit={resetMode ? handleReset : handleSubmit}>
          {error && <div className="error-msg">{error}</div>}

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-600)', marginBottom: 5 }}>Email</label>
            <input type="email" placeholder="tu@email.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          {!resetMode && (
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-600)', marginBottom: 5 }}>Contraseña</label>
              <input type="password" placeholder="••••••••" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          )}

          {!resetMode && (
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <button type="button" onClick={() => setResetMode(true)} style={{ fontSize: 12, color: 'var(--gray-600)', textDecoration: 'underline' }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: 12 }} disabled={loading}>
            {loading ? 'Cargando...' : resetMode ? 'Enviar enlace' : 'Entrar'}
          </button>
        </form>

        {resetMode ? (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-600)', marginTop: '1rem' }}>
            <button onClick={() => setResetMode(false)} style={{ color: 'var(--black)', textDecoration: 'underline', fontSize: 12 }}>Volver al login</button>
          </p>
        ) : (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-600)', marginTop: '1rem' }}>
            ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--black)', textDecoration: 'underline' }}>Regístrate gratis</Link>
          </p>
        )}
      </div>
    </div>
  )
}
