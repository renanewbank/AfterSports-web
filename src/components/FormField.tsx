import type { ReactNode } from 'react'

type Props = {
  label: string
  htmlFor?: string
  error?: string
  children: ReactNode
}

const FormField = ({ label, htmlFor, error, children }: Props) => (
  <label className="form-field" htmlFor={htmlFor}>
    <div className="form-field-header">
      <span>{label}</span>
      {error && <span className="field-error">{error}</span>}
    </div>
    {children}
  </label>
)

export default FormField
