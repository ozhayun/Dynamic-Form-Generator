/**
 * Minimal page for Next.js dev server. Frontend runs on Vite; this is for API-only usage.
 * Run the form builder UI with: npm run dev (Vite)
 * Run the API with: npm run dev:api (Next.js)
 */
export default function ApiInfoPage() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Form Generator API</h1>
      <p>Use POST <code>/api/chat</code> with body: <code>{'{"prompt": "your form description"}'}</code></p>
      <p>Run the form builder UI with <code>npm run dev</code> (Vite).</p>
    </div>
  )
}
