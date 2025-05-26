import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'

function generatetertuliaID() {
  return Math.random().toString(36).substring(2, 8)
}

function HomePage() {
  const [tertuliaName, setTertuliaName] = useState('')
  const navigate = useNavigate()

  const handleCreateTertulia = async () => {
    if (tertuliaName.trim() === '') {
      alert('Por favor, poné un nombre para la tertulia.')
      return
    }

    const id = generatetertuliaID()

    try {
      const res = await fetch('http://localhost:3001/api/tertulias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: tertuliaName }),
      })

      if (!res.ok) throw new Error('Error al crear la tertulia.')

      navigate(`/tertulia/${id}`, { state: { name: tertuliaName } })
    } catch (err) {
      console.error(err)
      alert('Hubo un error creando la tertulia.')
    }
  }

  return (
    <div className='card'>
      <img className='logo' src='/public/Tertuliapp logo white.svg' />
      <h1>TertuliApp</h1>
      <label>
        Nombre de la tertulia:{' '}
        <input
          type="text"
          value={tertuliaName}
          onChange={(e) => setTertuliaName(e.target.value)}
        />
      </label>
      <br />
      <button onClick={handleCreateTertulia}>Crear tertulia</button>
    </div>
  )
}

function TertuliaPage({ tertuliaID, tertuliaName: initialName }) {
  const [tertuliaName, setTertuliaName] = useState(initialName)
  const [name, setName] = useState('')
  const [day, setDay] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [slots, setSlots] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [allAvailabilities, setAllAvailabilities] = useState([])
  const [sugerencias, setSugerencias] = useState([])

  useEffect(() => {
    const fetchTertuliaName = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/tertulias/${tertuliaID}`)
        const data = await res.json()
        setTertuliaName(data.name)
      } catch (err) {
        console.error('Error al obtener nombre de la tertulia:', err)
      }
    }

    if (!tertuliaName) {
      fetchTertuliaName()
    }
  }, [tertuliaID, tertuliaName])

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/availability/${tertuliaID}`)
        const data = await res.json()
        setAllAvailabilities(data)
      } catch (err) {
        console.error('Error al obtener disponibilidades:', err)
      }
    }

    fetchAvailabilities()
  }, [tertuliaID])

  useEffect(() => {
    const fetchSugerencias = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/tertulias/${tertuliaID}/mejores-horarios`)
        const data = await res.json()
        setSugerencias(data.sugerencias || [])
      } catch (err) {
        console.error('Error al obtener sugerencias:', err)
      }
    }

    fetchSugerencias()
  }, [tertuliaID, allAvailabilities])

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

  const handleSubmit = async () => {
    if (!name || slots.length === 0) {
      alert('Poné tu nombre y al menos un rango de horario.')
      return
    }

    if (!tertuliaID) {
      alert('No se pudo obtener el ID de la tertulia.')
      return
    }

    const payload = {
      tertuliaId: tertuliaID,
      name,
      slots,
    }

    try {
      const res = await fetch('http://localhost:3001/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Error al guardar disponibilidad.')

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert('Hubo un error al enviar tu disponibilidad.')
    }
  }

  if (submitted) {
    return (
      <div>
        <h2>{tertuliaName ? `Tertulia: ${tertuliaName}` : `Tertulia #${tertuliaID}`}</h2>
        <p>¡Gracias, {name}! Tu disponibilidad fue registrada.</p>
        <pre>{JSON.stringify(slots, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div>
      <h2>{tertuliaName ? `Tertulia: ${tertuliaName}` : `Tertulia #${tertuliaID}`}</h2>

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

      <h3 className="text-lg font-bold mt-8">Disponibilidad de todos:</h3>
      {allAvailabilities.length === 0 ? (
        <p>Aún nadie completó el formulario.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {allAvailabilities.map((entry, i) => (
            <li key={i} className="text-sm">
              <strong>{entry.person_name}</strong>: {entry.day} de {entry.from_time} a {entry.to_time}
            </li>
          ))}
        </ul>
      )}

      <h3 className="text-lg font-bold mt-8">🕒 Sugerencias de horario:</h3>
      {!sugerencias.length ? (
        <p>Aún no hay suficientes datos para sugerir un horario.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {sugerencias.map((s, i) => (
            <li key={i} className="text-sm">
              {s.tipo === 'mayor_cantidad_personas' ? (
                <>🔹 <strong>Bloque con más personas:</strong> {s.bloque} ({s.personas} personas)</>
              ) : (
                <>🔹 <strong>Día con mayor disponibilidad total:</strong> {s.dia} ({s.total_bloques} bloques disponibles)</>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TertuliaWrapper() {
  const { id } = useParams()
  const location = useLocation()
  const tertuliaName = location.state?.name || null
  return <TertuliaPage tertuliaID={id} tertuliaName={tertuliaName} />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tertulia/:id" element={<TertuliaWrapper />} />
    </Routes>
  )
}

export default App
