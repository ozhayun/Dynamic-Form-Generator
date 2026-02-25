const FIELD_TYPES = ['text', 'email', 'password', 'select', 'textarea', 'number'] as const
const VISIBILITY_OPERATORS = ['equals', 'notEquals', 'in', 'greaterThan'] as const

export type SchemaFieldType = (typeof FIELD_TYPES)[number]
export type SchemaVisibilityOperator = (typeof VISIBILITY_OPERATORS)[number]

export function isFieldType(type: string): type is SchemaFieldType {
  return (FIELD_TYPES as readonly string[]).includes(type)
}

export function isVisibilityOperator(op: string): op is SchemaVisibilityOperator {
  return (VISIBILITY_OPERATORS as readonly string[]).includes(op)
}

export interface SchemaValidationError {
  index?: number
  path?: string
  message: string
}

export interface SchemaValidationResult {
  valid: boolean
  errors: SchemaValidationError[]
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

export function validateSchema(parsed: unknown): SchemaValidationResult {
  const errors: SchemaValidationError[] = []

  if (!Array.isArray(parsed)) {
    errors.push({ message: 'Schema must be a JSON array of field objects.' })
    return { valid: false, errors }
  }

  const seenIds = new Set<string>()

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i]
    const prefix = `[${i}]`

    if (!isRecord(item)) {
      errors.push({ index: i, message: `${prefix} must be an object.` })
      continue
    }

    if (typeof item.id !== 'string' || item.id.trim() === '') {
      errors.push({ index: i, path: 'id', message: `${prefix} "id" is required and must be a non-empty string.` })
    } else if (seenIds.has(item.id)) {
      errors.push({ index: i, path: 'id', message: `${prefix} duplicate "id": "${item.id}". Each field must have a unique id.` })
    } else {
      seenIds.add(item.id)
    }

    if (typeof item.type !== 'string') {
      errors.push({ index: i, path: 'type', message: `${prefix} "type" is required and must be a string.` })
    } else if (!isFieldType(item.type)) {
      errors.push({
        index: i,
        path: 'type',
        message: `${prefix} "type" must be one of: ${FIELD_TYPES.join(', ')}.`,
      })
    }

    if (item.type === 'select') {
      if (!Array.isArray(item.options)) {
        errors.push({ index: i, path: 'options', message: `${prefix} "select" type requires "options" (array).` })
      } else {
        for (let j = 0; j < item.options.length; j++) {
          const opt = item.options[j]
          if (!isRecord(opt) || typeof opt.value !== 'string' || typeof opt.label !== 'string') {
            errors.push({
              index: i,
              path: `options[${j}]`,
              message: `${prefix} options[${j}] must be { "value": string, "label": string }.`,
            })
          }
        }
      }
    }

    if (item.validation !== undefined) {
      if (!isRecord(item.validation)) {
        errors.push({ index: i, path: 'validation', message: `${prefix} "validation" must be an object.` })
      } else {
        if (item.validation.required !== undefined && typeof item.validation.required !== 'boolean') {
          errors.push({ index: i, path: 'validation.required', message: `${prefix} validation.required must be boolean.` })
        }
        if (item.validation.minLength !== undefined && (typeof item.validation.minLength !== 'number' || item.validation.minLength < 0)) {
          errors.push({ index: i, path: 'validation.minLength', message: `${prefix} validation.minLength must be a non-negative number.` })
        }
        if (item.validation.maxLength !== undefined && (typeof item.validation.maxLength !== 'number' || item.validation.maxLength < 0)) {
          errors.push({ index: i, path: 'validation.maxLength', message: `${prefix} validation.maxLength must be a non-negative number.` })
        }
        if (item.validation.pattern !== undefined && typeof item.validation.pattern !== 'string') {
          errors.push({ index: i, path: 'validation.pattern', message: `${prefix} validation.pattern must be a string (regex).` })
        }
      }
    }

    if (item.visibility !== undefined) {
      if (!isRecord(item.visibility)) {
        errors.push({ index: i, path: 'visibility', message: `${prefix} "visibility" must be an object.` })
      } else {
        if (typeof item.visibility.field !== 'string' || item.visibility.field.trim() === '') {
          errors.push({ index: i, path: 'visibility.field', message: `${prefix} visibility.field is required (string).` })
        }
        if (typeof item.visibility.operator !== 'string' || !isVisibilityOperator(item.visibility.operator)) {
          errors.push({
            index: i,
            path: 'visibility.operator',
            message: `${prefix} visibility.operator must be one of: ${VISIBILITY_OPERATORS.join(', ')}.`,
          })
        }
        if (item.visibility.value === undefined) {
          errors.push({ index: i, path: 'visibility.value', message: `${prefix} visibility.value is required.` })
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
