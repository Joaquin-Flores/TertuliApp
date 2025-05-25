import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'

function generateEventId() {
  return Math.random().toString(36).substring(2, 8)
}

function HomePage() {
  const [eventName, setEventName] = useState('')
  const navigate = useNavigate()

  const handleCreateEvent = () => {
    if (eventName.trim() === '') {
      alert('Por favor, poné un nombre para el evento.')
      return
    }
    const id = generateEventId()

    // Acá podrías guardar el nombre del evento en la DB (cuando tengas backend)
    // Por ahora lo pasamos como state opcional
    navigate(`/tertulia/${id}`, { state: { name: eventName } })
  }

  return (
    <div>
      <img src='/public/Tertuliapp logo.png'></img>
      <h1>TertuliApp</h1>
      <label>
        Nombre del evento:{' '}
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
      </label>
      <br />
      <button onClick={handleCreateEvent}>Crear evento</button>
    </div>
  )
}

function EventPage({ eventId, eventName }) {
  const [name, setName] = useState('')
  const [day, setDay] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [slots, setSlots] = useState([]) // rangos agregados
  const [submitted, setSubmitted] = useState(false)

  const handleAddSlot = () => {
    if (!day || !from || !to) {
      alert('Completa todos los campos del rango de horario.')
      return
    }

    setSlots([...slots, { day, from, to }])
    setDay('')
    setFrom('')
    setTo('')
  }

  const handleSubmit = () => {
    if (!name || slots.length === 0) {
      alert('Poné tu nombre y al menos un rango de horario.')
      return
    }

    const availability = {
      name,
      slots,
    }

    console.log('Disponibilidad enviada:', availability)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div>
        <h2>{eventName ? `Tertulia: ${eventName}` : `Tertulia #${eventId}`}</h2>
        <p>¡Gracias, {name}! Tu disponibilidad fue registrada.</p>
        <pre>{JSON.stringify(slots, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div>
      <h2>{eventName ? `Tertulia: ${eventName}` : `Tertulia #${eventId}`}</h2>

      <label>
        Tu nombre:{' '}
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <h3>Agregar disponibilidad</h3>
      <label>
        Día:{' '}
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
      </label>
      <br />
      <label>
        Desde:{' '}
        <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
      </label>
      <label>
        Hasta:{' '}
        <input type="time" value={to} onChange={(e) => setTo(e.target.value)} />
      </label>
      <br />
      <button onClick={handleAddSlot}>Agregar rango</button>

      <h4>Rangos agregados:</h4>
      <ul>
        {slots.map((slot, index) => (
          <li key={index}>
            {slot.day}: {slot.from} - {slot.to}
          </li>
        ))}
      </ul>

      <button onClick={handleSubmit}>Enviar disponibilidad</button>
    </div>
  )
}

function EventWrapper() {
  const { id } = useParams()
  const state = history.state?.usr || {}
  const eventName = state?.name
  return <EventPage eventId={id} eventName={eventName} />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tertulia/:id" element={<EventWrapper />} />
    </Routes>
  )
}

export default App
