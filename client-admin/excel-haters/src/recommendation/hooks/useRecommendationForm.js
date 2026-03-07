import { useState } from 'react'
import recommendationContent from '../config/recommendationContent.js'
import flightsData from '../data/flights.json'

export default function useRecommendationForm() {
  const [flightId, setFlightId] = useState('')
  const [result, setResult] = useState(null)

  function handleSubmit(event) {
    event.preventDefault()

    const normalizedFlightId = flightId.trim()
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
    result,
    setFlightId,
  }
}
