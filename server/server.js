// server.js

// 1. CONDITIONAL DOTENV LOADING
// Load environment variables only if not in production
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const specializationRoutes = require('./routes/specializationRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Change this in production or use process.env.CLIENT_URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/specializations', specializationRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// 2. Database connection and Server Start
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
        console.log('✅ Connected to MongoDB successfully.');
        
        // Start the server ONLY after a successful DB connection
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} (Database is ready)`);
        });

    })
  .catch(err => {
        // This is the block that is causing the early exit.
        console.error('❌ MongoDB connection FAILED:');
        console.error(err.message);
        console.error('Exiting process...');
        process.exit(1);
    });
