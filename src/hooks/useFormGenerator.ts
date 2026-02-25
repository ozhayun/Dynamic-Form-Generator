import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormSchema } from '../types/schema'
import { validateField, validateForm } from '../utils/validate'
import { isFieldVisible as computeFieldVisibility } from '../utils/visibility'

function getInitialValues(schema: FormSchema): Record<string, unknown> {
  const initial: Record<string, unknown> = {}
  for (const field of schema) {
    initial[field.id] = ''
  }
  return initial
}

export function useFormGenerator(schema: FormSchema) {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    getInitialValues(schema)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const visibleFields = useMemo((): FormSchema => {
    return schema.filter((field) =>
      computeFieldVisibility(field.id, schema, values)
    )
  }, [schema, values])

  const visibleIdsSet = useMemo(
    () => new Set(visibleFields.map((f) => f.id)),
    [visibleFields]
  )

  const isFieldVisible = useCallback(
    (fieldId: string): boolean => visibleIdsSet.has(fieldId),
    [visibleIdsSet]
  )

  const visibleIdsRef = useRef<string>('')
  useEffect(() => {
    const visibleIds = new Set(visibleFields.map((f) => f.id))
    const visibleIdsKey = [...visibleIds].sort().join(',')
    if (visibleIdsRef.current === visibleIdsKey) return
    visibleIdsRef.current = visibleIdsKey

    setValues((prev) => {
      const next: Record<string, unknown> = {}
      for (const id of Object.keys(prev)) {
        if (visibleIds.has(id)) next[id] = prev[id]
      }
      return next
    })
    setErrors((prev) => {
      const next = { ...prev }
      for (const id of Object.keys(next)) {
        if (!visibleIds.has(id)) delete next[id]
      }
      return next
    })
    setTouched((prev) => {
      const next = { ...prev }
      for (const id of Object.keys(next)) {
        if (!visibleIds.has(id)) delete next[id]
      }
      return next
    })
  }, [visibleFields])

  const setValue = useCallback((id: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [id]: value }))
  }, [])

  const fieldSchema = useCallback(
    (id: string) => schema.find((f) => f.id === id) ?? null,
    [schema]
  )

  const validateSingleField = useCallback(
    (id: string): boolean => {
      const field = fieldSchema(id)
      if (!field) return true
      if (!visibleIdsSet.has(id)) return true
      const message = validateField(field, values[id])
      setErrors((prev) => {
        if (message) return { ...prev, [id]: message }
        const next = { ...prev }
        delete next[id]
        return next
      })
      return message === null
    },
    [fieldSchema, values, visibleIdsSet]
  )

  const validateAll = useCallback((): boolean => {
    const nextErrors = validateForm(visibleFields, values)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [visibleFields, values])

  const handleChange = useCallback(
    (id: string, value: unknown) => {
      setValue(id, value)
      if (touched[id]) validateSingleField(id)
    },
    [setValue, touched, validateSingleField]
  )

  const handleBlur = useCallback(
    (id: string) => {
      setTouched((prev) => ({ ...prev, [id]: true }))
      validateSingleField(id)
    },
    [validateSingleField]
  )

  const reset = useCallback(() => {
    setValues(getInitialValues(schema))
    setErrors({})
    setTouched({})
  }, [schema])

  const handleSubmit = useCallback(
    (onValidSubmit: (values: Record<string, unknown>) => void) => {
      setTouched(
        schema.reduce<Record<string, boolean>>((acc, f) => ({ ...acc, [f.id]: true }), {})
      )
      if (!validateAll()) return
      const visibleValues: Record<string, unknown> = {}
      for (const field of visibleFields) {
        visibleValues[field.id] = values[field.id]
      }
      onValidSubmit(visibleValues)
      reset()
    },
    [schema, validateAll, visibleFields, values, reset]
  )

  return {
    values,
    errors,
    touched,
    visibleFields,
    isFieldVisible,
    setValue,
    handleChange,
    handleBlur,
    validateField: validateSingleField,
    validateAll,
    handleSubmit,
    reset,
  }
}
