import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import Loader from '../components/Loader'
import { get } from '../lib/api'

type Status = 'idle' | 'loading' | 'ok' | 'error'

const quickLinks = [
  {
    title: 'Instrutores',
    description: 'Gerencie o time, cadastre novos profissionais e edite detalhes.',
    to: '/instructors',
  },
  {
    title: 'Aulas',
    description: 'Crie aulas, defina capacidade e valores e visualize detalhes.',
    to: '/lessons',
  },
  {
    title: 'Reservas',
    description: 'Busque reservas por e-mail e acompanhe inscrições.',
    to: '/bookings',
  },
]

const HomePage = () => {
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)

  const checkServer = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      await get('/api/lessons')
      setStatus('ok')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Erro ao conectar ao servidor.')
    }
  }, [])

  useEffect(() => {
    checkServer()
  }, [checkServer])

  return (
    <div className="section">
      <div className="hero">
        <div className="hero-card">
          <div className="pill">AfterSports • Frontend</div>
          <h1>Operação do dia a dia mais simples</h1>
          <p className="muted">
            Navegue pelas seções para gerenciar instrutores, aulas e reservas. Todas as
            chamadas seguem o proxy /api para conversar com o backend Spring.
          </p>
        </div>
        <div className="card section">
          <h3>Status do servidor</h3>
          <p className="muted">Um ping rápido em /api/lessons para validar a conexão.</p>
          {status === 'loading' && <Loader />}
          {status === 'ok' && <span className="badge success">Conectado</span>}
          {status === 'error' && (
            <>
              <span className="badge danger">Sem resposta</span>
              {error && <ErrorMessage message={error} />}
            </>
          )}
          <div className="actions">
            <button className="ghost-btn" onClick={checkServer} disabled={status === 'loading'}>
              Testar novamente
            </button>
          </div>
        </div>
      </div>

      <div className="grid">
        {quickLinks.map((item) => (
          <Link key={item.to} to={item.to}>
            <div className="card section">
              <h3>{item.title}</h3>
              <p className="muted">{item.description}</p>
              <span className="chip">Abrir</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage
