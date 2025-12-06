import type { FormEvent } from 'react'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../auth/AuthContext'

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, ready, user } = useContext(AuthContext)
  const [name, setName] = useState('')
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
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no cadastro.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="section container" style={{ maxWidth: 520 }}>
      <div className="card section">
        <h2>Criar conta</h2>
        <p className="muted">Crie sua conta para administrar o sistema.</p>

        {error && <div className="error-box" role="alert">{error}</div>}

        <form className="form" onSubmit={onSubmit}>
          <label className="form-field">
            <div className="form-field-header"><span>Nome</span></div>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>

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
              {submitting ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
