// index.js
const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

// Base de datos
const db = new sqlite3.Database('./tertuliapp.db')

// Crear tablas si no existen
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tertulias (
      id TEXT PRIMARY KEY,
      name TEXT
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS availabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tertulia_id TEXT,
      person_name TEXT,
      day TEXT,
      from_time TEXT,
      to_time TEXT
    )
  `)
})

// Ruta para crear tertulia
app.post('/api/tertulias', (req, res) => {
  const { id, name } = req.body
  db.run('INSERT INTO tertulias (id, name) VALUES (?, ?)', [id, name], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
})

// Ruta para obtener el nombre de una tertulia
app.get('/api/tertulias/:id', (req, res) => {
  const { id } = req.params
  db.get('SELECT name FROM tertulias WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message })
    if (!row) return res.status(404).json({ error: 'Tertulia no encontrada' })
    res.json({ name: row.name })
  })
})

// Ruta para agregar disponibilidad
app.post('/api/availability', (req, res) => {
  const { tertuliaId, name, slots } = req.body
  const stmt = db.prepare('INSERT INTO availabilities (tertulia_id, person_name, day, from_time, to_time) VALUES (?, ?, ?, ?, ?)')
  slots.forEach(({ day, from, to }) => {
    stmt.run(tertuliaId, name, day, from, to)
  })
  stmt.finalize()
  res.json({ success: true })
})

// Obtener todas las disponibilidades de una tertulia
app.get('/api/availability/:tertuliaId', (req, res) => {
  const { tertuliaId } = req.params
  db.all(
    'SELECT person_name, day, from_time, to_time FROM availabilities WHERE tertulia_id = ? ORDER BY day, from_time',
    [tertuliaId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(rows)
    }
  )
})

// Calcular mejores horarios
app.get('/api/tertulias/:id/mejores-horarios', async (req, res) => {
  const { id } = req.params

  try {
    const rows = await new Promise((resolve, reject) => {
      db.all(
        'SELECT day, from_time, to_time FROM availabilities WHERE tertulia_id = ?',
        [id],
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        }
      )
    })

    if (rows.length === 0) return res.json({ sugerencias: [] })

    // Agrupar por día
    const dias = {}
    rows.forEach(({ day, from_time, to_time }) => {
      if (!dias[day]) dias[day] = []
      dias[day].push({ from: from_time, to: to_time })
    })

    // Dividir en bloques de 30 min
    const bloques = []
    for (const [dia, rangos] of Object.entries(dias)) {
      const timeline = {}

      rangos.forEach(({ from, to }) => {
        let start = parseTime(from)
        const end = parseTime(to)

        while (start < end) {
          const slotKey = `${dia} ${formatTime(start)}`
          timeline[slotKey] = (timeline[slotKey] || 0) + 1
          start += 30
        }
      })

      Object.entries(timeline).forEach(([slot, count]) => {
        bloques.push({ slot, count })
      })
    }

    const mejorPorPersonas = bloques.reduce((a, b) => (b.count > a.count ? b : a), bloques[0])

    const tiempoPorDia = {}
    bloques.forEach(({ slot, count }) => {
      const dia = slot.split(' ')[0]
      tiempoPorDia[dia] = (tiempoPorDia[dia] || 0) + count
    })

    const mejorDia = Object.entries(tiempoPorDia).reduce((a, b) => (b[1] > a[1] ? b : a), ['', 0])[0]

    res.json({
      sugerencias: [
        {
          tipo: 'mayor_cantidad_personas',
          bloque: mejorPorPersonas.slot,
          personas: mejorPorPersonas.count
        },
        {
          tipo: 'mayor_tiempo_total',
          dia: mejorDia,
          total_bloques: tiempoPorDia[mejorDia]
        }
      ]
    })

  } catch (err) {
    console.error('Error al calcular mejores horarios:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

// Funciones auxiliares
function parseTime(str) {
  const [h, m] = str.split(':').map(Number)
  return h * 60 + m
}

function formatTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

// Iniciar srvidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
})
