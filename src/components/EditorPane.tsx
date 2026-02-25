import type { FormSchema } from '../types/schema'
import type { SchemaValidationError } from '../utils/schemaValidation'
import { JsonEditor } from './JsonEditor'
import { TEMPLATE_OPTIONS } from '../templates'

export interface EditorPaneProps {
  editorValue: string
  setEditorValue: (value: string) => void
  parseError: string | null
  schemaErrors: SchemaValidationError[]
  onOpenReference: () => void
  loadTemplate: (schema: FormSchema) => void
}

export function EditorPane({
  editorValue,
  setEditorValue,
  parseError,
  schemaErrors,
  onOpenReference,
  loadTemplate,
}: EditorPaneProps) {
  return (
    <aside
      className="flex min-w-0 flex-col bg-[#0f172a] shadow-lg md:flex-[1] md:border-r md:border-slate-700/60"
      aria-label="Playground"
    >
      <div className="shrink-0 border-b border-slate-600/80 px-4 py-3">
        <h2 className="font-sans text-base font-semibold uppercase tracking-wider text-slate-400">
          Playground
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Templates and schema editor. Templates stay in this column.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEMPLATE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => loadTemplate(opt.schema)}
              className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0f172a]"
              aria-label={`Load template: ${opt.label}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-b border-slate-600/80 px-3 py-2">
        <span className="font-mono text-xs font-medium text-teal-400">schema.json</span>
        <div className="flex items-center gap-2">
          {parseError && (
            <span
              id="schema-parse-error"
              className="rounded bg-red-500/20 px-2 py-0.5 font-mono text-[11px] text-red-400"
              role="alert"
            >
              {parseError}
            </span>
          )}
          {!parseError && schemaErrors.length > 0 && (
            <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[11px] text-amber-400" role="alert">
              {schemaErrors.length} error{schemaErrors.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            type="button"
            onClick={onOpenReference}
            className="rounded border border-slate-600 bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            aria-label="Open schema structure reference"
          >
            Reference
          </button>
        </div>
      </div>
      <div className="md:min-h-0 md:flex-1 md:overflow-hidden">
        <JsonEditor
          value={editorValue}
          onChange={setEditorValue}
          aria-label="JSON schema editor"
          aria-describedby={parseError ? 'schema-parse-error' : schemaErrors.length ? 'schema-validation-errors' : undefined}
          aria-invalid={Boolean(parseError || schemaErrors.length > 0)}
        />
      </div>
      {schemaErrors.length > 0 && (
        <div
          id="schema-validation-errors"
          className="max-h-20 shrink-0 overflow-auto border-t border-slate-600/80 bg-slate-900/80 px-3 py-1.5"
          role="alert"
        >
          <ul className="list-inside list-disc space-y-0.5 font-mono text-[10px] text-amber-300/90">
            {schemaErrors.map((err) => (
              <li key={`${err.index ?? ''}-${err.path ?? ''}-${err.message}`}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
