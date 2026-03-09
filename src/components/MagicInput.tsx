import { memo, useState, useCallback } from 'react'

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
      <div className="flex w-full flex-col gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={isLoading}
          rows={3}
          className="min-h-[4.5rem] w-full max-w-full resize-y rounded-lg border border-slate-600 bg-slate-800/90 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:opacity-60 sm:text-sm box-border"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:hover:bg-violet-600"
            aria-label={isLoading ? 'Generating…' : 'Generate form'}
          >
            {isLoading ? '…' : 'Generate'}
          </button>
        </div>
      </div>
    </form>
  )
}

export const MagicInput = memo(MagicInputComponent)
