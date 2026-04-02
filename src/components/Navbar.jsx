import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../i18n'
import LangSelector from './LangSelector'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        test<span>drop</span>
      </Link>
      <div className={styles.links}>
        <Link to="/projects" className={styles.link}>{t.nav.projects}</Link>
        {user ? (
          <>
            <Link to="/dashboard" className={styles.link}>{t.nav.dashboard}</Link>
            <span className={styles.name}>{profile?.name}</span>
            <LangSelector />
            <button className="btn-outline" onClick={handleSignOut} style={{padding:'7px 16px',fontSize:'13px'}}>{t.nav.logout}</button>
          </>
        ) : (
          <>
            <LangSelector />
            <Link to="/login"><button className="btn-outline" style={{padding:'7px 16px',fontSize:'13px'}}>{t.nav.login}</button></Link>
            <Link to="/register"><button className="btn-primary" style={{padding:'7px 16px',fontSize:'13px'}}>{t.nav.register}</button></Link>
          </>
        )}
      </div>
    </nav>
  )
}
