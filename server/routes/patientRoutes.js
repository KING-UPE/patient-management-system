// routes/patientRoutes.js
const express = require('express');
const patientController = require('../controllers/patientController');
const router = express.Router();

// Patient routes
router.post('/', patientController.createPatient);
router.get('/', patientController.getAllPatients);
router.get('/stats', patientController.getPatientStats);
router.get('/:pid', patientController.getPatientById);
router.put('/:pid', patientController.updatePatient);
router.delete('/:pid', patientController.deletePatient);

module.exports = router;