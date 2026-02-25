import { useMemo, type RefObject } from 'react'

const PADDING = '1rem'
const LINE_HEIGHT = 1.6
const FONT_SIZE = '0.875rem'
const LINE_NUMBERS_WIDTH = '2.5rem'

export interface LineNumbersProps {
  lineCount: number
  containerRef: RefObject<HTMLDivElement>
}

export function LineNumbers({ lineCount, containerRef }: LineNumbersProps) {
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1),
    [lineCount]
  )

  return (
    <div
      ref={containerRef}
      className="shrink-0 overflow-x-hidden overflow-y-scroll border-r border-slate-700/80 bg-slate-800/80 text-right font-mono text-slate-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        width: LINE_NUMBERS_WIDTH,
        paddingTop: PADDING,
        paddingBottom: PADDING,
        paddingLeft: '0.25rem',
        paddingRight: '0.5rem',
        fontSize: FONT_SIZE,
        lineHeight: LINE_HEIGHT,
      }}
      aria-hidden
    >
      {lineNumbers.map((n) => (
        <div key={n}>{n}</div>
      ))}
    </div>
  )
}
