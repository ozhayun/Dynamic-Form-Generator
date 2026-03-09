import { memo } from 'react'
import type { SelectFieldSchema } from '../../types/schema'

export interface SelectFieldProps {
  field: SelectFieldSchema
  value: unknown
  error: string | null
  onChange: (value: string) => void
  onBlur: () => void
}

export const SelectField = memo(function SelectField({ field, value, error, onChange, onBlur }: SelectFieldProps) {
  const str = value === null || value === undefined ? '' : String(value)
  const id = `field-${field.id}`
  const hasError = Boolean(error)
  const required = field.validation?.required
  const labelText = field.label ?? field.id

  return (
    <div className="mb-5">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
        {labelText}
        {required && <span className="ml-0.5 text-red-400" aria-hidden>*</span>}
      </label>
      <select
        id={id}
        value={str}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`block w-full rounded-lg border bg-slate-900/60 px-3.5 py-2.5 text-slate-100 transition-colors sm:text-sm ${
          hasError
            ? 'border-red-500/60 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30'
            : 'border-slate-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30'
        }`}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
      >
        <option value="">Select...</option>
        {field.options.map((opt, index) => (
          <option key={`${field.id}-opt-${index}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hasError && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
