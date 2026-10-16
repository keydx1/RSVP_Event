import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

type Health = {
  status: string
  app: string
  laravel: string
  php: string
  database: {
    connection: string
    name: string
    connected: boolean
  }
  time: string
}

type State =
  | { kind: 'loading' }
  | { kind: 'ok'; data: Health }
  | { kind: 'error'; message: string }

async function fetchHealth(): Promise<Health> {
  const res = await fetch(`${API_BASE}/api/health`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as Health
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error'
}

function App() {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    fetchHealth()
      .then((data) => {
        if (!cancelled) setState({ kind: 'ok', data })
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ kind: 'error', message: toMessage(err) })
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  const recheck = () => {
    setState({ kind: 'loading' })
    setAttempt((n) => n + 1)
  }

  return (
    <main className="app">
      <header>
        <h1>RSVP</h1>
        <p className="subtitle">
          Laravel 12 &middot; MySQL &middot; React 19.3 &middot; TypeScript &middot; Vite
        </p>
      </header>

      <section className="card">
        <h2>Backend connection</h2>

        {state.kind === 'loading' && <p className="status pending">Checking…</p>}

        {state.kind === 'error' && (
          <p className="status error">
            Cannot reach the API — {state.message}. Is{' '}
            <code>php artisan serve</code> running?
          </p>
        )}

        {state.kind === 'ok' && (
          <ul className="status ok">
            <li>
              <span>Status</span>
              <code>{state.data.status}</code>
            </li>
            <li>
              <span>Application</span>
              <code>{state.data.app}</code>
            </li>
            <li>
              <span>Laravel</span>
              <code>{state.data.laravel}</code>
            </li>
            <li>
              <span>PHP</span>
              <code>{state.data.php}</code>
            </li>
            <li>
              <span>Database</span>
              <code>
                {state.data.database.connection} / {state.data.database.name}
              </code>
            </li>
            <li>
              <span>DB status</span>
              <code>
                {state.data.database.connected ? 'connected' : 'unreachable'}
              </code>
            </li>
          </ul>
        )}

        <button type="button" onClick={recheck}>
          Re-check
        </button>
      </section>

      <footer>
        <p>
          API <code>http://localhost:8000</code> &middot; Web{' '}
          <code>http://localhost:5173</code>
        </p>
      </footer>
    </main>
  )
}

export default App
