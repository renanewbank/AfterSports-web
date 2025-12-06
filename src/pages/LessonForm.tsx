import type { FormEvent } from 'react'
import { useState } from 'react'
import dayjs from 'dayjs'
import { z } from 'zod'
import FormField from '../components/FormField'
import type { InstructorDTO, LessonCreate, LessonDTO, LessonUpdate } from '../types/dto'
import { toInputDateTime } from '../lib/format'

/**
 * Validação do formulário
 */
const lessonSchema = z.object({
  instructorId: z.coerce.number().gt(0, 'Selecione um instrutor'),
  title: z.string().trim().min(1, 'Título obrigatório'),
  description: z
    .string()
    .trim()
    .optional()
    .transform((val) => val || undefined),
  dateTime: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), 'Data/hora inválida'),
  durationMinutes: z.coerce.number().gt(0, 'Duração deve ser maior que zero'),
  capacity: z.coerce.number().gt(0, 'Capacidade deve ser maior que zero'),
  priceCents: z.coerce.number().min(0, 'Preço deve ser zero ou maior'),
  lat: z.coerce.number(),
  lon: z.coerce.number(),
})

type LessonFormData = z.infer<typeof lessonSchema>

type Props = {
  instructors: InstructorDTO[]
  initialData?: LessonDTO
  onSubmit: (data: LessonCreate | LessonUpdate) => Promise<void>
  onCancel: () => void
}

/**
 * Helpers para o campo de preço com vírgula (centavos)
 * - Mantemos uma string de exibição (ex.: "120,00")
 * - E também o valor numérico interno em centavos (12000)
 */
const onlyDigits = (s: string) => s.replace(/\D+/g, '')
const formatCentsWithComma = (digits: string) => {
  if (!digits) return ''
  if (digits.length <= 2) return digits // "5" -> "5", "12" -> "12"
  return `${digits.slice(0, -2)},${digits.slice(-2)}`
}
const parseDisplayToNumber = (display: string) => Number(onlyDigits(display) || '0')

const LessonForm = ({ instructors, initialData, onSubmit, onCancel }: Props) => {
  // ======== ESTADO DO FORM (inclui valor numérico em centavos) ========
  const [values, setValues] = useState<LessonFormData>({
    instructorId: initialData?.instructorId ?? (instructors[0]?.id ?? 0),
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    dateTime: initialData?.dateTime ? toInputDateTime(initialData.dateTime) : '',
    durationMinutes: initialData?.durationMinutes ?? 60,
    capacity: initialData?.capacity ?? 10,
    priceCents: initialData?.priceCents ?? 0,
    lat: initialData?.lat ?? 0,
    lon: initialData?.lon ?? 0,
  })

  // ======== STRING DE EXIBIÇÃO DO PREÇO (com vírgula) ========
  const [priceDisplay, setPriceDisplay] = useState<string>(
    initialData?.priceCents != null
      ? formatCentsWithComma(String(initialData.priceCents))
      : '',
  )

  const [errors, setErrors] = useState<Partial<Record<keyof LessonFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  // ======== ESTADOS DA GEOLOCALIZAÇÃO ========
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  // Botão "Usar minha localização"
  const useMyLocation = () => {
    setGeoError(null)

    if (!('geolocation' in navigator)) {
      setGeoError('Geolocalização não suportada neste navegador.')
      return
    }

    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setValues((v) => ({ ...v, lat: latitude, lon: longitude }))
        setGeoLoading(false)
      },
      (err) => {
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Permissão de localização negada.'
            : 'Não foi possível obter sua localização.',
        )
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }

  // Envio do formulário
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrors({})

    // Garante que priceCents (numérico) esteja sincronizado com a string exibida
    const cents = parseDisplayToNumber(priceDisplay)
    const parsed = lessonSchema.safeParse({ ...values, priceCents: cents })

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof LessonFormData, string>> = {}
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof LessonFormData
        fieldErrors[key] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    const payload = {
      ...parsed.data,
      dateTime: dayjs(parsed.data.dateTime).toISOString(),
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <FormField label="Instrutor" htmlFor="instructorId" error={errors.instructorId}>
        <select
          id="instructorId"
          value={values.instructorId}
          onChange={(e) =>
            setValues({ ...values, instructorId: Number(e.target.value) })
          }
        >
          <option value={0}>Selecione...</option>
          {instructors.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name} ({inst.sport})
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Título" htmlFor="title" error={errors.title}>
        <input
          id="title"
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          placeholder="Ex.: Aula de surf avançado"
        />
      </FormField>

      <FormField label="Descrição" htmlFor="description" error={errors.description}>
        <textarea
          id="description"
          value={values.description ?? ''}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          placeholder="Inclua informações extras sobre a aula"
        />
      </FormField>

      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <FormField label="Data/Hora" htmlFor="dateTime" error={errors.dateTime}>
          <input
            type="datetime-local"
            id="dateTime"
            value={values.dateTime}
            onChange={(e) => setValues({ ...values, dateTime: e.target.value })}
          />
        </FormField>

        <FormField
          label="Duração (min)"
          htmlFor="durationMinutes"
          error={errors.durationMinutes}
        >
          <input
            type="number"
            id="durationMinutes"
            value={values.durationMinutes}
            onChange={(e) =>
              setValues({ ...values, durationMinutes: Number(e.target.value) })
            }
            min={1}
          />
        </FormField>

        <FormField label="Capacidade" htmlFor="capacity" error={errors.capacity}>
          <input
            type="number"
            id="capacity"
            value={values.capacity}
            onChange={(e) => setValues({ ...values, capacity: Number(e.target.value) })}
            min={1}
          />
        </FormField>

        {/* CAMPO DE PREÇO COM VÍRGULA (centavos) */}
        <FormField label="Preço (centavos)" htmlFor="priceCents" error={errors.priceCents}>
          <input
            id="priceCents"
            inputMode="numeric"
            placeholder="Ex.: 120,00"
            value={priceDisplay}
            onChange={(e) => {
              const digits = onlyDigits(e.target.value) // mantém só números
              setPriceDisplay(formatCentsWithComma(digits)) // exibição com vírgula
              setValues((v) => ({ ...v, priceCents: parseDisplayToNumber(digits) })) // numérico em centavos
            }}
          />
        </FormField>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <FormField label="Latitude" htmlFor="lat" error={errors.lat}>
          <input
            type="number"
            id="lat"
            value={values.lat}
            onChange={(e) => setValues({ ...values, lat: Number(e.target.value) })}
            step="any"
            placeholder="Ex.: -23.55"
          />
        </FormField>

        <FormField label="Longitude" htmlFor="lon" error={errors.lon}>
          <input
            type="number"
            id="lon"
            value={values.lon}
            onChange={(e) => setValues({ ...values, lon: Number(e.target.value) })}
            step="any"
            placeholder="Ex.: -46.63"
          />
        </FormField>
      </div>

      {/* Botão para preencher lat/lon via Geolocation API */}
      <div className="actions">
        <button
          type="button"
          className="ghost-btn"
          onClick={useMyLocation}
          disabled={geoLoading}
          aria-busy={geoLoading}
        >
          {geoLoading ? 'Obtendo localização…' : 'Usar minha localização'}
        </button>
      </div>
      {geoError && <div className="error-box" role="alert">{geoError}</div>}

      <div className="actions">
        <button type="button" className="ghost-btn" onClick={onCancel}>
          Cancelar
        </button>
        <button className="primary-btn" type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}

export default LessonForm
