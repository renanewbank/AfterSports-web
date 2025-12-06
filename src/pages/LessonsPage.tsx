import { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../components/ErrorMessage'
import Loader from '../components/Loader'
import Table from '../components/Table'
import { del, get, post, put } from '../lib/api'
import { formatDateTime, formatPrice } from '../lib/format'
import type { InstructorDTO, LessonCreate, LessonDTO, LessonUpdate } from '../types/dto'
import LessonForm from './LessonForm'
import { AuthContext } from '../auth/AuthContext'

const LessonsPage = () => {
  const { user } = useContext(AuthContext)
  const [lessons, setLessons] = useState<LessonDTO[]>([])
  const [instructors, setInstructors] = useState<InstructorDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<LessonDTO | null>(null)

  const loadInstructors = useCallback(async () => {
    const data = await get<InstructorDTO[]>('/api/instructors')
    setInstructors(data)
  }, [])

  const loadLessons = useCallback(async (instructorId?: number) => {
    const path = instructorId
      ? `/api/instructors/${instructorId}/lessons`
      : '/api/lessons'
    const data = await get<LessonDTO[]>(path)
    setLessons(data)
  }, [])

  const fetchAll = useCallback(
    async (instructorId?: number) => {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([loadInstructors(), loadLessons(instructorId)])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar aulas.')
      } finally {
        setLoading(false)
      }
    },
    [loadInstructors, loadLessons],
  )

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleCreate = async (payload: LessonCreate) => {
    try {
      await post<LessonDTO, LessonCreate>('/api/lessons', payload)
      await fetchAll(selectedInstructorId ? Number(selectedInstructorId) : undefined)
      setShowForm(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar aula.')
    }
  }

  const handleUpdate = async (id: number, payload: LessonUpdate) => {
    try {
      await put<LessonDTO, LessonUpdate>(`/api/lessons/${id}`, payload)
      await fetchAll(selectedInstructorId ? Number(selectedInstructorId) : undefined)
      setEditing(null)
      setShowForm(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar aula.')
    }
  }

  const handleDelete = async (id: number) => {
    const confirmation = window.confirm('Deseja excluir esta aula?')
    if (!confirmation) return
    try {
      await del(`/api/lessons/${id}`)
      await fetchAll(selectedInstructorId ? Number(selectedInstructorId) : undefined)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover aula.')
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Título' },
    { key: 'instructorId', label: 'Instrutor' },
    {
      key: 'dateTime',
      label: 'Data/Hora',
      render: (row: LessonDTO) => formatDateTime(row.dateTime),
    },
    { key: 'capacity', label: 'Capacidade' },
    {
      key: 'priceCents',
      label: 'Preço',
      render: (row: LessonDTO) => formatPrice(row.priceCents),
    },
    {
      key: 'latlon',
      label: 'Lat/Lon',
      render: (row: LessonDTO) => `${row.lat}, ${row.lon}`,
    },
    ...(user
      ? [
          {
            key: 'actions',
            label: 'Ações',
            render: (row: LessonDTO) => (
              <div className="inline-actions">
                <Link className="ghost-btn" to={`/lessons/${row.id}`}>
                  Detalhes
                </Link>
                <button
                  className="ghost-btn"
                  onClick={() => {
                    setEditing(row)
                    setShowForm(true)
                  }}
                >
                  Editar
                </button>
                <button className="ghost-btn" onClick={() => handleDelete(row.id)}>
                  Excluir
                </button>
              </div>
            ),
          },
        ]
      : [
          {
            key: 'ver',
            label: 'Ação',
            render: (row: LessonDTO) => (
              <Link className="ghost-btn" to={`/lessons/${row.id}`}>
                Detalhes
              </Link>
            ),
          },
        ]),
  ]

  return (
    <div className="section">
      <div className="page-title">
        <div>
          <p className="pill">Aulas</p>
          <h2>Gerencie aulas</h2>
        </div>
        {user && (
          <button
            className="primary-btn"
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
          >
            Nova Aula
          </button>
        )}
      </div>

      <div className="card section">
        <p className="muted">
          Visualize as aulas existentes ou use o filtro para ver apenas as do instrutor.
        </p>
        <label className="form-field" style={{ maxWidth: '260px' }}>
          <div className="form-field-header">
            <span>Filtrar por instrutor</span>
          </div>
          <select
            value={selectedInstructorId}
            onChange={async (e) => {
              const value = e.target.value
              setSelectedInstructorId(value)
              setLoading(true)
              try {
                await loadLessons(value ? Number(value) : undefined)
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao filtrar aulas.')
              } finally {
                setLoading(false)
              }
            }}
          >
            <option value="">Todos</option>
            {instructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name} ({inst.sport})
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="card section">
          <Table data={lessons} columns={columns} getKey={(row) => row.id} />
          {!user && (
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              Para criar/editar/excluir aulas, faça login.
            </p>
          )}
        </div>
      )}

      {user && showForm && (
        <div className="card section">
          <h3>{editing ? 'Editar aula' : 'Nova aula'}</h3>
          <LessonForm
            instructors={instructors}
            initialData={editing ?? undefined}
            onSubmit={(data) =>
              editing ? handleUpdate(editing.id, data) : handleCreate(data as LessonCreate)
            }
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default LessonsPage
