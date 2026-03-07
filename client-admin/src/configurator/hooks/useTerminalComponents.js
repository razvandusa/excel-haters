import { useEffect, useState } from 'react'

const TERMINALS_API_URL =
  import.meta.env.VITE_TERMINALS_API_URL || '/api/terminals'

function normalizeTerminal(terminal) {
  return {
    id: terminal.id,
    name: terminal.name,
    type: String(terminal.type ?? '').toLowerCase(),
    isActive: Boolean(terminal.isActive),
  }
}

function normalizeComponent(component) {
  return {
    id: component.id,
    name: component.name,
    type: String(component.type ?? '').toLowerCase(),
    isActive: Boolean(component.isActive),
  }
}

export default function useTerminalComponents(terminalName) {
  const [terminal, setTerminal] = useState(null)
  const [components, setComponents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadTerminalComponents() {
      setIsLoading(true)
      setError('')

      try {
        const terminalsResponse = await fetch(TERMINALS_API_URL, {
          signal: controller.signal,
        })

        if (!terminalsResponse.ok) {
          throw new Error(
            `Terminal request failed with status ${terminalsResponse.status}`,
          )
        }

        const terminalsData = await terminalsResponse.json()
        const matchedTerminal = Array.isArray(terminalsData)
          ? terminalsData
              .map(normalizeTerminal)
              .find(
                (item) => item.name.toLowerCase() === terminalName.toLowerCase(),
              )
          : null

        if (!matchedTerminal) {
          throw new Error(`Terminal "${terminalName}" was not found.`)
        }

        setTerminal(matchedTerminal)

        const componentsResponse = await fetch(
          `${TERMINALS_API_URL}/${matchedTerminal.id}/components`,
          {
            signal: controller.signal,
          },
        )

        if (!componentsResponse.ok) {
          throw new Error(
            `Component request failed with status ${componentsResponse.status}`,
          )
        }

        const componentsData = await componentsResponse.json()
        const nextComponents = Array.isArray(componentsData)
          ? componentsData.map(normalizeComponent)
          : []

        setComponents(nextComponents)
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          return
        }

        setTerminal(null)
        setComponents([])
        setError(fetchError.message || 'Failed to load terminal components.')
      } finally {
        setIsLoading(false)
      }
    }

    if (terminalName) {
      loadTerminalComponents()
    } else {
      setTerminal(null)
      setComponents([])
      setError('Missing terminal name.')
      setIsLoading(false)
    }

    return () => controller.abort()
  }, [terminalName])

  return {
    terminal,
    components,
    isLoading,
    error,
  }
}
