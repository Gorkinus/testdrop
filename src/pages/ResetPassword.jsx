import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './Auth.module.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false) }
    else navigate('/dashboard')
  }

  if (!ready) return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>Verificando enlace...</h2>
        <p className={styles.sub}>Por favor espera un momento.</p>
      </div>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>Nueva contraseña</h2>
        <p className={styles.sub}>Elige una nueva contraseña para tu cuenta.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Nueva contraseña</label>
            <input type="password" placeholder="Mínimo 8 caracteres" value={password}
              onChange={e => setPassword(e.target.value)} required minLength={8} />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className="btn-primary" style={{width:'100%',padding:'11px'}} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}