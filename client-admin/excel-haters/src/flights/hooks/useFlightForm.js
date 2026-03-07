import { useState } from 'react'
import * as XLSX from 'xlsx'

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

function formatDateTimeValue(value) {
  if (!value) {
    return value
  }

  const normalizedValue = String(value).trim()

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalizedValue)) {
    return `${normalizedValue.replace('T', ' ')}:00`
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalizedValue)) {
    return normalizedValue.replace('T', ' ')
  }

  return normalizedValue
}

function normalizeFlightTimes(payload) {
  return {
    ...payload,
    departureTime: formatDateTimeValue(payload.departureTime),
    arrivalTime: formatDateTimeValue(payload.arrivalTime),
    newTime: formatDateTimeValue(payload.newTime),
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
