export interface SelectOption {
  value: string
  label: string
}

export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
}

export type VisibilityOperator = 'equals' | 'notEquals' | 'in' | 'greaterThan'

export interface FieldVisibility {
  field: string
  operator: VisibilityOperator
  value: unknown
}

interface BaseFieldSchema {
  id: string
  type: string
  label?: string
  placeholder?: string
  validation?: FieldValidation
  visibility?: FieldVisibility
}

export interface TextFieldSchema extends BaseFieldSchema {
  type: 'text'
}

export interface EmailFieldSchema extends BaseFieldSchema {
  type: 'email'
}

export interface PasswordFieldSchema extends BaseFieldSchema {
  type: 'password'
}

export interface SelectFieldSchema extends BaseFieldSchema {
  type: 'select'
  options: SelectOption[]
}

export interface TextareaFieldSchema extends BaseFieldSchema {
  type: 'textarea'
}

export interface NumberFieldSchema extends BaseFieldSchema {
  type: 'number'
}

export type FieldSchema =
  | TextFieldSchema
  | EmailFieldSchema
  | PasswordFieldSchema
  | SelectFieldSchema
  | TextareaFieldSchema
  | NumberFieldSchema

export type FormSchema = FieldSchema[]
export type StringFieldType = 'text' | 'email' | 'password' | 'textarea'
export type FieldType = FieldSchema['type']
