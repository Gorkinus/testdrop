import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'

export default function Home() {
  const { t } = useI18n()

  return (
    <div>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '6rem 2rem 4rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', fontFamily: 'monospace', fontSize: 11,
          letterSpacing: '0.08em', color: '#6b6b67', border: '0.5px solid #e0e0db',
          padding: '4px 14px', borderRadius: 100, marginBottom: '2rem'
        }}>
          {t.home.tag}
        </div>

        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: '1.25rem' }}>
          {t.home.headline1}<br /><strong style={{ fontWeight: 500 }}>{t.home.headline2} {t.home.headline3}</strong>
        </h1>

        <p style={{ fontSize: 16, color: '#6b6b67', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 440, margin: '0 auto 2.5rem' }}>
          {t.home.subtitle}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register"><button className="btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>{t.home.publishProject}</button></Link>
          <Link to="/register"><button className="btn-outline" style={{ padding: '12px 28px', fontSize: 14 }}>{t.home.beTester}</button></Link>
        </div>
      </div>

      <div style={{ height: '0.5px', background: '#e0e0db', margin: '0 2rem' }} />

      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', padding: '2.5rem 2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Android', icon: '🤖' },
          { label: 'iOS', icon: '🍎' },
          { label: 'Windows', icon: '🖥' },
          { label: 'Mac', icon: '💻' },
          { label: 'Linux', icon: '🐧' },
        ].map(p => (
          <div key={p.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: '#f7f6f3',
              border: '0.5px solid #e0e0db', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20
            }}>{p.icon}</div>
            <span style={{ fontSize: 12, color: '#6b6b67' }}>{p.label}</span>
          </div>
        ))}
      </div>

      <div style={{ height: '0.5px', background: '#e0e0db', margin: '0 2rem' }} />

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '3.5rem 2rem' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em', color: '#9e9e9a', marginBottom: '2rem', textTransform: 'uppercase' }}>
          {t.home.howItWorks}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
          {t.home.steps.map(([n, title, desc]) => (
            <div key={n} style={{ background: '#f7f6f3', borderRadius: 10, padding: '1.25rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#9e9e9a', marginBottom: 8 }}>{n}</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#6b6b67', lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: '0.5px', background: '#e0e0db', margin: '0 2rem' }} />

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '3.5rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 300, letterSpacing: '-0.5px', marginBottom: '1rem' }}>
          {t.home.headline1} <strong style={{ fontWeight: 500 }}>{t.home.headline2}</strong> {t.home.headline3}
        </h2>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/projects"><button className="btn-outline" style={{ padding: '10px 24px', fontSize: 14 }}>{t.home.viewAll}</button></Link>
        </div>
      </div>
    </div>
  )
}