import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '6rem 2rem 4rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', fontFamily: 'var(--mono)', fontSize: 11,
          letterSpacing: '0.08em', color: 'var(--gray-600)', border: '0.5px solid #e0e0db',
          padding: '4px 14px', borderRadius: 100, marginBottom: '2rem'
        }}>
          beta testing platform
        </div>

        <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: '1.25rem' }}>
          Encuentra testers para<br /><strong style={{ fontWeight: 500 }}>tu app o juego</strong>
        </h1>

        <p style={{ fontSize: 16, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 440, margin: '0 auto 2.5rem' }}>
          Publica tu proyecto, conecta con testers reales y recibe feedback antes de lanzar. Gratis para siempre.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register"><button className="btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>Publicar proyecto</button></Link>
          <Link to="/register"><button className="btn-outline" style={{ padding: '12px 28px', fontSize: 14 }}>Ser tester</button></Link>
        </div>
      </div>

      <div style={{ height: '0.5px', background: '#e0e0db', margin: '0 2rem' }} />

      {/* Plataformas */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', padding: '2.5rem 2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Android', icon: '🤖' },
          { label: 'iOS', icon: '🍎' },
          { label: 'PC / Mac', icon: '🖥️' },
          { label: 'Juegos', icon: '🎮' },
        ].map(p => (
          <div key={p.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: 'var(--gray-50)',
              border: '0.5px solid #e0e0db', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20
            }}>{p.icon}</div>
            <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>{p.label}</span>
          </div>
        ))}
      </div>

      <div style={{ height: '0.5px', background: '#e0e0db', margin: '0 2rem' }} />

      {/* Cómo funciona */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '3.5rem 2rem' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--gray-400)', marginBottom: '2rem', textTransform: 'uppercase' }}>
          cómo funciona
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
          {[
            { n: '01', t: 'Regístrate', d: 'Crea tu cuenta como desarrollador o tester y confirma tu email.' },
            { n: '02', t: 'Publica o explora', d: 'Sube tu proyecto o encuentra apps para testear según tu plataforma.' },
            { n: '03', t: 'Conecta', d: 'Los testers se apuntan y envían feedback directo al desarrollador.' },
            { n: '04', t: 'Lanza con confianza', d: 'Con feedback real antes de publicar en la store.' },
          ].map(s => (
            <div key={s.n} style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--gray-400)', marginBottom: 8 }}>{s.n}</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{s.t}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.5 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
