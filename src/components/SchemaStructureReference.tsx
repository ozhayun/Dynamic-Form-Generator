export interface SchemaStructureReferenceProps {
  variant?: 'inline' | 'modal'
}

export function SchemaStructureReference({ variant = 'inline' }: SchemaStructureReferenceProps) {
  const isModal = variant === 'modal'
  const containerClass = isModal
    ? 'space-y-4 text-slate-400'
    : 'space-y-3 text-slate-400'
  const preClass = isModal
    ? 'whitespace-pre-wrap rounded bg-slate-900/80 p-3 text-sm leading-relaxed'
    : 'whitespace-pre-wrap rounded bg-slate-900/80 p-2 text-[11px] leading-relaxed'
  const headingClass = isModal
    ? 'mb-1.5 font-medium text-slate-300 text-sm'
    : 'mb-1 font-medium text-slate-300'

  return (
    <div className={isModal ? 'font-mono text-sm text-slate-300' : ''}>
      <div className={containerClass}>
        <section>
          <p className={headingClass}>Each field is an object:</p>
          <pre className={preClass}>
{`{
  "id": "string",           // required, unique
  "type": "string",         // required (see types below)
  "label": "string",        // optional
  "placeholder": "string",  // optional
  "validation": { ... },   // optional
  "visibility": { ... }    // optional
}`}
          </pre>
        </section>
        <section>
          <p className={headingClass}>Types:</p>
          <ul className={`list-inside list-disc space-y-0.5 pl-1 ${isModal ? 'text-sm' : ''}`}>
            <li><code className="text-amber-300">text</code> – single-line text</li>
            <li><code className="text-amber-300">email</code> – email input</li>
            <li><code className="text-amber-300">password</code> – password input</li>
            <li><code className="text-amber-300">textarea</code> – multi-line text</li>
            <li><code className="text-amber-300">number</code> – number input</li>
            <li><code className="text-amber-300">select</code> – dropdown (requires <code className="text-violet-400">options</code>)</li>
          </ul>
        </section>
        <section>
          <p className={headingClass}>Select requires <code className="text-violet-400">options</code>:</p>
          <pre className={preClass}>
{`"options": [
  { "value": "id", "label": "Display Label" }
]`}
          </pre>
        </section>
        <section>
          <p className={headingClass}>validation (optional):</p>
          <pre className={preClass}>
{`{
  "required": true,      // boolean
  "minLength": 8,        // number
  "maxLength": 300,      // number
  "pattern": "^regex$"  // string (regex); value is trimmed before test
}`}
          </pre>
          <p className={`mt-1 text-slate-500 ${isModal ? 'text-xs' : 'text-[10px]'}`}>
            Pattern uses JavaScript regex. In JSON use double backslash for one backslash. Phone example: <code className="text-amber-300">{`"^\\+?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$"`}</code> matches +1 123-456-7890.
          </p>
        </section>
        <section>
          <p className={headingClass}>visibility (optional):</p>
          <pre className={preClass}>
{`{
  "field": "otherFieldId",  // string (must be a visible field)
  "operator": "equals",     // equals | notEquals | in | greaterThan
  "value": "manager"        // string | number | array (for "in")
}`}
          </pre>
          <ul className={`list-inside list-disc space-y-0.5 pl-1 mt-1.5 ${isModal ? 'text-sm' : ''}`}>
            <li>Field is visible only if the referenced field is visible (cascade).</li>
            <li><code className="text-amber-300">notEquals: ""</code> — false when value is undefined, null, or empty.</li>
            <li><code className="text-amber-300">greaterThan</code> — false when value is undefined or not a number.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
