<<<<<<< HEAD
=======


// server.js
>>>>>>> 56dd1b47799f168e49bc158293719968591f80dc
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
<<<<<<< HEAD
const specializationRoutes = require('./routes/specializationRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middleware - CORS first
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
=======

const app = express();

// Middleware
app.use(cors());
>>>>>>> 56dd1b47799f168e49bc158293719968591f80dc
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
<<<<<<< HEAD
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/specializations', specializationRoutes);
=======
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
>>>>>>> 56dd1b47799f168e49bc158293719968591f80dc

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});