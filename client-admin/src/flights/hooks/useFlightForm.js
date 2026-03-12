import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

const FLIGHTS_API_URL = import.meta.env.VITE_FLIGHTS_API_URL || '/api/flights'
const TERMINALS_API_URL =
  import.meta.env.VITE_TERMINALS_API_URL || '/api/terminals'

const emptyFlightForm = {
  flightId: '',
  terminal: '',
  desk: '',
  security: '',
  gate: '',
  stand: '',
  departureTime: '',
  arrivalTime: '',
}

const emptyFlightTimeUpdateForm = {
  flightId: '',
  newTime: '',
}

const emptyCancelFlightForm = {
  id: '',
}

function padTimePart(value) {
  return String(value).padStart(2, '0')
}

function formatLocalDate(dateValue) {
  return [
    dateValue.getFullYear(),
    padTimePart(dateValue.getMonth() + 1),
    padTimePart(dateValue.getDate()),
  ].join('-')
}

function formatDateTimeParts(datePart, rawHour, rawMinute, rawSecond = 0) {
  return `${datePart}T${padTimePart(rawHour)}:${padTimePart(rawMinute)}:${padTimePart(
    Math.floor(rawSecond || 0),
  )}`
}

function formatJsDateTime(dateValue) {
  return formatDateTimeParts(
    formatLocalDate(dateValue),
    dateValue.getHours(),
    dateValue.getMinutes(),
    dateValue.getSeconds(),
  )
}

function getExcelImportDateFallback() {
  return formatLocalDate(new Date())
}

function formatDateTimeValue(value) {
  if (value === undefined || value === null || value === '') {
    return value
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatJsDateTime(value)
  }

  if (typeof value === 'number') {
    const parsedDateCode = XLSX.SSF.parse_date_code(value)

    if (parsedDateCode) {
      const hasDatePart =
        Number(parsedDateCode.y) >= 1900 &&
        Number(parsedDateCode.m) >= 1 &&
        Number(parsedDateCode.d) >= 1
      const datePart = hasDatePart
        ? `${parsedDateCode.y}-${padTimePart(parsedDateCode.m)}-${padTimePart(parsedDateCode.d)}`
        : getExcelImportDateFallback()

      return formatDateTimeParts(
        datePart,
        parsedDateCode.H,
        parsedDateCode.M,
        parsedDateCode.S,
      )
    }
  }

  const normalizedValue = String(value).trim()

  if (normalizedValue === '') {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return `${normalizedValue}T00:00:00`
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalizedValue)) {
    return `${normalizedValue}:00`
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalizedValue)) {
    return normalizedValue
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalizedValue)) {
    return normalizedValue.replace(' ', 'T') + ':00'
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalizedValue)) {
    return normalizedValue.replace(' ', 'T')
  }

  const amPmMatch = normalizedValue.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([APap][Mm])$/,
  )

  if (amPmMatch) {
    const [, rawHour, rawMinute, rawSecond = '00', meridiem] = amPmMatch
    let hour = Number(rawHour)

    if (meridiem.toLowerCase() === 'pm' && hour !== 12) {
      hour += 12
    }

    if (meridiem.toLowerCase() === 'am' && hour === 12) {
      hour = 0
    }

    return formatDateTimeParts(
      getExcelImportDateFallback(),
      hour,
      rawMinute,
      rawSecond,
    )
  }

  const twentyFourHourMatch = normalizedValue.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/,
  )

  if (twentyFourHourMatch) {
    const [, rawHour, rawMinute, rawSecond = '00'] = twentyFourHourMatch

    return formatDateTimeParts(
      getExcelImportDateFallback(),
      rawHour,
      rawMinute,
      rawSecond,
    )
  }

  const slashDateTimeMatch = normalizedValue.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\s*([APap][Mm])?)?$/,
  )

  if (slashDateTimeMatch) {
    const [
      ,
      rawMonth,
      rawDay,
      rawYear,
      rawHour = '00',
      rawMinute = '00',
      rawSecond = '00',
      meridiem = '',
    ] = slashDateTimeMatch
    let hour = Number(rawHour)

    if (meridiem) {
      if (meridiem.toLowerCase() === 'pm' && hour !== 12) {
        hour += 12
      }

      if (meridiem.toLowerCase() === 'am' && hour === 12) {
        hour = 0
      }
    }

    const year =
      rawYear.length === 2 ? `20${rawYear}` : rawYear

    return formatDateTimeParts(
      `${year}-${padTimePart(rawMonth)}-${padTimePart(rawDay)}`,
      hour,
      rawMinute,
      rawSecond,
    )
  }

  const parsedDate = new Date(normalizedValue)

  if (!Number.isNaN(parsedDate.getTime())) {
    return formatJsDateTime(parsedDate)
  }

  return normalizedValue
}

