import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabaseClient.js'

const ACCENT = '#0f172a'
const ACCENT_HOVER = '#1e293b'
const MUTED = '#6b7280'
const BORDER = '#e5e7eb'
const BG = '#fafafa'
const CARD = '#ffffff'

const QUICK_FILTERS = [
  { label: 'All', query: '' },
  { label: 'Haunted only', query: '?haunted=true' },
  { label: 'Castles', query: '?property_type=castle' },
  { label: 'Cheapest first', query: '?sort=price_asc' },
  { label: 'Most haunted', query: '?sort=haunt_rating_desc' },
  { label: 'First 5', query: '?limit=5&page=1' },
]

function statusColor(status) {
  if (status === 200) return '#16a34a'
  if (status === 401 || status === 429) return '#dc2626'
  return '#d97706'
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 14,
  fontFamily: 'inherit',
  borderRadius: 10,
  border: `1px solid ${BORDER}`,
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
}

const focusRing = {
  borderColor: ACCENT,
  boxShadow: `0 0 0 3px rgba(15,23,42,0.08)`,
}

const buttonBase = {
  padding: '12px 18px',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'inherit',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  transition: 'background .15s, opacity .15s',
}

function primaryButton(disabled) {
  return {
    ...buttonBase,
    background: disabled ? '#cbd5e1' : ACCENT,
    color: disabled ? '#f8fafc' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}

function secondaryButton(disabled) {
  return {
    ...buttonBase,
    background: '#fff',
    color: ACCENT,
    border: `1px solid ${BORDER}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }
}

function Section({ title, subtitle, children }) {
  return (
    <section style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '28px 30px', marginBottom: 28 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</h2>
      {subtitle && <p style={{ margin: '6px 0 22px', fontSize: 13, color: MUTED }}>{subtitle}</p>}
      {children}
    </section>
  )
}

function Card({ children }) {
  return (
    <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 12 }}>
      {children}
    </div>
  )
}

function Spinner() {
  return <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', marginRight: 8, verticalAlign: -2, animation: 'spinner .7s linear infinite' }} />
}

function ErrText({ children }) {
  return <p style={{ margin: '8px 0 0', fontSize: 13, color: '#dc2626' }}>{children}</p>
}

function LoginScreen() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } =
        mode === 'signin'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password })
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Property API</h1>
        <p style={{ color: MUTED, fontSize: 14, margin: '0 0 28px' }}>Manage your API keys and test the live endpoint.</p>

        <form onSubmit={handleSubmit} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {['signin', 'signup'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={toggleMode}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  cursor: 'pointer',
                  background: mode === m ? ACCENT : '#fff',
                  color: mode === m ? '#fff' : MUTED,
                }}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusRing)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: BORDER, boxShadow: 'none' })}
          />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, margin: '16px 0 6px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            style={inputStyle}
            onFocus={(e) => Object.assign(e.target.style, focusRing)}
            onBlur={(e) => Object.assign(e.target.style, { borderColor: BORDER, boxShadow: 'none' })}
          />

          {error && <ErrText>{error}</ErrText>}

          <button type="submit" disabled={loading} style={{ ...primaryButton(loading), width: '100%', marginTop: 24 }}>
            {loading ? <><Spinner />Please wait…</> : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

function CreateKey({ onKeyCreated }) {
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [generatedKey, setGeneratedKey] = useState('')
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    setCreating(true)
    try {
      const { data, error } = await supabase.rpc('generate_api_key', { key_name: name.trim() })
      if (error) throw error
      if (!data) throw new Error('No key was returned')
      setGeneratedKey(data)
      setCopied(false)
      setName('')
      onKeyCreated()
    } catch (err) {
      setError(err.message || 'Could not create the key')
    } finally {
      setCreating(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedKey)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = generatedKey
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    if (copyTimer.current) clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 2500)
  }

  const handleDone = () => {
    setGeneratedKey('')
    setCopied(false)
  }

  return (
    <Section
      title="Create a key"
      subtitle="Generate a new API key. The full key is shown once, immediately after creation."
    >
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. staging-server"
          style={{ ...inputStyle, flex: 1 }}
          disabled={creating}
          onFocus={(e) => Object.assign(e.target.style, focusRing)}
          onBlur={(e) => Object.assign(e.target.style, { borderColor: BORDER, boxShadow: 'none' })}
        />
        <button type="submit" disabled={creating || !name.trim()} style={primaryButton(creating || !name.trim())}>
          {creating ? <><Spinner />Creating…</> : 'Create'}
        </button>
      </form>
      {error && <ErrText>{error}</ErrText>}

      {generatedKey && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 50,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: '30px 32px', width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Your new API key</h3>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>
              This is the only time you'll see this key.
            </p>
            <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '14px 16px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, wordBreak: 'break-all', marginBottom: 20 }}>
              {generatedKey}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={handleDone} style={secondaryButton(false)}>Done</button>
              <button onClick={handleCopy} style={primaryButton(false)}>
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}

function KeyList({ keys, loading, error, onDelete, deletingId }) {
  if (loading) {
    return <p style={{ fontSize: 14, color: MUTED }}>Loading keys…</p>
  }
  if (error) {
    return <ErrText>{error}</ErrText>
  }
  if (keys.length === 0) {
    return <p style={{ fontSize: 14, color: MUTED }}>No keys yet. Create your first one above.</p>
  }
  return (
    <div>
      {keys.map((k) => (
        <Card key={k.id}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, wordBreak: 'break-all' }}>{k.key_name}</div>
              <div style={{ fontSize: 13, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: MUTED, marginTop: 2 }}>
                {k.prefix}
                {'\u2022'.repeat(8)}
              </div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>
                Created {new Date(k.created_at).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => onDelete(k)}
              disabled={deletingId === k.id}
              style={{
                ...buttonBase,
                flexShrink: 0,
                background: '#fff',
                color: '#dc2626',
                border: `1px solid #fecaca`,
                cursor: deletingId === k.id ? 'not-allowed' : 'pointer',
                opacity: deletingId === k.id ? 0.6 : 1,
              }}
            >
              {deletingId === k.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
}

function ApiTester() {
  const [key, setKey] = useState('')
  const [query, setQuery] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState(null)
  const [body, setBody] = useState(null)

  const handleSend = async () => {
    setError('')
    setStatus(null)
    setBody(null)
    if (!key.trim()) {
      setError('Paste an API key first.')
      return
    }
    setSending(true)
    try {
      const basePath = new URL(import.meta.env.VITE_FUNCTION_URL).pathname
      const url = `${basePath}${query}`
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'x-api-key': key.trim(),
        },
      })
      setStatus(res.status)
      let text = ''
      try {
        text = await res.text()
      } catch {
        text = ''
      }
      let json
      try {
        json = JSON.parse(text)
      } catch {
        json = text
      }
      setBody(json)
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <Section title="API tester" subtitle="Paste a key and send a request against the live function.">
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        placeholder="Paste API key…"
        style={inputStyle}
        autoComplete="off"
        onFocus={(e) => Object.assign(e.target.style, focusRing)}
        onBlur={(e) => Object.assign(e.target.style, { borderColor: BORDER, boxShadow: 'none' })}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0' }}>
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setQuery(f.query)}
            style={{
              ...buttonBase,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 500,
              background: query === f.query ? ACCENT : '#fff',
              color: query === f.query ? '#fff' : ACCENT,
              border: `1px solid ${query === f.query ? ACCENT : BORDER}`,
            }}
          >
            {f.label}
            {f.query && (
              <span style={{ opacity: 0.7, fontFamily: 'ui-monospace, Menlo, monospace', marginLeft: 6, fontSize: 11 }}>
                {f.query}
              </span>
            )}
          </button>
        ))}
      </div>

      <button onClick={handleSend} disabled={sending} style={primaryButton(sending)}>
        {sending ? <><Spinner />Sending…</> : 'Send request'}
      </button>

      {error && <ErrText>{error}</ErrText>}

      {status !== null && (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: statusColor(status),
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 600 }}>HTTP {status}</span>
            <span style={{ fontSize: 12, color: MUTED }}>
              {status === 200 ? 'OK' : status === 401 ? 'Unauthorized' : status === 429 ? 'Too many requests' : 'Response'}
            </span>
          </div>
          <pre
            style={{
              background: '#0b1220',
              color: '#e2e8f0',
              borderRadius: 12,
              padding: 18,
              margin: 0,
              fontSize: 12.5,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              lineHeight: 1.55,
              overflow: 'auto',
              maxHeight: 420,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {typeof body === 'string' ? body : JSON.stringify(body, null, 2)}
          </pre>
        </div>
      )}
    </Section>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [checking, setChecking] = useState(true)
  const [keys, setKeys] = useState([])
  const [keysLoading, setKeysLoading] = useState(false)
  const [keysError, setKeysError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const loadKeys = useCallback(async () => {
    setKeysLoading(true)
    setKeysError('')
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, key_name, prefix, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      setKeys(data || [])
    } catch (err) {
      setKeysError(err.message || 'Could not load keys')
    } finally {
      setKeysLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) loadKeys()
  }, [session, loadKeys])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleDelete = async (key) => {
    if (!window.confirm(`Delete API key "${key.key_name}"? This cannot be undone.`)) return
    setDeletingId(key.id)
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', key.id)
      if (error) throw error
      await loadKeys()
    } catch (err) {
      setKeysError(err.message || 'Could not delete the key')
    } finally {
      setDeletingId(null)
    }
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: MUTED }}>Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <LoginScreen />
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 80px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>Property API</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: MUTED }}>Signed in as {session.user.email}</p>
        </div>
        <button onClick={handleLogout} style={secondaryButton(false)}>Log out</button>
      </header>

      <CreateKey onKeyCreated={loadKeys} />
      <Section title="Existing keys" subtitle="Keys are scoped to your account by row-level security.">
        <KeyList keys={keys} loading={keysLoading} error={keysError} onDelete={handleDelete} deletingId={deletingId} />
      </Section>
      <ApiTester />
    </div>
  )
}
