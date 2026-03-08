import { useEffect, useState } from 'react'

const TERMINALS_API_URL =
  import.meta.env.VITE_TERMINALS_API_URL || '/api/terminals'

function normalizeComponent(component) {
  return {
    elementId: component.elementId ?? component.elementID ?? component.id ?? null,
    id: component.id,
    name: component.name,
    type: String(component.type ?? '').toLowerCase(),
    isActive: Boolean(component.isActive),
  }
}

export default function useTimetablesTerminalComponents(terminalId) {
  const [components, setComponents] = useState([])
  const [componentsLoading, setComponentsLoading] = useState(false)
  const [componentsError, setComponentsError] = useState('')
  const [hasFetchedComponents, setHasFetchedComponents] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadComponents() {
      if (!terminalId) {
        setComponents([])
        setComponentsError('')
        setComponentsLoading(false)
        setHasFetchedComponents(false)
        return
      }

      setComponents([])
      setComponentsLoading(true)
      setComponentsError('')
      setHasFetchedComponents(false)

      try {
        const response = await fetch(
          `${TERMINALS_API_URL}/${encodeURIComponent(terminalId)}/components`,
          {
            signal: controller.signal,
          },
        )

        if (!response.ok) {
          throw new Error(`Component request failed with status ${response.status}`)
        }

        const data = await response.json()
        const nextComponents = Array.isArray(data)
          ? data.map(normalizeComponent)
          : []

        setComponents(nextComponents)
        setHasFetchedComponents(true)
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        setComponents([])
        setComponentsError(error.message || 'Failed to load terminal components.')
        setHasFetchedComponents(false)
      } finally {
        setComponentsLoading(false)
      }
    }

    loadComponents()

    return () => controller.abort()
  }, [terminalId])

  return {
    components,
    componentsError,
    hasFetchedComponents,
    componentsLoading,
  }
}
