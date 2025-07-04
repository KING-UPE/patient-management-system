const express = require('express');
const router = express.Router();
const specializationController = require('../controllers/specializationController');

// Specialization routes
router.get('/', specializationController.getAllSpecializations);
router.post('/', specializationController.createSpecialization);
router.get('/:id', specializationController.getSpecializationById);
router.put('/:id', specializationController.updateSpecialization);
router.delete('/:id', specializationController.deleteSpecialization);

module.exports = router;