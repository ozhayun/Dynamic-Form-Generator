import { memo, useState, useCallback } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export interface MagicInputProps {
  /** Called when the user submits the prompt (e.g. to trigger AI generation). */
  onSubmit: (prompt: string) => void
  /** Whether a request is in progress; can disable submit. */
  isLoading?: boolean
  /** Placeholder for the input. */
  placeholder?: string
  /** Accessible label for the input. */
  ariaLabel?: string
  /** Optional class for the container. */
  className?: string
}

function MagicInputComponent({
  onSubmit,
  isLoading = false,
  placeholder = 'Describe the form you want, e.g. "Signup with email, password, and country dropdown"',
  ariaLabel = 'Natural language form description',
  className,
}: MagicInputProps) {
  const [value, setValue] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed && !isLoading) {
        onSubmit(trimmed)
      }
    },
    [value, isLoading, onSubmit]
  )

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className ?? ''}`} role="search">
      <div className="flex flex-col w-full gap-3 sm:gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={isLoading}
          rows={3}
          className="min-h-[8rem] sm:min-h-[3.5rem] w-full max-w-full resize-y sm:resize-none rounded-xl sm:rounded-lg border border-slate-600/80 bg-slate-800/60 px-4 py-3.5 sm:px-3.5 sm:py-2.5 text-base sm:text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-violet-500/80 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-60 box-border transition-colors"
        />
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-xl sm:rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 sm:px-4 sm:py-2.5 text-base sm:text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-violet-500/40 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:hover:shadow-violet-500/25"
            aria-label={isLoading ? 'Generating…' : 'Generate form with AI'}
          >
            <span className="absolute inset-0 transition-opacity opacity-0 bg-gradient-to-r from-violet-500/0 via-white/10 to-indigo-500/0 group-hover:opacity-100" aria-hidden />
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 sm:h-4 sm:w-4 shrink-0 animate-spin" aria-hidden />
                <span>Generating…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 sm:h-4 sm:w-4 shrink-0" aria-hidden />
                <span>Generate with AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

export const MagicInput = memo(MagicInputComponent)
