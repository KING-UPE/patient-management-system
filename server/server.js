require('dotenv').config();
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

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI environment variable is not defined');
  process.exit(1);
}

// Middleware - CORS first
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Enhanced MongoDB connection with retries and timeouts
const connectWithRetry = async () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    socketTimeoutMS: 45000, // 45 seconds socket timeout
    retryWrites: true,
    w: 'majority'
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// MongoDB connection event handlers
mongoose.connection.on('connecting', () => console.log('Connecting to MongoDB...'));
mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectWithRetry();
});
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));

// Initialize database connection
connectWithRetry();

// API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/specializations', specializationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'UP',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
