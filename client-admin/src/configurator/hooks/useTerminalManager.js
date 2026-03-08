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

export default function useTerminalManager() {
  const [terminals, setTerminals] = useState([])
  const [terminalsLoading, setTerminalsLoading] = useState(true)
  const [terminalsError, setTerminalsError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadTerminals() {
      setTerminalsLoading(true)
      setTerminalsError('')

      try {
        const response = await fetch(TERMINALS_API_URL, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        const nextTerminals = Array.isArray(data)
          ? data.map(normalizeTerminal)
          : []

        setTerminals(nextTerminals)
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        setTerminals([])
        setTerminalsError(error.message || 'Failed to load terminals.')
      } finally {
        setTerminalsLoading(false)
      }
    }

    loadTerminals()

    return () => controller.abort()
  }, [])

  return {
    components: componentsData,
    terminals,
    terminalsError,
    terminalsLoading,
  }
}
