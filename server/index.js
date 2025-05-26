const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

// Base de datos
const db = new sqlite3.Database('./tertuliapp.db')

// Crear tabla de eventos si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS availabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT,
      person_name TEXT,
      day TEXT,
      from_time TEXT,
      to_time TEXT
    )
  `)
})

// Ruta para crear evento
app.post('/api/events', (req, res) => {
  const { id, name } = req.body
  db.run('INSERT INTO events (id, name) VALUES (?, ?)', [id, name], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
})

// Ruta para agregar disponibilidad
app.post('/api/availability', (req, res) => {
  const { eventId, name, slots } = req.body
  const stmt = db.prepare('INSERT INTO availabilities (event_id, person_name, day, from_time, to_time) VALUES (?, ?, ?, ?, ?)')
  slots.forEach(({ day, from, to }) => {
    stmt.run(eventId, name, day, from, to)
  })
  stmt.finalize()
  res.json({ success: true })
})

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
})