function normalizeFlightTimes(payload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      const normalizedKey = key.toLowerCase().replace(/[\s_-]/g, '')
      const shouldFormatTime =
        normalizedKey === 'departuretime' ||
        normalizedKey === 'arrivaltime' ||
        normalizedKey === 'newtime'

      return [key, shouldFormatTime ? formatDateTimeValue(value) : value]
    }),
  )
}

function formatCreateFlightPayload(payload) {
  return {
    flightId: payload.flightId,
    terminalName: payload.terminal,
    deskName: payload.desk,
    securityName: payload.security,
    gateName: payload.gate,
    standName: payload.stand,
    departureTime: payload.departureTime,
    arrivalTime: payload.arrivalTime,
  }
}

function buildCreateFlightPayload(flightDraft) {
  return formatCreateFlightPayload(normalizeFlightTimes(flightDraft))
}

function normalizeExcelHeaderKey(key) {
  return String(key ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function findExcelRowValue(normalizedRow, aliases) {
  for (const alias of aliases) {
    const normalizedAlias = normalizeExcelHeaderKey(alias)

    if (
      Object.prototype.hasOwnProperty.call(normalizedRow, normalizedAlias)
    ) {
      return normalizedRow[normalizedAlias]
    }
  }

  return ''
}

function normalizeExcelTextValue(value) {
  return String(value ?? '').trim()
}

function normalizeExcelDateTimeValue(value) {
  if (value === undefined || value === null) {
    return ''
  }

  return typeof value === 'string' ? value.trim() : value
}

function normalizeExcelFlightRow(row) {
  const normalizedRow = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      normalizeExcelHeaderKey(key),
      value,
    ]),
  )

  return {
    flightId: normalizeExcelTextValue(
      findExcelRowValue(normalizedRow, ['flightId', 'flightID', 'flight']),
    ),
    terminal: normalizeExcelTextValue(
      findExcelRowValue(normalizedRow, ['terminal', 'terminalName']),
    ),
    desk: normalizeExcelTextValue(
      findExcelRowValue(normalizedRow, ['desk', 'deskName']),
    ),
    security: normalizeExcelTextValue(
      findExcelRowValue(normalizedRow, ['security', 'securityName']),
    ),
    gate: normalizeExcelTextValue(
      findExcelRowValue(normalizedRow, ['gate', 'gateName']),
    ),
    stand: normalizeExcelTextValue(
      findExcelRowValue(normalizedRow, ['stand', 'standName']),
    ),
    departureTime: normalizeExcelDateTimeValue(
      findExcelRowValue(normalizedRow, [
        'departureTime',
        'departureDateTime',
        'departure',
      ]),
    ),
    arrivalTime: normalizeExcelDateTimeValue(
      findExcelRowValue(normalizedRow, [
        'arrivalTime',
        'arrivalDateTime',
        'arrival',
      ]),
    ),
  }
}

function hasFlightRowContent(row) {
  return Object.values(row).some((value) => String(value ?? '').trim() !== '')
}

