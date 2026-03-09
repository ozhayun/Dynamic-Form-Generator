import { experimental_useObject as useObject } from '@ai-sdk/react'
import { formConfigSchema } from '../schemas/formSchema'
import type { FormConfig } from '../schemas/formSchema'
import type { FormSchema } from '../types/schema'

const DEFAULT_AI_API_URL =
  (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_AI_API_URL?: string } }).env?.VITE_AI_API_URL) ||
  'http://localhost:3000/api/chat'

export interface UseAIFormGeneratorOptions {
  /** API URL for the form generation endpoint. Defaults to VITE_AI_API_URL or http://localhost:3000/api/chat */
  apiUrl?: string
  /** Called when streaming finishes with the final form config (or undefined if validation failed). */
  onFinish?: (config: FormConfig | undefined, error: Error | undefined) => void
  onError?: (error: Error) => void
}

export interface UseAIFormGeneratorResult {
  /** Current streamed object (partial while loading). Handle undefined and partial fields in UI. */
  object: Partial<FormConfig> | undefined
  /** Trigger generation with this prompt. Sends { prompt } as JSON body. */
  submit: (input: { prompt: string }) => void
  /** Whether a request is in progress. */
  isLoading: boolean
  /** Stop the current stream. */
  stop: () => void
  /** Clear the current object state. */
  clear: () => void
  /** Last error from the API or validation. */
  error: Error | undefined
  /**
   * Derived form schema from streamed object for preview.
   * Safe for partial data: returns array (possibly empty) so AIPreview can map without crashing.
   */
  fields: FormSchema
}

/**
 * Manages streaming form schema from the AI API via useObject.
 * Sync with react-hook-form or manual form state only after generation is complete or user accepts.
 */
export function useAIFormGenerator(
  options: UseAIFormGeneratorOptions = {}
): UseAIFormGeneratorResult {
  const { apiUrl = DEFAULT_AI_API_URL, onFinish, onError } = options

  const {
    object: rawObject,
    submit,
    isLoading,
    stop,
    clear,
    error,
  } = useObject({
    api: apiUrl,
    schema: formConfigSchema,
    onFinish: onFinish
      ? (e) => {
          onFinish(e.object as FormConfig | undefined, e.error ?? undefined)
        }
      : undefined,
    onError,
  })

  const fields: FormSchema = Array.isArray(rawObject?.fields)
    ? (rawObject.fields as FormSchema)
    : []

  return {
    object: rawObject as Partial<FormConfig> | undefined,
    submit,
    isLoading,
    stop,
    clear,
    error,
    fields,
  }
}
