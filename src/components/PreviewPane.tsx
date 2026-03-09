import type { FormSchema } from '../types/schema'
import { FormGenerator } from './FormGenerator'
import { AIPreview } from './AIPreview'
import { AIPreviewErrorBoundary } from './AIPreviewErrorBoundary'

export interface PreviewPaneProps {
  schema: FormSchema
  schemaKey: number
  onSubmit: (values: Record<string, unknown>) => void
  /** Load a schema into the editor (e.g. after AI "Apply"). Keeps manual builder as single source after apply. */
  loadTemplate?: (schema: FormSchema) => void
  /** AI-generated fields (streaming or final). When set, preview shows AIPreview + Apply instead of FormGenerator. */
  aiFields?: FormSchema
  aiLoading?: boolean
  onAIStop?: () => void
  onAIApply?: (schema: FormSchema) => void
}

export function PreviewPane({
  schema,
  schemaKey,
  onSubmit,
  loadTemplate,
  aiFields = [],
  aiLoading = false,
  onAIStop,
  onAIApply,
}: PreviewPaneProps) {
  const showAIPreview = aiFields.length > 0 || aiLoading
  const canApply = !aiLoading && aiFields.length > 0 && loadTemplate && onAIApply

  return (
    <main
      className="flex min-w-0 flex-col border-slate-700/60 bg-gradient-to-br from-[#0b1120] via-slate-900 to-[#0f172a] shadow-inner md:flex-[2] md:overflow-auto md:border-l"
      aria-label="Live Preview"
    >
      <div className="shrink-0 border-b border-slate-700/60 bg-slate-900/60 px-6 py-4">
        <h2 className="font-sans text-base font-semibold uppercase tracking-wider text-slate-400">
          Live Preview
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Form generated from your schema.
        </p>
      </div>
      <div className="p-6 md:flex-1 md:overflow-auto md:p-8">
        {showAIPreview ? (
          <div className="space-y-4">
            <AIPreviewErrorBoundary>
              <AIPreview fields={aiFields} className="min-h-[120px]" />
            </AIPreviewErrorBoundary>
            {aiLoading && onAIStop && (
              <button
                type="button"
                onClick={onAIStop}
                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-600"
              >
                Stop
              </button>
            )}
            {canApply && (
              <button
                type="button"
                onClick={() => onAIApply(aiFields)}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Apply to editor
              </button>
            )}
          </div>
        ) : (
          <FormGenerator
            key={schemaKey}
            schema={schema}
            onSubmit={onSubmit}
            ariaLabel="Playground form"
          />
        )}
      </div>
    </main>
  )
}
