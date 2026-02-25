import type { ComponentType } from 'react'
import type { FieldSchema, FieldType } from '../../types/schema'
import { TextField } from './TextField'
import type { TextFieldProps } from './TextField'
import { EmailField } from './EmailField'
import type { EmailFieldProps } from './EmailField'
import { PasswordField } from './PasswordField'
import type { PasswordFieldProps } from './PasswordField'
import { SelectField } from './SelectField'
import type { SelectFieldProps } from './SelectField'
import { TextareaField } from './TextareaField'
import type { TextareaFieldProps } from './TextareaField'
import { NumberField } from './NumberField'
import type { NumberFieldProps } from './NumberField'

const KNOWN_TYPES: readonly FieldType[] = [
  'text',
  'email',
  'password',
  'select',
  'textarea',
  'number',
]

export function isKnownFieldType(type: string): type is FieldType {
  return (KNOWN_TYPES as readonly string[]).includes(type)
}

export interface FieldComponentProps {
  field: FieldSchema
  value: unknown
  error: string | null
  onChange: (value: unknown) => void
  onBlur: () => void
}

const fieldRegistry: Record<FieldType, ComponentType<FieldComponentProps>> = {
  text: TextField as ComponentType<FieldComponentProps>,
  email: EmailField as ComponentType<FieldComponentProps>,
  password: PasswordField as ComponentType<FieldComponentProps>,
  select: SelectField as ComponentType<FieldComponentProps>,
  textarea: TextareaField as ComponentType<FieldComponentProps>,
  number: NumberField as ComponentType<FieldComponentProps>,
}

export function getFieldComponent(type: string): ComponentType<FieldComponentProps> {
  if (isKnownFieldType(type)) {
    return fieldRegistry[type]
  }
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(`[FormGenerator] Unknown field type "${type}". Falling back to text input.`)
  }
  return TextField as ComponentType<FieldComponentProps>
}

export { TextField, type TextFieldProps }
export { EmailField, type EmailFieldProps }
export { PasswordField, type PasswordFieldProps }
export { SelectField, type SelectFieldProps }
export { TextareaField, type TextareaFieldProps }
export { NumberField, type NumberFieldProps }
export { fieldRegistry }
