export function PlaygroundHeader() {
  return (
    <header className="shrink-0 border-b border-slate-700/60 bg-slate-900 px-6 py-5 shadow-lg shadow-black/20">
      <div className="flex items-center gap-3">
        <img
          src="/online-survey.svg"
          alt=""
          className="h-10 w-10 shrink-0"
          width={40}
          height={40}
          aria-hidden
        />
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-slate-100">
            Dynamic Form Builder
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Define your form with a JSON schema; the preview updates live.
          </p>
        </div>
      </div>
    </header>
  )
}
