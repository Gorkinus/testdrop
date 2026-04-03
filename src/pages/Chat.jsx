import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Chat() {
  const { projectId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [project, setProject] = useState(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchProject()
    fetchMessages()

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`
      }, payload => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }, [projectId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchProject() {
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).single()
    setProject(data)
  }

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setLoading(false)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim()) return
    await supabase.from('messages').insert({
      project_id: projectId,
      sender_id: user.id,
      content: text.trim()
    })
    setText('')
  }

  function timeStr(date) {
    return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  function dateStr(date) {
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  if (loading) return <div style={{ padding: '3rem 2rem', fontSize: 14, color: '#9e9e9a' }}>Cargando...</div>

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem', height: 'calc(100vh - 65px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '0.5px solid #e0e0db' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6b6b67' }}>←</button>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 500 }}>{project?.title}</h2>
          <p style={{ fontSize: 12, color: '#9e9e9a' }}>Chat del proyecto</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9e9e9a', fontSize: 14 }}>
            No hay mensajes todavía. ¡Sé el primero en escribir!
          </div>
        ) : messages.map((msg, i) => {
          const isMe = msg.sender_id === user.id
          const showDate = i === 0 || dateStr(messages[i-1].created_at) !== dateStr(msg.created_at)
          return (
            <div key={msg.id}>
              {showDate && (
                <div style={{ textAlign: 'center', fontSize: 11, color: '#9e9e9a', margin: '8px 0', fontFamily: 'monospace' }}>
                  {dateStr(msg.created_at)}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '70%' }}>
                  {!isMe && (
                    <div style={{ fontSize: 11, color: '#9e9e9a', marginBottom: 3, marginLeft: 4 }}>
                      {msg.profiles?.name || 'Usuario'}
                    </div>
                  )}
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    background: isMe ? '#1a1a18' : '#f7f6f3',
                    color: isMe ? '#fff' : '#1a1a18',
                    fontSize: 14,
                    lineHeight: 1.5
                  }}>
                    {msg.content}
                  </div>
                  <div style={{ fontSize: 10, color: '#9e9e9a', marginTop: 3, textAlign: isMe ? 'right' : 'left', marginLeft: isMe ? 0 : 4, marginRight: isMe ? 4 : 0 }}>
                    {timeStr(msg.created_at)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, paddingTop: '1rem', borderTop: '0.5px solid #e0e0db' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ flex: 1, padding: '10px 14px', border: '0.5px solid #e0e0db', borderRadius: 100, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#1a1a18', color: '#fff', border: 'none', borderRadius: 100, fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
          Enviar
        </button>
      </form>
    </div>
  )
}