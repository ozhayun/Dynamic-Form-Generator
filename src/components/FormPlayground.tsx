import { useCallback, useEffect, useRef, useState } from 'react'
import type { FormSchema } from '../types/schema'
import { PlaygroundHeader } from './PlaygroundHeader'
import { EditorPane } from './EditorPane'
import { PreviewPane } from './PreviewPane'
import { SchemaReferenceModal } from './SchemaReferenceModal'
import { TEMPLATE_OPTIONS } from '../templates'
import { validateSchema } from '../utils/schemaValidation'
import { useAIFormGenerator } from '../hooks/useAIFormGenerator'

const DEBOUNCE_MS = 300

function parseSchemaJson(raw: string): { schema: FormSchema } | { error: string } {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return { error: 'Schema must be a JSON array of field objects.' }
    }
    return { schema: JSON.parse(JSON.stringify(parsed)) as FormSchema }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON'
    return { error: message }
  }
}

export interface FormPlaygroundProps {
  initialSchema?: FormSchema
}

const DEFAULT_SCHEMA: FormSchema = TEMPLATE_OPTIONS[1].schema

export function FormPlayground({ initialSchema = DEFAULT_SCHEMA }: FormPlaygroundProps) {
  const [schema, setSchema] = useState<FormSchema>(initialSchema)
  const [editorValue, setEditorValue] = useState(() => JSON.stringify(initialSchema, null, 2))
  const [parseError, setParseError] = useState<string | null>(null)
  const [schemaErrors, setSchemaErrors] = useState<Array<{ index?: number; path?: string; message: string }>>([])
  const [refModalOpen, setRefModalOpen] = useState(false)
  const [schemaKey, setSchemaKey] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const parseResult = parseSchemaJson(editorValue)
      if ('error' in parseResult) {
        setParseError(parseResult.error)
        setSchemaErrors([])
      } else {
        setParseError(null)
        const validation = validateSchema(parseResult.schema)
        setSchemaErrors(validation.errors)
        if (validation.valid) setSchema(parseResult.schema)
      }
      debounceRef.current = null
    }, DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [editorValue])

  const loadTemplateRef = useRef<(schema: FormSchema) => void>(() => {})

  const ai = useAIFormGenerator({
    onFinish: (config) => {
      if (config?.fields?.length) loadTemplateRef.current(config.fields)
    },
  })

  const loadTemplate = useCallback((newSchema: FormSchema) => {
    ai.clear()
    setEditorValue(JSON.stringify(newSchema, null, 2))
    setSchema(newSchema)
    setParseError(null)
    setSchemaErrors([])
    setSchemaKey((k) => k + 1)
  }, [ai])

  loadTemplateRef.current = loadTemplate

  const handleAIApply = useCallback(
    (aiSchema: FormSchema) => {
      loadTemplate(aiSchema)
      ai.clear()
    },
    [loadTemplate, ai]
  )

  const editorDisplayValue =
    ai.isLoading || ai.fields.length > 0
      ? JSON.stringify(ai.fields, null, 2)
      : editorValue

  const handleEditorChange = useCallback(
    (value: string) => {
      if (ai.isLoading || ai.fields.length > 0) ai.clear()
      setEditorValue(value)
    },
    [ai, setEditorValue]
  )

  const handleSubmit = useCallback((formValues: Record<string, unknown>) => {
    alert(JSON.stringify(formValues, null, 2))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#0b1120] md:h-screen md:max-h-screen md:overflow-hidden">
      <PlaygroundHeader />
      <div className="flex flex-col md:flex-1 md:min-h-0 md:flex-row">
        <div className="md:flex md:min-h-0 md:flex-[2] md:flex-col md:overflow-hidden md:[&>*]:min-h-0 md:order-3">
          <PreviewPane
            schema={schema}
            schemaKey={schemaKey}
            onSubmit={handleSubmit}
            loadTemplate={loadTemplate}
            aiFields={ai.fields}
            aiLoading={ai.isLoading}
            onAIStop={ai.stop}
            onAIApply={handleAIApply}
          />
        </div>
        <div
          className="mx-4 my-6 h-px shrink-0 bg-slate-600/50 md:mx-0 md:my-0 md:order-2 md:h-full md:w-px"
          aria-hidden
        />
        <div className="md:flex md:min-h-0 md:flex-[1] md:flex-col md:overflow-hidden md:[&>*]:min-h-0 md:order-1">
          <EditorPane
            editorValue={editorDisplayValue}
            setEditorValue={handleEditorChange}
            parseError={parseError}
            schemaErrors={schemaErrors}
            onOpenReference={() => setRefModalOpen(true)}
            loadTemplate={loadTemplate}
            onAISubmit={ai.submit}
            aiLoading={ai.isLoading}
            onAIStop={ai.stop}
            editorReadOnly={ai.isLoading}
          />
        </div>
      </div>
      <SchemaReferenceModal isOpen={refModalOpen} onClose={() => setRefModalOpen(false)} />
    </div>
  )
}
