import { useRef, useEffect, useMemo } from 'react'
import { tokenizeJson, TOKEN_CLASSES } from '../utils/jsonHighlight'
import { LineNumbers } from './LineNumbers'

const PADDING = '1rem'
const LINE_HEIGHT = 1.6
const FONT_SIZE = '0.875rem'

export interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  onScroll?: (scrollTop: number) => void
  readOnly?: boolean
  'aria-label'?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

export function JsonEditor({
  value,
  onChange,
  readOnly = false,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  const lineCount = useMemo(() => {
    if (value === '') return 1
    return value.split('\n').length
  }, [value])

  useEffect(() => {
    const ta = textareaRef.current
    const pre = highlightRef.current
    const lineEl = lineNumbersRef.current
    if (!ta || !pre) return
    const sync = () => {
      pre.scrollTop = ta.scrollTop
      pre.scrollLeft = ta.scrollLeft
      if (lineEl) lineEl.scrollTop = ta.scrollTop
    }
    ta.addEventListener('scroll', sync)
    return () => ta.removeEventListener('scroll', sync)
  }, [])

  const tokens = tokenizeJson(value)

  return (
    <div className="flex w-full md:h-full md:overflow-hidden">
      <LineNumbers lineCount={lineCount} containerRef={lineNumbersRef} />
      <div className="relative min-w-0 flex-1 md:overflow-hidden">
        <pre
          ref={highlightRef}
          className="pointer-events-none relative bg-[#0f172a] font-mono text-slate-300 whitespace-pre-wrap break-words md:absolute md:inset-0 md:overflow-auto"
          style={{
            padding: PADDING,
            fontSize: FONT_SIZE,
            lineHeight: LINE_HEIGHT,
          }}
          aria-hidden
        >
          {tokens.map((t, i) => (
            <span key={i} className={TOKEN_CLASSES[t.type]}>
              {t.value}
            </span>
          ))}
        </pre>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => !readOnly && onChange(e.target.value)}
          readOnly={readOnly}
          className="absolute inset-0 resize-none border-0 bg-transparent font-mono text-transparent caret-amber-400 focus:outline-none focus:ring-0"
          style={{
            padding: PADDING,
            fontSize: FONT_SIZE,
            lineHeight: LINE_HEIGHT,
          }}
          spellCheck={false}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
        />
      </div>
    </div>
  )
}
