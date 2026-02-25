import type { FormSchema } from '../types/schema'
import { FormGenerator } from './FormGenerator'

export interface PreviewPaneProps {
  schema: FormSchema
  schemaKey: number
  onSubmit: (values: Record<string, unknown>) => void
}

export function PreviewPane({ schema, schemaKey, onSubmit }: PreviewPaneProps) {
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
        <FormGenerator
          key={schemaKey}
          schema={schema}
          onSubmit={onSubmit}
          ariaLabel="Playground form"
        />
      </div>
    </main>
  )
}
