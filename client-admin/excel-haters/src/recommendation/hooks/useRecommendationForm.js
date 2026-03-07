import { useState } from 'react'
import recommendationContent from '../config/recommendationContent.js'
import flightsData from '../data/flights.json'

const RECOMMENDATION_FLIGHT_ID_HISTORY_KEY = 'recommendation-flight-id-history'

function getSavedFlightIdHistory() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const savedValue = window.localStorage.getItem(
      RECOMMENDATION_FLIGHT_ID_HISTORY_KEY,
    )
    const parsedValue = savedValue ? JSON.parse(savedValue) : []

    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

export default function useRecommendationForm() {
  const [flightId, setFlightId] = useState('')
  const [pastFlightIds, setPastFlightIds] = useState(getSavedFlightIdHistory)
  const [result, setResult] = useState(null)

  function saveFlightIdHistory(nextFlightIds) {
    setPastFlightIds(nextFlightIds)

    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(
      RECOMMENDATION_FLIGHT_ID_HISTORY_KEY,
      JSON.stringify(nextFlightIds),
    )
  }

  function handleSubmit(event) {
    event.preventDefault()

    const normalizedFlightId = flightId.trim()

    if (normalizedFlightId) {
      const nextFlightIds = [
        normalizedFlightId,
        ...pastFlightIds.filter((id) => id !== normalizedFlightId),
      ]

      saveFlightIdHistory(nextFlightIds)
    }

    const matchedFlight = flightsData.find(
      (flight) => String(flight.flightID) === normalizedFlightId,
    )

    if (matchedFlight) {
      const nextResult = {
        flight: matchedFlight,
        isValid: true,
        message: `Flight ID ${normalizedFlightId} is valid.`,
        title: recommendationContent.validTitle,
      }

      console.log('Recommendation flight JSON:', JSON.stringify(matchedFlight, null, 2))
      setResult(nextResult)
      return
    }

    setResult({
      flight: null,
      isValid: false,
      message: normalizedFlightId
        ? `Flight ID ${normalizedFlightId} is not valid.`
        : 'Enter a flight ID to validate it.',
      title: recommendationContent.invalidTitle,
    })
  }

  return {
    flightId,
    handleSubmit,
    pastFlightIds,
    result,
    setFlightId,
  }
}
