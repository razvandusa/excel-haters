import { useState } from 'react'

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

  function submitFlight(event) {
    event.preventDefault()

    console.log('Added flight JSON:', JSON.stringify(draftFlight, null, 2))
    resetForm()
    closeForm()
  }

  function submitFlightTimeUpdate(event) {
    event.preventDefault()

    console.log(
      'Updated flight time JSON:',
      JSON.stringify(draftFlightTimeUpdate, null, 2),
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
