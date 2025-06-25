// controllers/doctorController.js
const Doctor = require('../models/doctorModel');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const { isActive, name } = req.query;
        const query = {};
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        if (name) {
            query.name = new RegExp(name, 'i');
        }
        
        const doctors = await Doctor.find(query)
            .sort({ name: 1 })
            .lean();
            
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).lean();
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create new doctor
exports.createDoctor = async (req, res) => {
    try {
        const { name, specialization, contact } = req.body;
        
        if (!name || !specialization || !contact) {
            return res.status(400).json({ error: 'Name, specialization, and contact are required' });
        }
        
        const doctor = new Doctor({
            name,
            specialization,
            contact,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        });
        
        await doctor.save();
        res.status(201).json(doctor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update doctor
exports.updateDoctor = async (req, res) => {
    try {
        const { name, specialization, contact, isActive } = req.body;
        const updateData = {};
        
        if (name) updateData.name = name;
        if (specialization) updateData.specialization = specialization;
        if (contact) updateData.contact = contact;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        
        res.json(doctor);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        
        res.json({ message: 'Doctor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};