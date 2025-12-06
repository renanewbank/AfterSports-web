import type { FormEvent } from 'react'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, ready, user } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (ready && user) {
    navigate('/')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="section container" style={{ maxWidth: 520 }}>
      <div className="card section">
        <h2>Entrar</h2>
        <p className="muted">Acesse sua conta para gerenciar aulas e reservas.</p>

        {error && <div className="error-box" role="alert">{error}</div>}

        <form className="form" onSubmit={onSubmit}>
          <label className="form-field">
            <div className="form-field-header"><span>E-mail</span></div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="form-field">
            <div className="form-field-header"><span>Senha</span></div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          <div className="actions">
            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
