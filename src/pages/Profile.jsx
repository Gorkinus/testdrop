import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import styles from './Auth.module.css'

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function deleteAccount() {
    setDeleting(true)
    await supabase.from('profiles').delete().eq('id', user.id)
    await signOut()
    navigate('/')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>Mi perfil</h2>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#6b6b67', marginBottom: 4 }}>Nombre</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{profile?.name}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#6b6b67', marginBottom: 4 }}>Email</div>
          <div style={{ fontSize: 15 }}>{user?.email}</div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: '#6b6b67', marginBottom: 4 }}>Rol</div>
          <div style={{ fontSize: 15 }}>{profile?.role === 'developer' ? 'Desarrollador' : 'Tester'}</div>
        </div>

        <div style={{ borderTop: '0.5px solid #e0e0db', paddingTop: 20 }}>
          {!confirm ? (
            <button onClick={() => setConfirm(true)}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: '0.5px solid #e24b4a', background: 'transparent', color: '#e24b4a', fontSize: 14, cursor: 'pointer' }}>
              Borrar cuenta
            </button>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: '#6b6b67', marginBottom: 12, textAlign: 'center' }}>
                ¿Seguro que quieres borrar tu cuenta? Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={deleteAccount} disabled={deleting}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#e24b4a', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
                  {deleting ? 'Borrando...' : 'Sí, borrar cuenta'}
                </button>
                <button onClick={() => setConfirm(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '0.5px solid #ccc', background: 'transparent', fontSize: 14, cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}