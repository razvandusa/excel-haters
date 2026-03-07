import { useState } from 'react'
import * as XLSX from 'xlsx'

const DEFAULT_EXCEL_IMPORT_DATE = '2026-03-07'

const emptyFlightForm = {
  flightID: '',
  terminal: '',
  desk: '',
  security: '',
  gate: '',
  stand: '',
  departureTime: '',
  arrivalTime: '',
}

const emptyFlightTimeUpdateForm = {
  lightID: '',
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

export default function useFlightForm() {
  const [activeForm, setActiveForm] = useState('')
  const [draftFlight, setDraftFlight] = useState(emptyFlightForm)
  const [draftFlightTimeUpdate, setDraftFlightTimeUpdate] = useState(
    emptyFlightTimeUpdateForm,
  )
  const [draftCancelFlight, setDraftCancelFlight] = useState(
    emptyCancelFlightForm,
  )

  function handleFieldChange(field, value) {
    setDraftFlight((currentDraft) => ({
      ...currentDraft,
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
          .map((row) => normalizeFlightTimes(row)),
      }))

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
    } finally {
      event.target.value = ''
    }
  }

  function submitFlight(event) {
    event.preventDefault()

    console.log(
      'Added flight JSON:',
      JSON.stringify(normalizeFlightTimes(draftFlight), null, 2),
    )
    resetForm()
    closeForm()
  }

  function submitFlightTimeUpdate(event) {
    event.preventDefault()

    console.log(
      'Updated flight time JSON:',
      JSON.stringify(normalizeFlightTimes(draftFlightTimeUpdate), null, 2),
    )
    resetFlightTimeForm()
    closeForm()
  }

  function submitCancelFlight(event) {
    event.preventDefault()

    console.log(
      'Cancelled flight JSON:',
      JSON.stringify(
        {
          ...draftCancelFlight,
          status: 'cancelled',
        },
        null,
        2,
      ),
    )
    resetCancelFlightForm()
    closeForm()
  }

  return {
    closeForm,
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
    submitCancelFlight,
    submitFlight,
    submitFlightTimeUpdate,
  }
}
