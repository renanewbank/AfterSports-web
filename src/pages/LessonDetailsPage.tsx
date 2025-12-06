import type { FormEvent } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import ErrorMessage from '../components/ErrorMessage'
import FormField from '../components/FormField'
import Loader from '../components/Loader'
import Table from '../components/Table'
import { del, get, post } from '../lib/api'
import { formatDateTime, formatInstantToLocal, formatPrice } from '../lib/format'
import type { BookingCreate, BookingDTO, LessonDTO, WeatherSummary } from '../types/dto'

const bookingSchema = z.object({
  studentName: z.string().trim().min(1, 'Nome obrigatório'),
  studentEmail: z.string().trim().email('E-mail inválido'),
})

type BookingForm = z.infer<typeof bookingSchema>

const LessonDetailsPage = () => {
  const { id } = useParams()
  const lessonId = Number(id)
  const [lesson, setLesson] = useState<LessonDTO | null>(null)
  const [weather, setWeather] = useState<WeatherSummary | null>(null)
  const [bookings, setBookings] = useState<BookingDTO[]>([])
  const [loadingLesson, setLoadingLesson] = useState(true)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookingValues, setBookingValues] = useState<BookingForm>({
    studentName: '',
    studentEmail: '',
  })
  const [bookingErrors, setBookingErrors] = useState<
    Partial<Record<keyof BookingForm, string>>
  >({})
  const [submitting, setSubmitting] = useState(false)

  const fetchLesson = useCallback(async () => {
    setLoadingLesson(true)
    setError(null)
    try {
      const data = await get<LessonDTO>(`/api/lessons/${lessonId}`)
      setLesson(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar aula.')
    } finally {
      setLoadingLesson(false)
    }
  }, [lessonId])

  const fetchWeather = useCallback(async () => {
    setLoadingWeather(true)
    try {
      const data = await get<WeatherSummary>(`/api/lessons/${lessonId}/weather`)
      setWeather(data)
    } catch {
      setWeather(null)
    } finally {
      setLoadingWeather(false)
    }
  }, [lessonId])

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true)
    try {
      const data = await get<BookingDTO[]>(`/api/lessons/${lessonId}/bookings`)
      setBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar reservas.')
    } finally {
      setLoadingBookings(false)
    }
  }, [lessonId])

  useEffect(() => {
    if (!lessonId) return
    fetchLesson()
    fetchWeather()
    fetchBookings()
  }, [lessonId, fetchLesson, fetchWeather, fetchBookings])

  const handleBookingSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBookingErrors({})
    const parsed = bookingSchema.safeParse(bookingValues)
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof BookingForm, string>> = {}
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof BookingForm
        fieldErrors[key] = issue.message
      })
      setBookingErrors(fieldErrors)
      return
    }

    const payload: BookingCreate = {
      ...parsed.data,
      lessonId,
    }

    setSubmitting(true)
    try {
      await post<BookingDTO, BookingCreate>('/api/bookings', payload)
      await fetchBookings()
      setBookingValues({ studentName: '', studentEmail: '' })
      alert('Reserva criada com sucesso!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar reserva.')
    } finally {
      setSubmitting(false)
    }
  }

  const cancelBooking = async (idToCancel: number) => {
    const ok = window.confirm('Cancelar esta reserva?')
    if (!ok) return
    try {
      await del(`/api/bookings/${idToCancel}`)
      await fetchBookings()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao cancelar reserva.')
    }
  }

  if (!lessonId) {
    return <ErrorMessage message="ID da aula inválido." />
  }

  return (
    <div className="section">
      <div className="page-title">
        <div>
          <p className="pill">Detalhes da Aula</p>
          <h2>Detalhes da aula #{lessonId}</h2>
        </div>
        <Link to="/lessons" className="ghost-btn">
          Voltar para aulas
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid">
        <div className="card section">
          <h3>Informações</h3>
          {loadingLesson ? (
            <Loader />
          ) : lesson ? (
            <div className="section">
              <p>
                <strong>Título:</strong> {lesson.title}
              </p>
              <p className="muted">{lesson.description || 'Sem descrição'}</p>
              <div className="pill-list">
                <span className="chip">Instrutor #{lesson.instructorId}</span>
                <span className="chip">Capacidade {lesson.capacity}</span>
                <span className="chip">Duração {lesson.durationMinutes} min</span>
              </div>
              <p>
                <strong>Quando:</strong> {formatDateTime(lesson.dateTime)}
              </p>
              <p>
                <strong>Preço:</strong> {formatPrice(lesson.priceCents)}
              </p>
              <p>
                <strong>Localização:</strong> {lesson.lat}, {lesson.lon}
              </p>
            </div>
          ) : (
            <ErrorMessage message="Aula não encontrada." />
          )}
        </div>

        <div className="card section">
          <h3>Previsão do tempo</h3>
          {loadingWeather ? (
            <Loader />
          ) : weather ? (
            <div className="section">
              <p>{weather.summary}</p>
              <div className="pill-list">
                <span className="chip">
                  Máx: {weather.temperatureMax ?? 'n/d'}°C
                </span>
                <span className="chip">
                  Mín: {weather.temperatureMin ?? 'n/d'}°C
                </span>
                <span className="chip">
                  Precip: {weather.precipitationProbability ?? 'n/d'}%
                </span>
              </div>
              <p className="muted">Data: {weather.date}</p>
            </div>
          ) : (
            <p className="muted">Sem dados de previsão.</p>
          )}
        </div>
      </div>

      <div className="card section">
        <div className="page-title" style={{ margin: 0 }}>
          <h3>Reservas desta aula</h3>
        </div>

        {/* Form para criar novas reservas */}
        <form className="form" onSubmit={handleBookingSubmit}>
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
          >
            <FormField
              label="Nome do aluno"
              htmlFor="studentName"
              error={bookingErrors.studentName}
            >
              <input
                id="studentName"
                value={bookingValues.studentName}
                onChange={(e) =>
                  setBookingValues({ ...bookingValues, studentName: e.target.value })
                }
                placeholder="Ex.: João Souza"
              />
            </FormField>
            <FormField
              label="E-mail"
              htmlFor="studentEmail"
              error={bookingErrors.studentEmail}
            >
              <input
                id="studentEmail"
                type="email"
                value={bookingValues.studentEmail}
                onChange={(e) =>
                  setBookingValues({ ...bookingValues, studentEmail: e.target.value })
                }
                placeholder="email@dominio.com"
              />
            </FormField>
          </div>
          <div className="actions">
            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Criar reserva'}
            </button>
          </div>
        </form>

        {/* Tabela de reservas com botão Cancelar */}
        {loadingBookings ? (
          <Loader />
        ) : bookings.length ? (
          <Table
            data={bookings}
            columns={[
              { key: 'id', label: 'ID' },
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
          <p className="muted">Ainda sem reservas.</p>
        )}
      </div>
    </div>
  )
}

export default LessonDetailsPage