function normalizeTerminal(terminal) {
  return {
    id: terminal.id,
    name: String(terminal.name ?? '').trim(),
    isActive: Boolean(terminal.isActive),
  }
}

function normalizeComponent(component) {
  return {
    id: component.id ?? component.elementId ?? component.elementID ?? null,
    name: String(component.name ?? '').trim(),
    type: String(component.type ?? '').toLowerCase(),
    isActive: Boolean(component.isActive),
  }
}

async function readResponseBody(response) {
  const responseContentType = response.headers.get('content-type') || ''

  if (responseContentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

function extractApiErrorMessage(responseBody) {
  if (typeof responseBody === 'string') {
    return responseBody.trim()
  }

  if (
    !responseBody ||
    typeof responseBody !== 'object' ||
    Array.isArray(responseBody)
  ) {
    return ''
  }

  const responseError =
    responseBody.error ??
    responseBody.message ??
    responseBody.detail ??
    responseBody.details

  if (responseError === undefined || responseError === null) {
    return ''
  }

  if (typeof responseError === 'string') {
    return responseError.trim()
  }

  try {
    return JSON.stringify(responseError)
  } catch {
    return 'Unknown API error.'
  }
}

function hasApiErrorField(responseBody) {
  return (
    responseBody &&
    typeof responseBody === 'object' &&
    !Array.isArray(responseBody) &&
    typeof responseBody.error === 'string' &&
    responseBody.error.trim() !== ''
  )
}

function isLocalIsoDateTime(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)
}

function ensureCreateFlightPayload(payload) {
  const normalizedPayload = Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : value,
    ]),
  )
  const normalizedDepartureTime = String(
    normalizedPayload.departureTime ?? '',
  ).trim()
  const normalizedArrivalTime = String(normalizedPayload.arrivalTime ?? '').trim()

  if (!normalizedDepartureTime && !normalizedArrivalTime) {
    throw new Error('Departure Time or Arrival Time is required.')
  }

  if (
    normalizedDepartureTime &&
    !isLocalIsoDateTime(normalizedDepartureTime)
  ) {
    throw new Error(
      `Invalid departure time format: "${normalizedDepartureTime}". Expected YYYY-MM-DDTHH:mm:ss.`,
    )
  }

  if (
    normalizedArrivalTime &&
    !isLocalIsoDateTime(normalizedArrivalTime)
  ) {
    throw new Error(
      `Invalid arrival time format: "${normalizedArrivalTime}". Expected YYYY-MM-DDTHH:mm:ss.`,
    )
  }

  return {
    ...normalizedPayload,
    departureTime: normalizedDepartureTime || null,
    arrivalTime: normalizedArrivalTime || null,
  }
}

