// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'videos');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors({ origin: true, credentials: false }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ---------- Auth helpers ----------
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Nicht autorisiert' });
  }
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token ungültig oder abgelaufen' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }
  next();
};

// ---------- Multer config for video uploads ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Nur Videodateien sind erlaubt'));
    }
    cb(null, true);
  }
});

// ---------- Auth routes ----------
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email und Passwort sind erforderlich' });

  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashed, role: 'PATIENT' } // Default: Patient
    });
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(400).json({ error: 'Email existiert bereits' });
    }
    res.status(400).json({ error: 'Registrierung fehlgeschlagen' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email und Passwort sind erforderlich' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, role: user.role });
});

// ---------- Exercise routes ----------
app.get('/api/exercises', authMiddleware, async (req, res) => {
  const exercises = await prisma.exercise.findMany({ orderBy: { id: 'desc' } });
  res.json(exercises);
});

app.post('/api/exercises', authMiddleware, requireRole('ADMIN', 'THERAPIST'), upload.single('video'), async (req, res) => {
  const { name, description, youtubeUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'Name ist erforderlich' });

  try {
    const videoPath = req.file ? `/uploads/videos/${req.file.filename}` : null;
    const exercise = await prisma.exercise.create({
      data: { name, description, youtubeUrl, videoPath }
    });
    res.json(exercise);
  } catch (err) {
    res.status(400).json({ error: 'Übung konnte nicht gespeichert werden' });
  }
});

// ---------- Workout routes ----------
app.post('/api/workouts', authMiddleware, async (req, res) => {
  const { split, warmup = [], main = [], sets = [] } = req.body;

  if (!split || !['WEEK1', 'WEEK2'].includes(split)) {
    return res.status(400).json({ error: 'Ungültiger Split' });
  }

  const isValidIdArray = (arr) => Array.isArray(arr) && arr.every((id) => Number.isInteger(id));
  if (!isValidIdArray(warmup) || !isValidIdArray(main)) {
    return res.status(400).json({ error: 'Ungültige Übungs-IDs' });
  }

  if (!Array.isArray(sets)) {
    return res.status(400).json({ error: 'Sets müssen ein Array sein' });
  }

  try {
    const workout = await prisma.workout.create({
      data: {
        split,
        warmupExercises: {
          create: warmup.map((exerciseId, idx) => ({ exerciseId, order: idx }))
        },
        mainExercises: {
          create: main.map((exerciseId, idx) => ({ exerciseId, order: idx }))
        },
        sets: {
          create: sets.map((s) => ({
            exerciseId: s.exerciseId,
            reps: s.reps ?? 0,
            weight: s.weight ?? null,
            band: s.band ?? null
          }))
        }
      },
      include: { warmupExercises: true, mainExercises: true, sets: true }
    });
    res.json(workout);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Workout konnte nicht gespeichert werden' });
  }
});

app.get('/api/workouts', authMiddleware, async (req, res) => {
  const workouts = await prisma.workout.findMany({
    orderBy: { date: 'desc' },
    include: {
      warmupExercises: { include: { exercise: true } },
      mainExercises: { include: { exercise: true } },
      sets: true
    }
  });
  res.json(workouts);
});

// Placeholder for other CRUD routes (patients, workouts, etc.)

// Global error handler for upload/validation errors
app.use((err, req, res, next) => {
  if (err) {
    const message = err.message || 'Serverfehler';
    const status = err.status || (err.name === 'MulterError' ? 400 : 500);
    console.error('Error handler:', message);
    return res.status(status).json({ error: message });
  }
  next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
