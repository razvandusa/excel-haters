import { useState } from 'react'
import recommendationContent from '../config/recommendationContent.js'

const COMPONENTS_API_URL =
  import.meta.env.VITE_COMPONENTS_API_URL || '/api/components'
const ELEMENTS_API_URL =
  import.meta.env.VITE_ELEMENTS_API_URL || '/api/elements'
const FLIGHTS_API_URL = import.meta.env.VITE_FLIGHTS_API_URL || '/api/flights'

async function readResponseBody(response) {
  const responseContentType = response.headers.get('content-type') || ''

  if (responseContentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

function normalizeResolvedComponent(component, fallback = {}) {
  return {
    id:
      component?.id ??
      component?.componentId ??
      component?.componentID ??
      component?.elementId ??
      component?.elementID ??
      fallback?.id ??
      fallback?.componentId ??
      fallback?.componentID ??
      fallback?.elementId ??
      fallback?.elementID ??
      null,
    name: String(
      component?.name ??
        component?.componentName ??
        component?.elementName ??
        fallback?.name ??
        fallback?.componentName ??
        fallback?.elementName ??
        '',
    ).trim(),
    type: String(
      component?.type ??
        component?.componentType ??
        component?.elementType ??
        fallback?.type ??
        fallback?.componentType ??
        fallback?.elementType ??
        '',
    )
      .trim()
      .toLowerCase(),
  }
}

function getAssignmentComponentId(assignment) {
  const candidate =
    assignment?.componentId ??
    assignment?.componentID ??
    assignment?.elementId ??
    assignment?.elementID ??
    assignment?.component?.id ??
    assignment?.component?.componentId ??
    assignment?.component?.elementId ??
    ''

  return String(candidate).trim()
}

async function fetchComponentDetails(componentId) {
  const detailUrls = [
    `${COMPONENTS_API_URL}/${encodeURIComponent(componentId)}`,
    `${ELEMENTS_API_URL}/${encodeURIComponent(componentId)}`,
  ]

  for (const detailUrl of detailUrls) {
    const response = await fetch(detailUrl)

    if (response.status === 404 || response.status === 405) {
      continue
    }

    if (!response.ok) {
      const responseBody = await readResponseBody(response)
      const responseMessage =
        typeof responseBody === 'string'
          ? responseBody.trim()
          : responseBody?.message || ''

      throw new Error(
        responseMessage ||
          `Component request failed with status ${response.status}`,
      )
    }

    return response.json()
  }

  return null
}

async function resolveFlightComponents(assignments) {
  const normalizedAssignments = Array.isArray(assignments) ? assignments : []

  return Promise.all(
    normalizedAssignments.map(async (assignment) => {
      const componentId = getAssignmentComponentId(assignment)

      if (!componentId) {
        return normalizeResolvedComponent(null, assignment)
      }

      try {
        const component = await fetchComponentDetails(componentId)
        return normalizeResolvedComponent(component, assignment)
      } catch (error) {
        console.error('Recommendation component detail API response:', {
          componentId,
          message: error.message,
        })
        return normalizeResolvedComponent(null, assignment)
      }
    }),
  )
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

      const matchedAssignments = await componentsResponse.json()
      const matchedComponents = await resolveFlightComponents(matchedAssignments)
      const nextResult = {
        flight: matchedFlight,
        components: Array.isArray(matchedComponents) ? matchedComponents : [],
        isValid: true,
        message: `${fieldLabel} ${normalizedFlightId} is valid.`,
        title: recommendationContent.validTitle,
      }

      console.log('Recommendation flight JSON:', matchedFlight)
      console.log('Recommendation flight assignments JSON:', matchedAssignments)
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
