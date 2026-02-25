import { useEffect } from 'react'
import { SchemaStructureReference } from './SchemaStructureReference'

export interface SchemaReferenceModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SchemaReferenceModal({ isOpen, onClose }: SchemaReferenceModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schema-reference-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl border border-slate-600/80 bg-slate-800 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-600/80 px-4 py-3">
          <h2 id="schema-reference-title" className="font-mono text-base font-medium text-teal-400">
            Schema structure reference
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 hover:bg-slate-700 hover:text-white"
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(85vh-3.5rem)] overflow-auto p-6">
          <SchemaStructureReference variant="modal" />
        </div>
      </div>
    </div>
  )
}
