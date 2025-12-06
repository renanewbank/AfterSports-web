import { useCallback, useEffect, useState } from 'react'
import ErrorMessage from '../components/ErrorMessage'
import Loader from '../components/Loader'
import Table from '../components/Table'
import { del, get, post, put } from '../lib/api'
import type { InstructorDTO } from '../types/dto'
import InstructorForm from './InstructorForm'

const InstructorsPage = () => {
  const [instructors, setInstructors] = useState<InstructorDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<InstructorDTO | null>(null)

  const loadInstructors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await get<InstructorDTO[]>('/api/instructors')
      setInstructors(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar instrutores.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInstructors()
  }, [loadInstructors])

  const handleCreate = async (payload: { name: string; sport: string; bio?: string }) => {
    try {
      await post<InstructorDTO, typeof payload>('/api/instructors', payload)
      await loadInstructors()
      setShowForm(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar instrutor.')
    }
  }

  const handleUpdate = async (
    id: number,
    payload: { name: string; sport: string; bio?: string },
  ) => {
    try {
      await put<InstructorDTO, typeof payload>(`/api/instructors/${id}`, payload)
      await loadInstructors()
      setEditing(null)
      setShowForm(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar instrutor.')
    }
  }

  const handleDelete = async (id: number) => {
    const confirmation = window.confirm('Remover este instrutor?')
    if (!confirmation) return
    try {
      await del(`/api/instructors/${id}`)
      await loadInstructors()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao remover instrutor.')
    }
  }

  return (
    <div className="section">
      <div className="page-title">
        <div>
          {/* <p className="pill">Instrutores</p> */}
          <h2>Gestão de instrutores</h2>
        </div>
        <button
          className="primary-btn"
          onClick={() => {
            setShowForm(true)
            setEditing(null)
          }}
        >
          Novo Instrutor
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="card section">
          <Table
            data={instructors}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'name', label: 'Nome' },
              { key: 'sport', label: 'Esporte' },
              {
                key: 'actions',
                label: 'Ações',
                render: (row) => (
                  <div className="inline-actions">
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
            ]}
            getKey={(row) => row.id}
          />
        </div>
      )}

      {showForm && (
        <div className="card section">
          <h3>{editing ? 'Editar instrutor' : 'Novo instrutor'}</h3>
          <InstructorForm
            initialData={
              editing
                ? { ...editing, bio: editing.bio ?? undefined }
                : undefined
            }
            onSubmit={(data) =>
              editing ? handleUpdate(editing.id, data) : handleCreate(data)
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

export default InstructorsPage
