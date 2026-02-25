export type TokenType = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation' | 'whitespace' | 'other'

export interface Token {
  type: TokenType
  value: string
}

function isJsonKey(text: string, afterStringEnd: number): boolean {
  let i = afterStringEnd
  while (i < text.length && /[\s\n]/.test(text[i] ?? '')) i += 1
  return (text[i] ?? '') === ':'
}

export function tokenizeJson(text: string): Token[] {
  const tokens: Token[] = []
  let pos = 0

  while (pos < text.length) {
    const rest = text.slice(pos)
    let match: RegExpMatchArray | null = null
    let type: TokenType = 'other'

    if ((match = rest.match(/^"(?:[^"\\]|\\.)*"/))) {
      type = isJsonKey(text, pos + match[0].length) ? 'key' : 'string'
    } else if ((match = rest.match(/^-?\d+\.?\d*([eE][+-]?\d+)?/))) {
      type = 'number'
    } else if ((match = rest.match(/^\b(true|false|null)\b/))) {
      type = match[1] === 'null' ? 'null' : 'boolean'
    } else if ((match = rest.match(/^[{}\[\],:]/))) {
      type = 'punctuation'
    } else if ((match = rest.match(/^[\s\n]+/))) {
      type = 'whitespace'
    } else {
      match = rest.match(/^./)
    }

    if (match && match[0]) {
      tokens.push({ type, value: match[0] })
      pos += match[0].length
    } else {
      pos += 1
    }
  }

  return tokens
}

export const TOKEN_CLASSES: Record<TokenType, string> = {
  key: 'text-violet-400',
  string: 'text-amber-300',
  number: 'text-sky-400',
  boolean: 'text-emerald-400',
  null: 'text-slate-400',
  punctuation: 'text-slate-500',
  whitespace: '',
  other: 'text-slate-300',
}
