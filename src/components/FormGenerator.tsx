import { memo } from 'react'
import type { FormSchema, FieldSchema } from '../types/schema'
import { useFormGenerator } from '../hooks/useFormGenerator'
import { getFieldComponent } from './fields'

export interface FormGeneratorProps {
  schema: FormSchema
  onSubmit: (values: Record<string, unknown>) => void
  ariaLabel?: string
}

interface FormGeneratorFieldRowProps {
  field: FieldSchema
  value: unknown
  error: string | null
  isVisible: boolean
  onChange: (id: string, value: unknown) => void
  onBlur: (id: string) => void
}

/** Memoized so only the field whose value/error/visibility changed re-renders (e.g. on validate). */
const FormGeneratorFieldRow = memo(function FormGeneratorFieldRow({
  field,
  value,
  error,
  isVisible,
  onChange,
  onBlur,
}: FormGeneratorFieldRowProps) {
  const Component = getFieldComponent(field.type)
  return (
    <div
      className={isVisible ? 'field-visible' : 'field-hidden'}
      aria-hidden={!isVisible}
    >
      <Component
        field={field}
        value={value}
        error={error}
        onChange={(v: unknown) => onChange(field.id, v)}
        onBlur={() => onBlur(field.id)}
      />
    </div>
  )
})

export function FormGenerator({ schema, onSubmit, ariaLabel = 'Dynamic form' }: FormGeneratorProps) {
  const { values, errors, visibleFields, handleChange, handleBlur, handleSubmit, reset } =
    useFormGenerator(schema)

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(onSubmit)
  }

  const visibleIds = new Set(visibleFields.map((f) => f.id))

  if (schema.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-auto w-full max-w-xl rounded-2xl border border-slate-700/80 bg-slate-800/90 p-8 text-center text-slate-400 shadow-xl shadow-black/30"
      >
        <p>No form fields defined. Add fields to your schema to get started.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onFormSubmit}
      role="form"
      aria-label={ariaLabel}
      className="mx-auto w-full max-w-xl rounded-2xl border border-slate-700/80 bg-slate-800/90 p-8 shadow-xl shadow-black/30"
    >
      {schema.map((field) => (
        <FormGeneratorFieldRow
          key={field.id}
          field={field}
          value={values[field.id]}
          error={errors[field.id] ?? null}
          isVisible={visibleIds.has(field.id)}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      ))}
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          aria-label="Reset form fields"
        >
          Reset fields
        </button>
        <button
          type="submit"
          tabIndex={0}
          className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-colors hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800 focus-visible:ring-2"
          aria-label="Submit form"
        >
          Submit
        </button>
      </div>
    </form>
  )
}
