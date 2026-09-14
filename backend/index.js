const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'encubadora_secreta_123';

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Acceso denegado' });
  next();
};

// --- AUTH ROUTES ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
    
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });
    
    const token = jwt.sign({ id: user.id, role: user.role, nombre: user.nombre }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, nombre: user.nombre, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// --- USERS CRUD (ADMIN ONLY) ---
app.get('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, nombre, email, role, created_at FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.post('/api/users', authMiddleware, adminMiddleware, async (req, res) => {
  const { nombre, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (nombre, email, password, role) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, role || 'CLIENTE']
    );
    res.json({ id: result.insertId, message: 'Usuario creado' });
  } catch (error) {
    res.status(500).json({ error: 'Error creando usuario (puede que el email ya exista)' });
  }
});

app.delete('/api/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
});

// --- SETTINGS ROUTES (Admin can update, any authenticated can read) ---
app.get('/api/settings', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM settings WHERE id = 1');
    res.json(rows[0] || { temp_min: 37.5, temp_max: 37.9, hum_min: 50.0, hum_max: 70.0 });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.post('/api/settings', authMiddleware, adminMiddleware, async (req, res) => {
  const { temp_min, temp_max, hum_min, hum_max } = req.body;
  try {
    await db.execute(
      'UPDATE settings SET temp_min = ?, temp_max = ?, hum_min = ?, hum_max = ? WHERE id = 1',
      [temp_min, temp_max, hum_min, hum_max]
    );
    res.json({ message: 'Configuración actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando configuración' });
  }
});

app.post('/api/settings/start', authMiddleware, adminMiddleware, async (req, res) => {
  const { bird_type } = req.body;
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.execute(
      'UPDATE settings SET start_date = ?, bird_type = ? WHERE id = 1',
      [now, bird_type || 'gallina']
    );
    res.json({ message: 'Ciclo iniciado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar ciclo' });
  }
});

app.post('/api/settings/stop', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db.execute(
      'UPDATE settings SET start_date = NULL WHERE id = 1'
    );
    res.json({ message: 'Ciclo detenido' });
  } catch (error) {
    res.status(500).json({ error: 'Error al detener ciclo' });
  }
});

// --- READINGS ROUTES ---
app.get('/api/readings', authMiddleware, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM readings ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [countResult] = await db.execute('SELECT COUNT(*) as total FROM readings');
    
    res.json({
      data: rows,
      total: countResult[0].total,
      page,
      totalPages: Math.ceil(countResult[0].total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/api/readings/latest', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM readings ORDER BY timestamp DESC LIMIT 1');
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// --- WORKER (Fetch from ThingSpeak) ---
const THINGSPEAK_CHANNEL_ID = '3442278';
const THINGSPEAK_API_KEY = 'J92EB8NUEOJF1IAN';

const fetchThingSpeakData = async () => {
  try {
    const url = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=1`;
    const response = await axios.get(url);
    const feeds = response.data.feeds;
    
    if (feeds && feeds.length > 0) {
      const latest = feeds[0];
      if (latest.field1 && latest.field2) {
        // Formatear fecha para MySQL
        const dateObj = new Date(latest.created_at);
        const mysqlDate = dateObj.toISOString().slice(0, 19).replace('T', ' ');
        
        await db.execute(
          'INSERT IGNORE INTO readings (temperatura, humedad, timestamp) VALUES (?, ?, ?)',
          [parseFloat(latest.field1), parseFloat(latest.field2), mysqlDate]
        );
        console.log(`[Worker] Dato insertado/ignorado: Temp=${latest.field1}, Hum=${latest.field2} at ${mysqlDate}`);
      }
    }
  } catch (error) {
    console.error('[Worker] Error fetching from ThingSpeak:', error.message);
  }
};

// Correr el worker cada minuto (60000 ms)
setInterval(fetchThingSpeakData, 60000);
// Correr inmediatamente al iniciar
fetchThingSpeakData();

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
