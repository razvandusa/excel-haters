import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'

const DEFAULT_EXCEL_IMPORT_DATE = '2026-03-07'
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

function formatDateTimeValue(value) {
  if (value === undefined || value === null || value === '') {
    return value
  }

  if (typeof value === 'number') {
    const parsedDateCode = XLSX.SSF.parse_date_code(value)

    if (parsedDateCode) {
      return [
        `${parsedDateCode.y}-${padTimePart(parsedDateCode.m)}-${padTimePart(parsedDateCode.d)}`,
        `${padTimePart(parsedDateCode.H)}:${padTimePart(parsedDateCode.M)}:${padTimePart(Math.floor(parsedDateCode.S || 0))}`,
      ].join('T')
    }
  }

  const normalizedValue = String(value).trim()

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

    return `${DEFAULT_EXCEL_IMPORT_DATE}T${padTimePart(hour)}:${padTimePart(rawMinute)}:${padTimePart(rawSecond)}`
  }

  const twentyFourHourMatch = normalizedValue.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/,
  )

  if (twentyFourHourMatch) {
    const [, rawHour, rawMinute, rawSecond = '00'] = twentyFourHourMatch

    return `${DEFAULT_EXCEL_IMPORT_DATE}T${padTimePart(rawHour)}:${padTimePart(rawMinute)}:${padTimePart(rawSecond)}`
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

    return `${year}-${padTimePart(rawMonth)}-${padTimePart(rawDay)}T${padTimePart(hour)}:${padTimePart(rawMinute)}:${padTimePart(rawSecond)}`
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

function normalizeExcelFlightRow(row) {
  return {
    flightId: row.flightId ?? row.flightID ?? row.flightid ?? '',
    terminal:
      row.terminal ??
      row.terminalName ??
      row.terminalname ??
      '',
    desk: row.desk ?? row.deskName ?? row.deskname ?? '',
    security:
      row.security ??
      row.securityName ??
      row.securityname ??
      '',
    gate:
      row.gate ??
      row.gatenName ??
      row.gateName ??
      row.gatename ??
      '',
    stand: row.stand ?? row.standName ?? row.standname ?? '',
    departureTime:
      row.departureTime ??
      row.departuretime ??
      '',
    arrivalTime:
      row.arrivalTime ??
      row.arrivaltime ??
      '',
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

function ensureCreateFlightPayload(payload) {
  const normalizedDepartureTime = String(payload.departureTime ?? '').trim()
  const normalizedArrivalTime = String(payload.arrivalTime ?? '').trim()

  if (!normalizedDepartureTime && !normalizedArrivalTime) {
    throw new Error('Departure Time or Arrival Time is required.')
  }

  return {
    ...payload,
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

    if (!response.ok) {
      const responseBody = await readResponseBody(response)

      console.error('Flight patch API response:', {
        status: response.status,
        body: responseBody,
      })
      throw new Error(`Flight patch failed with status ${response.status}`)
    }

    return response
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

    if (!response.ok) {
      const responseBody = await readResponseBody(response)

      console.error('Flight create API response:', {
        status: response.status,
        body: responseBody,
      })
      throw new Error(`Flight create failed with status ${response.status}`)
    }

    const responseBody = await readResponseBody(response)

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
            formatCreateFlightPayload(
              normalizeFlightTimes(normalizeExcelFlightRow(row)),
            ),
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

    const payload = formatCreateFlightPayload(normalizeFlightTimes(draftFlight))

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
