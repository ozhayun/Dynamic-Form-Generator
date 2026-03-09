import { streamText, Output } from 'ai'
import { groq } from '@ai-sdk/groq'
import { FORM_GENERATOR_SYSTEM_PROMPT } from '../../../src/lib/ai/prompts/formGeneratorPrompt'

export const maxDuration = 30

// CORS: allow frontend origin. In production set NEXT_PUBLIC_APP_URL (or ALLOWED_ORIGIN) to your frontend URL.
const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'http://localhost:5173'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, X-Requested-With',
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

export async function POST(req: Request) {
  const { prompt } = (await req.json()) as { prompt?: string }
  if (!prompt || typeof prompt !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing or invalid prompt' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    })
  }

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: FORM_GENERATOR_SYSTEM_PROMPT,
    prompt: `Generate a form configuration for the following request.\n\nOutput ONLY valid JSON matching this TypeScript type:\n\n{\n  "fields": Array<{\n    id: string;\n    type: "text" | "email" | "password" | "select" | "textarea" | "number";\n    label?: string;\n    placeholder?: string;\n    validation?: {\n      required?: boolean;\n      minLength?: number;\n      maxLength?: number;\n      pattern?: string;\n    };\n    visibility?: {\n      field: string;\n      operator: "equals" | "notEquals" | "in" | "greaterThan";\n      value: unknown;\n    };\n    options?: Array<{ value: string; label: string }>;\n  }>\n}\n\nDo not include any markdown or explanation.\n\nRequest: ${prompt}`,
    output: Output.json(),
  })

  return result.toTextStreamResponse({
    headers: CORS_HEADERS,
  })
}