export default function useFlightForm() {
  const [activeForm, setActiveForm] = useState('')
  const [draftFlight, setDraftFlight] = useState(emptyFlightForm)
  const [draftFlightTimeUpdate, setDraftFlightTimeUpdate] = useState(
    emptyFlightTimeUpdateForm,
  )
  const [draftCancelFlight, setDraftCancelFlight] = useState(
    emptyCancelFlightForm,
  )
  const [terminals, setTerminals] = useState([])
  const [terminalsLoading, setTerminalsLoading] = useState(true)
  const [terminalsError, setTerminalsError] = useState('')
  const [componentsByTerminalId, setComponentsByTerminalId] = useState({})
  const [componentsLoadingByTerminalId, setComponentsLoadingByTerminalId] =
    useState({})
  const [componentsErrorByTerminalId, setComponentsErrorByTerminalId] =
    useState({})

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
          throw new Error(`Terminal request failed with status ${response.status}`)
        }

        const data = await response.json()
        const nextTerminals = Array.isArray(data)
          ? data
              .map(normalizeTerminal)
              .filter((terminal) => terminal.name)
              .sort((left, right) => left.name.localeCompare(right.name))
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

  const selectedTerminal = terminals.find(
    (terminal) => terminal.name === draftFlight.terminal,
  )
  const selectedTerminalId = String(selectedTerminal?.id ?? '')
  const selectedTerminalComponents =
    componentsByTerminalId[selectedTerminalId] ?? []
  const selectedTerminalComponentsLoading = Boolean(
    componentsLoadingByTerminalId[selectedTerminalId],
  )
  const selectedTerminalComponentsError =
    componentsErrorByTerminalId[selectedTerminalId] || ''

  useEffect(() => {
    const controller = new AbortController()

    async function loadTerminalComponents() {
      if (!selectedTerminalId || componentsByTerminalId[selectedTerminalId]) {
        return
      }

      setComponentsLoadingByTerminalId((currentState) => ({
        ...currentState,
        [selectedTerminalId]: true,
      }))
      setComponentsErrorByTerminalId((currentState) => ({
        ...currentState,
        [selectedTerminalId]: '',
      }))

      try {
        const response = await fetch(
          `${TERMINALS_API_URL}/${encodeURIComponent(selectedTerminalId)}/components`,
          {
            signal: controller.signal,
          },
        )

        if (!response.ok) {
          throw new Error(`Component request failed with status ${response.status}`)
        }

        const data = await response.json()
        const nextComponents = Array.isArray(data)
          ? data.map(normalizeComponent).filter((component) => component.name)
          : []

        setComponentsByTerminalId((currentState) => ({
          ...currentState,
          [selectedTerminalId]: nextComponents,
        }))
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        setComponentsErrorByTerminalId((currentState) => ({
          ...currentState,
          [selectedTerminalId]:
            error.message || 'Failed to load terminal components.',
        }))
      } finally {
        setComponentsLoadingByTerminalId((currentState) => ({
          ...currentState,
          [selectedTerminalId]: false,
        }))
      }
    }

    loadTerminalComponents()

    return () => controller.abort()
  }, [componentsByTerminalId, selectedTerminalId])

  function handleFieldChange(field, value) {
    setDraftFlight((currentDraft) => ({
      ...currentDraft,
      ...(field === 'terminal'
        ? {
            desk: '',
            security: '',
            gate: '',
            stand: '',
          }
        : {}),
      [field]: value,
    }))
  }

  function resetForm() {
    setDraftFlight(emptyFlightForm)
  }

  function handleFlightTimeChange(field, value) {
    setDraftFlightTimeUpdate((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }))
  }

  function resetFlightTimeForm() {
    setDraftFlightTimeUpdate(emptyFlightTimeUpdateForm)
  }

  function handleCancelFlightChange(field, value) {
    setDraftCancelFlight((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }))
  }

  function resetCancelFlightForm() {
    setDraftCancelFlight(emptyCancelFlightForm)
  }

  function openAddForm() {
    setActiveForm('add')
  }

  function openUpdateTimeForm() {
    setActiveForm('update-time')
  }

  function openCancelFlightForm() {
    setActiveForm('cancel')
  }

  function closeForm() {
    setActiveForm('')
  }

  async function patchFlight(id, payload) {
    const normalizedId = String(id).trim()

    if (!normalizedId) {
      console.error('[API] PATCH /api/flights/{id} skipped: missing flight ID', payload)
      throw new Error('Missing flight ID.')
    }

    console.log(
      `[API] PATCH ${FLIGHTS_API_URL}/${encodeURIComponent(normalizedId)}`,
      payload,
    )

    const response = await fetch(
      `${FLIGHTS_API_URL}/${encodeURIComponent(normalizedId)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    )

    const responseBody = await readResponseBody(response)
    const responseError = extractApiErrorMessage(responseBody)

    if (!response.ok || hasApiErrorField(responseBody)) {
      console.error('Flight patch API response:', {
        status: response.status,
        body: responseBody,
      })
      throw new Error(
        responseError || `Flight patch failed with status ${response.status}`,
      )
    }

    return responseBody
  }

  async function createFlight(payload) {
    const validatedPayload = ensureCreateFlightPayload(payload)

    console.log(`[API] POST ${FLIGHTS_API_URL}`, validatedPayload)

    const response = await fetch(FLIGHTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedPayload),
    })

    const responseBody = await readResponseBody(response)
    const responseError = extractApiErrorMessage(responseBody)

    if (!response.ok || hasApiErrorField(responseBody)) {
      console.error('Flight create API response:', {
        status: response.status,
        body: responseBody,
      })
      throw new Error(
        responseError || `Flight create failed with status ${response.status}`,
      )
    }

    console.log('Flight create API success response:', {
      status: response.status,
      body: responseBody,
    })

    return responseBody
  }

  async function handleExcelUpload(event) {
    const [file] = event.target.files || []

    if (!file) {
      return
    }

    try {
      const fileBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(fileBuffer, { type: 'array' })
      const sheets = workbook.SheetNames.map((sheetName) => ({
        name: sheetName,
        rows: XLSX.utils
          .sheet_to_json(workbook.Sheets[sheetName], {
            defval: '',
          })
          .filter(hasFlightRowContent)
          .map((row) =>
            buildCreateFlightPayload(normalizeExcelFlightRow(row)),
          ),
      }))

      const flightPayloads = sheets.flatMap((sheet) =>
        sheet.rows.map((row, index) => ({
          payload: row,
          sheetName: sheet.name,
          rowNumber: index + 1,
        })),
      )

      const results = []

      for (const flightRow of flightPayloads) {
        try {
          const responseBody = await createFlight(flightRow.payload)

          results.push({
            ok: true,
            rowNumber: flightRow.rowNumber,
            sheetName: flightRow.sheetName,
            responseBody,
          })
        } catch (error) {
          results.push({
            ok: false,
            rowNumber: flightRow.rowNumber,
            sheetName: flightRow.sheetName,
            error: error.message || 'Flight import failed.',
          })
        }
      }

      console.log(
        'Loaded flight Excel JSON:',
        JSON.stringify(
          {
            fileName: file.name,
            sheets,
          },
          null,
          2,
        ),
      )

      console.log('Flight Excel import summary:', {
        fileName: file.name,
        totalRows: flightPayloads.length,
        succeeded: results.filter((result) => result.ok).length,
        failed: results.filter((result) => !result.ok).length,
        results,
      })
    } finally {
      event.target.value = ''
    }
  }

  async function submitFlight(event) {
    event.preventDefault()

    const payload = buildCreateFlightPayload(draftFlight)

    await createFlight(payload)
    resetForm()
    closeForm()
  }

  async function submitFlightTimeUpdate(event) {
    event.preventDefault()

    const payload = normalizeFlightTimes(draftFlightTimeUpdate)

    await patchFlight(payload.flightId, payload)
    resetFlightTimeForm()
    closeForm()
  }

  async function submitCancelFlight(event) {
    event.preventDefault()

    const payload = {
      ...draftCancelFlight,
      status: 'cancelled',
    }

    await patchFlight(payload.id, payload)
    resetCancelFlightForm()
    closeForm()
  }

  return {
    closeForm,
    componentsByTerminalId,
    draftCancelFlight,
    draftFlight,
    draftFlightTimeUpdate,
    handleCancelFlightChange,
    handleExcelUpload,
    handleFieldChange,
    handleFlightTimeChange,
    isAddFormOpen: activeForm === 'add',
    isCancelFlightFormOpen: activeForm === 'cancel',
    isUpdateTimeFormOpen: activeForm === 'update-time',
    openAddForm,
    openCancelFlightForm,
    openUpdateTimeForm,
    resetCancelFlightForm,
    resetForm,
    resetFlightTimeForm,
    selectedTerminalComponents,
    selectedTerminalComponentsError,
    selectedTerminalComponentsLoading,
    submitCancelFlight,
    submitFlight,
    submitFlightTimeUpdate,
    terminals,
    terminalsError,
    terminalsLoading,
  }
}
