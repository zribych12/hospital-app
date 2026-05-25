const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const patientRoutes = require('./routes/patient.routes');
const rendezVousRoutes = require('./routes/rendezVous.routes');
const consultationRoutes = require('./routes/consultation.routes');
const statsRoutes = require('./routes/stats.routes');
const publicRoutes = require('./routes/public.routes');
const errorHandler = require('./middlewares/error.handler');

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/rendez-vous', rendezVousRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/public', publicRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
