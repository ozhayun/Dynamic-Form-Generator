import { memo } from 'react'
import type { PasswordFieldSchema } from '../../types/schema'

export interface PasswordFieldProps {
  field: PasswordFieldSchema
  value: unknown
  error: string | null
  onChange: (value: string) => void
  onBlur: () => void
}

export const PasswordField = memo(function PasswordField({ field, value, error, onChange, onBlur }: PasswordFieldProps) {
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
      <input
        id={id}
        type="password"
        value={str}
        placeholder={field.placeholder}
        maxLength={field.validation?.maxLength}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`block w-full rounded-lg border bg-slate-900/60 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 transition-colors sm:text-sm ${
          hasError
            ? 'border-red-500/60 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30'
            : 'border-slate-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30'
        }`}
        aria-invalid={hasError ? 'true' : undefined}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
      {hasError && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
})
