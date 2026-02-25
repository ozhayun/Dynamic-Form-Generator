import type {
  FieldVisibility,
  FormSchema,
  VisibilityOperator,
} from '../types/schema'

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  return false
}

function compareEquals(actual: unknown, expected: unknown): boolean {
  if (actual === expected) return true
  if (actual == null && expected == null) return true
  if (typeof actual === 'string' && typeof expected === 'string') {
    return actual.trim() === expected.trim()
  }
  return actual === expected
}

function compareNotEquals(actual: unknown, expected: unknown): boolean {
  if (actual === undefined || actual === null) return false
  if (isEmpty(expected)) {
    return !isEmpty(actual)
  }
  return !compareEquals(actual, expected)
}

function compareIn(actual: unknown, expected: unknown): boolean {
  if (!Array.isArray(expected)) return false
  return expected.some((v) => compareEquals(actual, v))
}

function compareGreaterThan(actual: unknown, expected: unknown): boolean {
  if (actual === undefined || actual === null) return false
  const a = typeof actual === 'number' ? actual : Number(actual)
  const b = typeof expected === 'number' ? expected : Number(expected)
  if (Number.isNaN(a) || Number.isNaN(b)) return false
  return a > b
}

const operators: Record<
  VisibilityOperator,
  (actual: unknown, expected: unknown) => boolean
> = {
  equals: compareEquals,
  notEquals: compareNotEquals,
  in: compareIn,
  greaterThan: compareGreaterThan,
}

export function evaluateVisibility(
  rule: FieldVisibility,
  values: Record<string, unknown>
): boolean {
  const actual = values[rule.field]
  const expected = rule.value
  const fn = operators[rule.operator]
  if (!fn) return true
  return fn(actual, expected)
}

export function isFieldVisible(
  fieldId: string,
  schema: FormSchema,
  currentValues: Record<string, unknown>,
  visited: Set<string> = new Set()
): boolean {
  if (visited.has(fieldId)) return false
  visited.add(fieldId)

  const field = schema.find((f) => f.id === fieldId)
  if (!field) return false

  if (!field.visibility) return true

  const depId = field.visibility.field
  const depVisible = isFieldVisible(depId, schema, currentValues, visited)
  if (!depVisible) return false

  return evaluateVisibility(field.visibility, currentValues)
}
