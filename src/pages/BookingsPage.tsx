import type { FormEvent } from 'react'
import { useState } from 'react'
import ErrorMessage from '../components/ErrorMessage'
import FormField from '../components/FormField'
import Loader from '../components/Loader'
import Table from '../components/Table'
import { del, get } from '../lib/api'
import { formatInstantToLocal } from '../lib/format'
import type { BookingDTO } from '../types/dto'
import { z } from 'zod'

const searchSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome'),
})

type SearchForm = z.infer<typeof searchSchema>

const BookingsPage = () => {
  const [form, setForm] = useState<SearchForm>({ name: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<BookingDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setError(null)
    const parsed = searchSchema.safeParse(form)
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Informe um nome válido.')
      return
    }

    setLoading(true)
    try {
      const data = await get<BookingDTO[]>(
        `/api/bookings/search?name=${encodeURIComponent(parsed.data.name)}`,
      )
      setBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar reservas.')
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (id: number) => {
    const ok = window.confirm('Cancelar esta reserva?')
    if (!ok) return
    try {
      await del(`/api/bookings/${id}`)
      // Recarrega a listagem atual (mantendo o filtro)
      await handleSearch(new Event('submit') as unknown as FormEvent)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao cancelar reserva.')
    }
  }

  return (
    <div className="section">
      <div className="page-title">
        <div>
          <p className="pill">Reservas</p>
          <h2>Buscar reservas por nome</h2>
        </div>
      </div>

      <div className="card section">
        <form className="form" onSubmit={handleSearch}>
          <FormField label="Nome" htmlFor="name" error={formError ?? undefined}>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              placeholder="Ex.: Renan"
            />
          </FormField>
          <div className="actions">
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="card section">
        {loading ? (
          <Loader />
        ) : bookings.length ? (
          <Table
            data={bookings}
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'lessonId', label: 'Aula' },
              { key: 'studentName', label: 'Aluno' },
              { key: 'studentEmail', label: 'E-mail' },
              {
                key: 'createdAt',
                label: 'Criado em',
                render: (row: BookingDTO) => formatInstantToLocal(row.createdAt),
              },
              {
                key: 'actions',
                label: 'Ações',
                render: (row: BookingDTO) => (
                  <button className="ghost-btn" onClick={() => cancelBooking(row.id)}>
                    Cancelar
                  </button>
                ),
              },
            ]}
            getKey={(row) => row.id}
          />
        ) : (
          <p className="muted">Nenhum resultado ainda.</p>
        )}
      </div>
    </div>
  )
}

export default BookingsPage
