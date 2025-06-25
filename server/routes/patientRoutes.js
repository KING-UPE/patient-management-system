const express = require('express');
const patientController = require('../controllers/patientController');
const router = express.Router();

// Add middleware to verify content-type
router.use((req, res, next) => {
    if (req.method === 'POST' && !req.is('application/json')) {
        return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
    next();
});

router.post('/', patientController.createPatient);
router.get('/', patientController.getAllPatients);
router.get('/stats', patientController.getPatientStats);
router.get('/:pid', patientController.getPatientById);
router.put('/:pid', patientController.updatePatient);
router.delete('/:pid', patientController.deletePatient);

module.exports = router;