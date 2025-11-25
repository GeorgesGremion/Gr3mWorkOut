// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ---------- Multer config for video uploads ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'videos'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 * 1024 } }); // 5 GB limit

// ---------- Auth routes ----------
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, password: hashed, role }
    });
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, role: user.role });
});

// ---------- Exercise upload route (admin/therapist) ----------
app.post('/api/exercises', upload.single('video'), async (req, res) => {
  const { name, description, youtubeUrl } = req.body;
  const videoPath = req.file ? `/uploads/videos/${req.file.filename}` : null;
  const exercise = await prisma.exercise.create({
    data: { name, description, youtubeUrl, videoPath }
  });
  res.json(exercise);
});

// Placeholder for other CRUD routes (patients, workouts, etc.)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
