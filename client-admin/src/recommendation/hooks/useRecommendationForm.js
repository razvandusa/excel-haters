import { useState } from 'react'
import recommendationContent from '../config/recommendationContent.js'

const FLIGHTS_API_URL = import.meta.env.VITE_FLIGHTS_API_URL || '/api/flights'

async function readResponseBody(response) {
  const responseContentType = response.headers.get('content-type') || ''

  if (responseContentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export default function useRecommendationForm({
  fieldLabel = recommendationContent.flightIdPlaceholder,
} = {}) {
  const [flightId, setFlightId] = useState('')
  const [result, setResult] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()

    const normalizedFlightId = flightId.trim()

    if (!normalizedFlightId) {
      setResult({
        flight: null,
        isValid: false,
        message: `Enter a ${fieldLabel.toLowerCase()} to validate it.`,
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
          message: `${fieldLabel} ${normalizedFlightId} is not valid.`,
          title: recommendationContent.invalidTitle,
        })
        return
      }

      if (!response.ok) {
        const responseBody = await readResponseBody(response)

        console.error('Recommendation flight API response:', {
          status: response.status,
          body: responseBody,
        })
        throw new Error(`Flight request failed with status ${response.status}`)
      }

      const matchedFlight = await response.json()
      const componentsResponse = await fetch(
        `${FLIGHTS_API_URL}/${encodeURIComponent(normalizedFlightId)}/assignments`,
      )

      if (!componentsResponse.ok) {
        const responseBody = await readResponseBody(componentsResponse)

        console.error('Recommendation assignments API response:', {
          status: componentsResponse.status,
          body: responseBody,
        })
        throw new Error(
          `Flight components request failed with status ${componentsResponse.status}`,
        )
      }

      const matchedComponents = await componentsResponse.json()
      const nextResult = {
        flight: matchedFlight,
        components: Array.isArray(matchedComponents) ? matchedComponents : [],
        isValid: true,
        message: `${fieldLabel} ${normalizedFlightId} is valid.`,
        title: recommendationContent.validTitle,
      }

      console.log('Recommendation flight JSON:', matchedFlight)
      console.log('Recommendation flight components JSON:', matchedComponents)
      setResult(nextResult)
      return
    } catch (error) {
      setResult({
        flight: null,
        components: [],
        isValid: false,
        message:
          error.message ||
          `Failed to load ${fieldLabel.toLowerCase()} ${normalizedFlightId}.`,
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
