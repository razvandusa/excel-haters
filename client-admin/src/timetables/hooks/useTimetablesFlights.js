import { useEffect, useState } from 'react'

const FLIGHTS_API_URL = import.meta.env.VITE_FLIGHTS_API_URL || '/api/flights'

function getAssignmentFlightIdList(assignment) {
  const flightIds =
    assignment.flightIds ??
    assignment.flights ??
    assignment.flightID ??
    assignment.flightId ??
    assignment.id ??
    []

  if (Array.isArray(flightIds)) {
    return flightIds
      .map((flightId) => String(flightId).trim())
      .filter(Boolean)
  }

  const normalizedFlightId = String(flightIds).trim()

  return normalizedFlightId ? [normalizedFlightId] : []
}

export default function useTimetablesFlights(assignments) {
  const [flightsById, setFlightsById] = useState({})
  const [flightsLoading, setFlightsLoading] = useState(false)
  const [flightsError, setFlightsError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadFlights() {
      const flightIds = [...new Set(assignments.flatMap(getAssignmentFlightIdList))]

      if (!flightIds.length) {
        setFlightsById({})
        setFlightsError('')
        setFlightsLoading(false)
        return
      }

      setFlightsById({})
      setFlightsError('')
      setFlightsLoading(true)

      try {
        const flights = await Promise.all(
          flightIds.map(async (flightId) => {
            const response = await fetch(
              `${FLIGHTS_API_URL}/${encodeURIComponent(flightId)}`,
              {
                signal: controller.signal,
              },
            )

            if (!response.ok) {
              throw new Error(
                `Flight request failed with status ${response.status} for ${flightId}`,
              )
            }

            const data = await response.json()

            return [flightId, data]
          }),
        )

        setFlightsById(Object.fromEntries(flights))
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        setFlightsById({})
        setFlightsError(error.message || 'Failed to load flight details.')
      } finally {
        setFlightsLoading(false)
      }
    }

    loadFlights()

    return () => controller.abort()
  }, [assignments])

  return {
    flightsById,
    flightsError,
    flightsLoading,
  }
}
