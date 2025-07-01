const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Appointment routes
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAllAppointments);
router.get('/available', appointmentController.getAvailableSlots);
router.put('/:id/status', appointmentController.updateAppointmentStatus);
router.delete('/:id', appointmentController.deleteAppointment); // Add this line

module.exports = router;