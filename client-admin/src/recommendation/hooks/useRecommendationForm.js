import { useState } from 'react'
import recommendationContent from '../config/recommendationContent.js'

const FLIGHTS_API_URL = import.meta.env.VITE_FLIGHTS_API_URL || '/api/flights'

export default function useRecommendationForm() {
  const [flightId, setFlightId] = useState('')
  const [result, setResult] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()

    const normalizedFlightId = flightId.trim()

    if (!normalizedFlightId) {
      setResult({
        flight: null,
        isValid: false,
        message: 'Enter a flight ID to validate it.',
        title: recommendationContent.invalidTitle,
      })
      return
    }

    try {
      const response = await fetch(
        `${FLIGHTS_API_URL}/${encodeURIComponent(normalizedFlightId)}`,
      )

      if (response.status === 404) {
        setResult({
          flight: null,
          isValid: false,
          message: `Flight ID ${normalizedFlightId} is not valid.`,
          title: recommendationContent.invalidTitle,
        })
        return
      }

      if (!response.ok) {
        throw new Error(`Flight request failed with status ${response.status}`)
      }

      const matchedFlight = await response.json()
      const nextResult = {
        flight: matchedFlight,
        isValid: true,
        message: `Flight ID ${normalizedFlightId} is valid.`,
        title: recommendationContent.validTitle,
      }

      console.log('Recommendation flight JSON:', matchedFlight)
      setResult(nextResult)
      return
    } catch (error) {
      setResult({
        flight: null,
        isValid: false,
        message:
          error.message || `Failed to load flight ID ${normalizedFlightId}.`,
        title: recommendationContent.invalidTitle,
      })
    }
  }

  return {
    flightId,
    handleSubmit,
    result,
    setFlightId,
  }
}
