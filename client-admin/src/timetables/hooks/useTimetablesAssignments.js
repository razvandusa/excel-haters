import { useEffect, useState } from 'react'

const COMPONENTS_API_URL =
  import.meta.env.VITE_COMPONENTS_API_URL || '/api/components'

function formatTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function normalizeAssignments(data) {
  return Array.isArray(data) ? data : []
}

export default function useTimetablesAssignments(componentId) {
  const [assignments, setAssignments] = useState([])
  const [assignmentsLoading, setAssignmentsLoading] = useState(false)
  const [assignmentsError, setAssignmentsError] = useState('')
  const [hasFetchedAssignments, setHasFetchedAssignments] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadAssignments() {
      if (!componentId) {
        setAssignments([])
        setAssignmentsError('')
        setAssignmentsLoading(false)
        setHasFetchedAssignments(false)
        return
      }

      setAssignments([])
      setAssignmentsLoading(true)
      setAssignmentsError('')
      setHasFetchedAssignments(false)

      const assignmentsUrl = `${COMPONENTS_API_URL}/${encodeURIComponent(componentId)}/assignments?date=${formatTodayDate()}`

      try {
        const response = await fetch(assignmentsUrl, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Assignments request failed with status ${response.status}`)
        }

        const data = await response.json()

        setAssignments(normalizeAssignments(data))
        setHasFetchedAssignments(true)
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        setAssignments([])
        setAssignmentsError(error.message || 'Failed to load assignments.')
        setHasFetchedAssignments(false)
      } finally {
        setAssignmentsLoading(false)
      }
    }

    loadAssignments()

    return () => controller.abort()
  }, [componentId])

  return {
    assignments,
    assignmentsError,
    assignmentsLoading,
    hasFetchedAssignments,
  }
}
