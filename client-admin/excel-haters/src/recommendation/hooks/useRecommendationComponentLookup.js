import { useEffect, useState } from 'react'
import desksData from '../data/desks.json'
import gatesData from '../data/gates.json'
import securitiesData from '../data/securities.json'
import standsData from '../data/stands.json'

const recommendationComponentData = {
  desk: desksData,
  security: securitiesData,
  gate: gatesData,
  stand: standsData,
}

function formatTypeTitle(type) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export default function useRecommendationComponentLookup(flight) {
  const [matchedComponents, setMatchedComponents] = useState([])
  const [lookupTitle, setLookupTitle] = useState('')
  const [selectedComponentId, setSelectedComponentId] = useState('')

  useEffect(() => {
    setMatchedComponents([])
    setLookupTitle('')
    setSelectedComponentId('')
  }, [flight])

  function handleComponentLookup(component) {
    const sourceComponents = recommendationComponentData[component.type] || []
    const normalizedTerminalId = String(component.terminalID || '').trim().toLowerCase()
    const nextMatchedComponents = sourceComponents.filter((item) => {
      const matchesTerminalId =
        !normalizedTerminalId ||
        String(item.terminalID).trim().toLowerCase() === normalizedTerminalId

      return matchesTerminalId && Boolean(item.isActive)
    })

    setSelectedComponentId(component.id)
    setMatchedComponents(nextMatchedComponents)
    setLookupTitle(
      `Available ${formatTypeTitle(component.type)} Items for Terminal ${component.terminalID}`,
    )
  }

  return {
    handleComponentLookup,
    lookupTitle,
    matchedComponents,
    selectedComponentId,
  }
}
