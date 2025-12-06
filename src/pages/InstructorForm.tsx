import type { FormEvent } from 'react'
import { useState } from 'react'
import { z } from 'zod'
import FormField from '../components/FormField'

const instructorSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório'),
  sport: z.string().trim().min(1, 'Esporte obrigatório'),
  bio: z
    .string()
    .trim()
    .optional()
    .transform((val) => val || undefined),
})

type InstructorFormData = z.infer<typeof instructorSchema>

type Props = {
  initialData?: Partial<InstructorFormData>
  onSubmit: (data: InstructorFormData) => Promise<void>
  onCancel: () => void
}

const InstructorForm = ({ initialData, onSubmit, onCancel }: Props) => {
  const [values, setValues] = useState<InstructorFormData>({
    name: initialData?.name ?? '',
    sport: initialData?.sport ?? '',
    bio: initialData?.bio ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof InstructorFormData, string>>>(
    {},
  )
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrors({})
    const parsed = instructorSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof InstructorFormData, string>> = {}
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof InstructorFormData
        fieldErrors[key] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(parsed.data)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <FormField label="Nome" htmlFor="name" error={errors.name}>
        <input
          id="name"
          name="name"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          placeholder="Ex.: Maria Silva"
        />
      </FormField>
      <FormField label="Esporte" htmlFor="sport" error={errors.sport}>
        <input
          id="sport"
          name="sport"
          value={values.sport}
          onChange={(e) => setValues({ ...values, sport: e.target.value })}
          placeholder="Ex.: Surf"
        />
      </FormField>
      <FormField label="Bio" htmlFor="bio" error={errors.bio}>
        <textarea
          id="bio"
          name="bio"
          value={values.bio ?? ''}
          onChange={(e) => setValues({ ...values, bio: e.target.value })}
          placeholder="Fale sobre a experiência do instrutor"
        />
      </FormField>
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

export default InstructorForm
