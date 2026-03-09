import { z } from 'zod'

/**
 * Zod schema for form configuration. Single source of truth for AI generation
 * and frontend validation. Must stay in sync with src/types/schema.ts.
 */

export const selectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

export const fieldValidationSchema = z
  .object({
    required: z.boolean().optional(),
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(0).optional(),
    pattern: z.string().optional(),
  })
  .optional()

export const visibilityOperatorSchema = z.enum([
  'equals',
  'notEquals',
  'in',
  'greaterThan',
])

export const fieldVisibilitySchema = z
  .object({
    field: z.string(),
    operator: visibilityOperatorSchema,
    value: z.unknown(),
  })
  .optional()

const baseFieldSchema = z.object({
  id: z.string().min(1).describe('Unique field identifier, snake_case'),
  type: z.string(),
  label: z.string().optional(),
  placeholder: z.string().optional(),
  validation: fieldValidationSchema,
  visibility: fieldVisibilitySchema,
})

export const textFieldSchema = baseFieldSchema.extend({
  type: z.literal('text'),
})

export const emailFieldSchema = baseFieldSchema.extend({
  type: z.literal('email'),
})

export const passwordFieldSchema = baseFieldSchema.extend({
  type: z.literal('password'),
})

export const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal('select'),
  options: z.array(selectOptionSchema).describe('List of { value, label } options'),
})

export const textareaFieldSchema = baseFieldSchema.extend({
  type: z.literal('textarea'),
})

export const numberFieldSchema = baseFieldSchema.extend({
  type: z.literal('number'),
})

export const fieldSchema = z.discriminatedUnion('type', [
  textFieldSchema,
  emailFieldSchema,
  passwordFieldSchema,
  selectFieldSchema,
  textareaFieldSchema,
  numberFieldSchema,
])

/** Form schema: array of field definitions. */
export const formSchema = z.array(fieldSchema)

/**
 * FormConfig: object streamed by the AI. Use this as the root schema
 * for streamObject / Output.object so the route returns { fields: FormSchema }.
 */
export const formConfigSchema = z.object({
  fields: formSchema.describe('Array of form field definitions'),
})

export type FormConfig = z.infer<typeof formConfigSchema>
