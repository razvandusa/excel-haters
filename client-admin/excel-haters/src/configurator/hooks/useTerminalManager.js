import { useEffect, useState } from 'react'
import componentsData from '../data/components.json'
import debugApiRequest from '../../shared/debugApiRequest.js'

const TERMINALS_API_URL =
  import.meta.env.VITE_TERMINALS_API_URL || '/api/terminals'

function normalizeTerminal(terminal) {
  const terminalId = terminal.id ?? terminal.terminalId ?? terminal.terminalID
  const terminalName = terminal.name ?? terminal.terminalName ?? ''

  return {
    id: terminalId,
    name: terminalName,
    type: String(terminal.type ?? '').toLowerCase(),
    isActive: Boolean(terminal.isActive),
  }
}

export default function useTerminalManager() {
  const [terminals, setTerminals] = useState([])
  const [terminalsLoading, setTerminalsLoading] = useState(true)
  const [terminalsError, setTerminalsError] = useState('')
  const [isCreatingTerminal, setIsCreatingTerminal] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTerminals() {
      setTerminalsLoading(true)
      setTerminalsError('')

      try {
        debugApiRequest({
          method: 'GET',
          url: TERMINALS_API_URL,
        })

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
  }, [refreshToken])

  async function createTerminal(terminal) {
    setIsCreatingTerminal(true)

    try {
      debugApiRequest({
        method: 'POST',
        url: TERMINALS_API_URL,
        payload: terminal,
      })

      const response = await fetch(TERMINALS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(terminal),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      setRefreshToken((currentValue) => currentValue + 1)
    } finally {
      setIsCreatingTerminal(false)
    }
  }

  return {
    components: componentsData,
    createTerminal,
    isCreatingTerminal,
    terminals,
    terminalsError,
    terminalsLoading,
  }
}
