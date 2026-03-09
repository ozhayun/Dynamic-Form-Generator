import type { FieldSchema, FieldValidation, StringFieldType } from '../types/schema'

const STRING_FIELD_TYPES: StringFieldType[] = ['text', 'email', 'password', 'textarea']

export function isStringFieldType(type: string): type is StringFieldType {
  return (STRING_FIELD_TYPES as readonly string[]).includes(type)
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

function getString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  return String(value)
}

function getDisplayName(field: FieldSchema): string {
  return field.label ?? field.id
}

type ValidationRuleContext = {
  field: FieldSchema
  value: unknown
  str: string
  getDisplayName: (f: FieldSchema) => string
}

type ValidationRuleHandler = (
  ruleKey: keyof FieldValidation,
  ruleValue: unknown,
  ctx: ValidationRuleContext
) => string | null

const validationRuleHandlers: Record<keyof FieldValidation, ValidationRuleHandler> = {
  required(_key, ruleValue, ctx) {
    if (ruleValue !== true) return null
    if (isEmpty(ctx.value)) return `${ctx.getDisplayName(ctx.field)} is required`
    return null
  },
  minLength(_key, ruleValue, ctx) {
    if (typeof ruleValue !== 'number' || ruleValue < 0) return null
    if (!isStringFieldType(ctx.field.type)) return null
    if (ctx.str.length < ruleValue) return `Must be at least ${ruleValue} characters`
    return null
  },
  maxLength(_key, ruleValue, ctx) {
    if (typeof ruleValue !== 'number' || ruleValue < 0) return null
    if (!isStringFieldType(ctx.field.type)) return null
    if (ctx.str.length > ruleValue) return `Must be at most ${ruleValue} characters`
    return null
  },
  pattern(_key, ruleValue, ctx) {
    if (typeof ruleValue !== 'string') return null
    if (!isStringFieldType(ctx.field.type)) return null
    const trimmed = ctx.str.trim()
    try {
      const re = new RegExp(ruleValue)
      if (!re.test(trimmed)) return 'Invalid format'
    } catch {
      return 'Invalid format'
    }
    return null
  },
}

export function validateField(field: FieldSchema, value: unknown): string | null {
  const validation = field.validation
  const str = getString(value)
  const displayName = () => getDisplayName(field)
  const ctx: ValidationRuleContext = { field, value, str, getDisplayName: displayName }

  if (validation?.required && isEmpty(value)) {
    return validationRuleHandlers.required('required', true, ctx)
  }

  if (!validation?.required && isEmpty(value)) return null

  for (const key of Object.keys(validation ?? {}) as (keyof FieldValidation)[]) {
    const handler = validationRuleHandlers[key]
    const ruleValue = validation![key]
    if (handler && ruleValue !== undefined) {
      const msg = handler(key, ruleValue, ctx)
      if (msg) return msg
    }
  }

  if (field.type === 'number' && validation?.required) {
    const num = str === '' ? NaN : Number(str)
    if (str === '' || Number.isNaN(num)) {
      return `${getDisplayName(field)} is required`
    }
  }

  return null
}

export function validateForm(
  fields: FieldSchema[],
  values: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields) {
    const message = validateField(field, values[field.id])
    if (message) errors[field.id] = message
  }
  return errors
}
