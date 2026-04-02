import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const PLATFORMS = ['Android', 'iOS', 'PC / Mac', 'Juegos']

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('developer')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function togglePlatform(p) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (role === 'tester' && platforms.length === 0) return setError('Selecciona al menos una plataforma.')
    setLoading(true)
    try {
      await signUp({ ...form, role, platforms })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ maxWidth: 400, margin: '5rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: '1rem' }}>📬</div>
      <h2 style={{ fontWeight: 500, fontSize: 20, marginBottom: 8 }}>Revisa tu email</h2>
      <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6 }}>
        Te hemos enviado un enlace de confirmación a <strong>{form.email}</strong>. Confírmalo para activar tu cuenta.
      </p>
      <Link to="/login"><button className="btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>Ir a iniciar sesión</button></Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', padding: '0 1.5rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Crear cuenta</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: '1.5rem' }}>Únete a TestDrop gratis</p>

        {/* Role selector */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem' }}>
          {['developer', 'tester'].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              flex: 1, padding: '9px', border: '0.5px solid',
              borderColor: role === r ? 'var(--black)' : '#e0e0db',
              borderRadius: 6, fontSize: 13, fontFamily: 'var(--font)',
              background: role === r ? 'var(--gray-50)' : 'transparent',
              color: role === r ? 'var(--black)' : 'var(--gray-600)',
              fontWeight: role === r ? 500 : 400
            }}>
              {r === 'developer' ? 'Desarrollador' : 'Tester'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-600)', marginBottom: 5 }}>Nombre</label>
            <input type="text" placeholder="Tu nombre" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-600)', marginBottom: 5 }}>Email</label>
            <input type="email" placeholder="tu@email.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>

          <div style={{ marginBottom: role === 'tester' ? 12 : 20 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-600)', marginBottom: 5 }}>Contraseña</label>
            <input type="password" placeholder="Mínimo 8 caracteres" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>

          {role === 'tester' && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--gray-600)', marginBottom: 8 }}>Plataformas que testeas</label>
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
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: 12 }} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-600)', marginTop: '1rem' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--black)', textDecoration: 'underline' }}>Entra aquí</Link>
        </p>
      </div>
    </div>
  )
}
