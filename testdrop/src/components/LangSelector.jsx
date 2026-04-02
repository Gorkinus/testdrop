import { useState } from 'react'
import { useI18n, LANGUAGES } from '../i18n'
import styles from './LangSelector.module.css'

export default function LangSelector() {
  const { lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find(l => l.code === lang)

  return (
    <div className={styles.wrap}>
      <button className={styles.trigger} onClick={() => setOpen(!open)}>
        <span>{current.flag}</span>
        <span className={styles.label}>{current.label}</span>
        <span className={styles.arrow}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className={styles.dropdown}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              className={`${styles.option} ${l.code === lang ? styles.active : ''}`}
              onClick={() => { setLang(l.code); setOpen(false) }}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
