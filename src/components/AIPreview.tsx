import { memo } from 'react'
import { motion } from 'framer-motion'
import type { FormSchema } from '../types/schema'
import { getFieldComponent, isKnownFieldType } from './fields'

/** Partial field shape during streaming; id and type may be missing until streamed. */
export type PartialField = Partial<Record<string, unknown>> & {
  id?: string
  type?: string
  label?: string
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: { required?: boolean; minLength?: number; maxLength?: number; pattern?: string }
}

export interface AIPreviewProps {
  /** Fields from useAIFormGenerator.fields (may be partial). */
  fields: PartialField[] | FormSchema
  /** Optional class for the container. */
  className?: string
}

function normalizePartialField(raw: PartialField, index: number): FormSchema[number] {
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id : `field_${index}`
  const type = typeof raw.type === 'string' && isKnownFieldType(raw.type) ? raw.type : 'text'
  const base = {
    id,
    type,
    label: typeof raw.label === 'string' ? raw.label : id,
    placeholder: typeof raw.placeholder === 'string' ? raw.placeholder : undefined,
    validation: raw.validation && typeof raw.validation === 'object' ? raw.validation : undefined,
  }
  if (type === 'select') {
    const options = Array.isArray(raw.options)
      ? raw.options.filter(
          (o): o is { value: string; label: string } =>
            o != null && typeof (o as { value?: unknown }).value === 'string' && typeof (o as { label?: unknown }).label === 'string'
        )
      : []
    return { ...base, type: 'select', options }
  }
  return base as FormSchema[number]
}

interface AIPreviewFieldRowProps {
  field: FormSchema[number]
  index: number
}

const AIPreviewFieldRow = memo(function AIPreviewFieldRow({ field, index }: AIPreviewFieldRowProps) {
  const Component = getFieldComponent(field.type)
  return (
    <motion.div
      className="field-visible"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Component
        field={field}
        value=""
        error={null}
        onChange={() => {}}
        onBlur={() => {}}
      />
    </motion.div>
  )
})

/**
 * Renders form fields in real-time as they stream. Uses partial-object logic:
 * normalizes partial fields (missing label, options, etc.) so the registry never receives invalid props.
 * Wrap in an Error Boundary per project standards.
 */
export const AIPreview = memo(function AIPreview({ fields, className }: AIPreviewProps) {
  const list = Array.isArray(fields) ? fields : []
  if (list.length === 0) {
    return (
      <div
        className={className}
        role="status"
        aria-live="polite"
      >
        <p className="text-sm text-slate-500">No fields yet. Describe the form you want above.</p>
      </div>
    )
  }

  return (
    <div className={className} aria-label="AI form preview">
      <div className="space-y-1 [&_.field-visible]:block">
        {list.map((raw, index) => {
          const field = normalizePartialField(raw as PartialField, index)
          return (
            <AIPreviewFieldRow key={field.id} field={field} index={index} />
          )
        })}
      </div>
    </div>
  )
})
