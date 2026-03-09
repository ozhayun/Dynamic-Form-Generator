# Dynamic Form Builder

A **library-grade** React form generator driven by JSON schema. Define fields, declarative validation rules, and conditional visibility in JSON; the form renders, validates, and maintains referential integrity between visibility dependencies and form state. Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Vite**.

**[Live Demo](https://generate-dynamic-form.netlify.app/)**

---

## Project Overview

This project is a headless-capable form engine: schema in, validated values out. The stack is deliberately minimal:

| Layer        | Choice              | Role |
|-------------|---------------------|------|
| **Runtime** | React 18             | Component model and hooks for state/effects |
| **Language**| TypeScript (strict)  | Discriminated unions for schema; no `any` |
| **Styling** | Tailwind CSS         | Utility-first styling in presentational components |
| **Tooling** | Vite                 | Fast dev server and production build |

The architecture enforces **separation of concerns**: all form state, visibility resolution, and validation live in `useFormGenerator` and pure utils; UI components are presentational and receive props from the hook. The playground (split EditorPane / PreviewPane) is a consumer of the same public API that any host app would use.

---

## Setup Instructions

From the project root:

| Step | Command |
|------|--------|
| Install dependencies | `npm install` |
| Start dev server     | `npm run dev`   |
| Open in browser      | http://localhost:5173 |

Other scripts (from `package.json`):

| Script | Command | Description |
|--------|---------|-------------|
| Build  | `npm run build`  | `tsc -b` then `vite build` |
| Preview| `npm run preview`| Serve production build locally |
| Lint   | `npm run lint`   | Run ESLint |
| API (Next.js) | `npm run dev:api` | Next.js server for AI form generation (port 3000) |

To use the **Magic Input** (AI form generation), run `npm run dev:api` and set `OPENAI_API_KEY` (e.g. in `.env.local`). The UI calls `http://localhost:3000/api/chat` by default; override with `VITE_AI_API_URL` if needed.

---

## Architectural Decisions

### 1. Registry Pattern (`src/components/fields/index.tsx`)

Field rendering is driven by a **type-to-component registry**, so adding a new field type does not require changes to `FormGenerator` or core logic.

- **`fieldRegistry`**: A `Record<FieldType, ComponentType<FieldComponentProps>>` mapping each schema `type` (`'text' | 'email' | 'password' | 'select' | 'textarea' | 'number'`) to its atomic component.
- **`getFieldComponent(type)`**: Resolves the component for a given `type`. If the type is unknown (`isKnownFieldType` is false), it logs a `console.warn` and falls back to `TextField`, so the form never crashes on malformed schema.
- **`isKnownFieldType(type)`**: Type guard over `KNOWN_TYPES` so that only valid `FieldType` values index into the registry.

All field components share the same **`FieldComponentProps`** contract (`field`, `value`, `error`, `onChange`, `onBlur`), keeping the generator agnostic of concrete field implementations.

### 2. Headless Logic (`src/hooks/useFormGenerator.ts`)

Form behavior is fully encapsulated in **`useFormGenerator(schema)`**. The hook owns:

- **State:** `values`, `errors`, `touched` keyed by field `id`.
- **Visibility:** `visibleFields` is a memoized filter of `schema` using `computeFieldVisibility` (the exported `isFieldVisible` from `src/utils/visibility.ts`). `isFieldVisible(fieldId)` is exposed as a stable callback for UI.
- **Validation:** `validateSingleField(id)` and `validateAll()` delegate to `validateField` / `validateForm` in `src/utils/validate.ts`. Validation runs only on fields present in `visibleIdsSet`, so hidden required fields do not block submit.
- **Data hygiene:** A `useEffect` keyed on `visibleFields` clears `values`, `errors`, and `touched` for any id no longer in the visible set, preserving referential integrity and preventing hidden-field data from leaking into submit payloads.
- **Submit:** `handleSubmit(onValidSubmit)` touches all fields, runs `validateAll()`, and only on success calls `onValidSubmit` with the **visible** values and then `reset()`.

The UI (`FormGenerator`, field components) is purely presentational: it receives `values`, `errors`, `visibleFields`, `handleChange`, `handleBlur`, `handleSubmit` and renders. No form logic lives in components.

### 3. Discriminated Unions (`src/types/schema.ts`)

Schema typing uses a **discriminated union** on the `type` literal so that TypeScript can narrow safely and each field type can have its own shape.

- **Base:** `BaseFieldSchema` defines `id`, `type`, `label`, `placeholder`, `validation`, and optional `visibility`.
- **Variants:** `TextFieldSchema`, `EmailFieldSchema`, `PasswordFieldSchema`, `SelectFieldSchema`, `TextareaFieldSchema`, `NumberFieldSchema` extend the base with `type: 'text'`, `type: 'email'`, etc. `SelectFieldSchema` adds `options: SelectOption[]`.
- **Union:** `FieldSchema` is the union of all variants; `FormSchema = FieldSchema[]`.
- **FieldType:** `FieldSchema['type']` gives the exhaustive set of type literals for the registry and guards.

This enables exhaustive narrowing in validation and visibility logic (e.g. string-only rules apply only when `isStringFieldType(field.type)`), and guarantees that `select` fields have `options` at compile time.

---

## Key Engineering Highlights

### Recursive Visibility and Transitive Dependencies

Visibility is implemented in **`src/utils/visibility.ts`**.

- **`evaluateVisibility(rule, values)`**: Evaluates a single `FieldVisibility` rule (operators: `equals`, `notEquals`, `in`, `greaterThan`) against current form values.
- **`isFieldVisible(fieldId, schema, currentValues, visited?)`**: Recursively determines visibility:
  1. Uses a **`visited`** `Set` to short-circuit circular references (returns `false` if `fieldId` is already in `visited`).
  2. Finds the field in the schema; if it has no `visibility`, returns `true`.
  3. Resolves the **dependency**: `depId = field.visibility.field`. The dependent field must be visible first: `depVisible = isFieldVisible(depId, schema, currentValues, visited)`.
  4. If the dependency is not visible, the current field is hidden (transitive dependency failure).
  5. Otherwise, returns the result of `evaluateVisibility(field.visibility, currentValues)`.

So a chain A → B → C is correct: C must be visible, then B’s rule must pass, then A’s rule. The hook exposes this via **`computeFieldVisibility`** (imported as `isFieldVisible` in `useFormGenerator`) to build `visibleFields` and `visibleIdsSet`.

### Declarative Validation and Pluggable Rules (`src/utils/validate.ts`)

Validation is **declarative** and **pluggable** via a handler map.

- **`validationRuleHandlers`**: A `Record<keyof FieldValidation, ValidationRuleHandler>`. Each key (`required`, `minLength`, `maxLength`, `pattern`) has a handler `(ruleKey, ruleValue, ctx) => string | null` that returns an error message or `null`. Context `ctx` includes `field`, `value`, `str` (string form of value), and `getDisplayName`.
- **`validateField(field, value)`**: Builds the context and runs the appropriate handlers for the field’s `validation` object. Required is checked first; if the value is empty and not required, it returns `null` without running other rules. Number fields get explicit required/NaN handling.
- **`validateForm(fields, values)`**: Iterates over the given field list and collects errors from `validateField`, returning `Record<string, string>`.

**Edge case — regex safety:** The `pattern` handler wraps `new RegExp(ruleValue)` and `.test(ctx.str)` in a **try/catch**. Invalid regex patterns do not throw; the handler returns `'Invalid format'`, so the app never crashes on malformed `pattern` strings.

### Accessibility (A11y)

Implemented consistently across field components (e.g. `TextField`, `SelectField` in `src/components/fields/`):

| Pattern | Implementation |
|--------|----------------|
| **Label association** | Each control uses `id={id}` with `id = \`field-${field.id}\`` and a `<label htmlFor={id}>`. Label text is `field.label ?? field.id`. |
| **Invalid state** | Controls set `aria-invalid={hasError ? 'true' : undefined}` when `error` is present. |
| **Error description** | Error message element has `id={\`${id}-error\`}` and `role="alert"`. The control sets `aria-describedby={hasError ? \`${id}-error\` : undefined}` so assistive tech can announce the error. |

The playground’s **JsonEditor** (`src/components/JsonEditor.tsx`) forwards `aria-label`, `aria-invalid`, and `aria-describedby` to the underlying `<textarea>` so schema parse/validation errors can be associated with the editor (e.g. via `aria-describedby="schema-parse-error"` from `EditorPane`).

---

## Edge Case Handling

### Duplicate ID Gating (Playground)

Schema from the editor is **not** applied to the preview until it is valid. In **`src/components/FormPlayground.tsx`**:

- **`parseSchemaJson(raw)`**: Parses JSON and returns either `{ schema }` or `{ error }`. No state update yet.
- **Debounced effect** (300 ms): On `editorValue` change, it runs `parseSchemaJson(editorValue)`. If parsing fails, it sets `parseError` and clears schema errors. If parsing succeeds, it runs **`validateSchema(parseResult.schema)`** from `src/utils/schemaValidation.ts`.
- **Gating:** Only when **`validation.valid`** is true does the effect call **`setSchema(parseResult.schema)`**. So the live form never receives a schema with duplicate IDs or other validation failures.

**`validateSchema`** in `src/utils/schemaValidation.ts` maintains a **`seenIds`** `Set`. For each field object, if `item.id` is already in `seenIds`, it pushes an error: `duplicate "id": "${item.id}". Each field must have a unique id.` That error blocks `valid` and therefore blocks updating `schema`, implementing the gating mechanism.

### Data Hygiene (Hidden Fields)

When the set of visible fields changes, form state must not retain values, errors, or touched state for fields that are now hidden. **`useFormGenerator`** does this in a **`useEffect`** that depends on **`visibleFields`**:

- Builds `visibleIds` from `visibleFields`. Uses a **`visibleIdsRef`** and a sorted-ids key to avoid running the cleanup when the visible set is unchanged (e.g. same fields, different order).
- **Values:** Copies into `next` only keys that remain in `visibleIds`; hidden ids are dropped.
- **Errors / Touched:** Copies previous state and **deletes** keys that are not in `visibleIds`.

Submit payload is built from **`visibleFields`** and **`values`**, so only visible field values are ever submitted; no hidden-field data leaks.

### Regex (Pattern) Protection

In **`src/utils/validate.ts`**, the **`pattern`** handler (inside `validationRuleHandlers`) uses:

```ts
try {
  const re = new RegExp(ruleValue)
  if (!re.test(ctx.str)) return 'Invalid format'
} catch {
  return 'Invalid format'
}
```

Invalid regex from the schema never throws; the user sees a consistent "Invalid format" message and the app remains stable.

---

## Challenges & Solutions

### Ghost Visibility (Transitive Dependencies)

**Problem:** With chained visibility (e.g. Field A depends on Field B, B depends on C), a naive implementation could show A when B’s value satisfies A’s rule even if B (or C) is hidden. That produces “ghost” visibility: a field appears when part of its dependency chain is not visible.

**Solution:** Visibility is defined recursively in **`isFieldVisible`** in **`src/utils/visibility.ts`**. For a field with a `visibility` rule:

1. The **dependency** `visibility.field` is resolved.
2. The dependency is required to be visible **first**: `depVisible = isFieldVisible(depId, schema, currentValues, visited)`.
3. If `!depVisible`, the current field is hidden regardless of its own rule.
4. Only if the dependency is visible do we evaluate the current field’s rule with `evaluateVisibility(field.visibility, currentValues)`.

The **`visited`** set prevents infinite recursion on circular references (e.g. A → B → A). The hook then uses this function to compute `visibleFields` and `visibleIdsSet`, so the entire UI and validation layer see a consistent, transitively correct set of visible fields.

---

## Project Structure

| Path | Purpose |
|------|---------|
| `src/types/schema.ts` | Discriminated unions (`FieldSchema`, `FormSchema`), `FieldValidation`, `FieldVisibility`, `VisibilityOperator` |
| `src/hooks/useFormGenerator.ts` | Headless form state, visibility, validation, submit, reset, data hygiene |
| `src/components/FormGenerator.tsx` | Renders form from schema using `getFieldComponent`; wires `useFormGenerator` to UI |
| `src/components/fields/index.tsx` | Field registry (`fieldRegistry`), `getFieldComponent`, `isKnownFieldType`; re-exports field components |
| `src/components/fields/*.tsx` | Atomic field components (TextField, EmailField, PasswordField, SelectField, TextareaField, NumberField) |
| `src/utils/visibility.ts` | `isFieldVisible`, `evaluateVisibility`; operators `equals`, `notEquals`, `in`, `greaterThan` |
| `src/utils/validate.ts` | `validationRuleHandlers`, `validateField`, `validateForm`; string/number and regex handling |
| `src/utils/schemaValidation.ts` | `validateSchema`, duplicate-id and structure checks; `SchemaValidationError`, `SchemaValidationResult` |
| `src/components/FormPlayground.tsx` | Playground root: debounced editor, parse + schema validation gating, EditorPane, PreviewPane |
| `src/components/EditorPane.tsx` | Schema editor column: templates, JsonEditor, parse/validation errors, Reference button |
| `src/components/PreviewPane.tsx` | Live preview column: FormGenerator with `schemaKey` for reset on template load |
| `src/templates/index.ts` | `TEMPLATE_OPTIONS` (e.g. task, contact) for playground |

---

## Scripts Summary

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript build then Vite production build |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |

---

## Assumptions

- **Schema is validated before use.** The playground only updates preview schema when `validateSchema()` returns `valid: true`; otherwise errors are shown and the last valid schema is kept.
- **Field IDs are unique.** Enforced by `validateSchema()` via `seenIds`; duplicates are reported and block application of the schema.
- **Visibility rules reference existing field IDs.** `isFieldVisible` looks up `schema.find(f => f.id === fieldId)`; missing dependencies are treated as not visible (field hidden). Circular references are handled by the `visited` set.
- **Validation rules** (required, minLength, maxLength, pattern) are applied per field; `pattern` is a string used with `new RegExp()` inside try/catch. Only visible fields are validated on submit.
