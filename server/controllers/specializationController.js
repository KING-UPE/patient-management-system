const Specialization = require('../models/specializationModel');

// Get all specializations
exports.getAllSpecializations = async (req, res) => {
    try {
        const specializations = await Specialization.find({ isActive: true })
            .sort({ name: 1 })
            .lean();
        res.json(specializations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create new specialization
exports.createSpecialization = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        
        const specialization = new Specialization({
            name,
            description,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        });
        
        await specialization.save();
        res.status(201).json(specialization);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get specialization by ID
exports.getSpecializationById = async (req, res) => {
    try {
        const specialization = await Specialization.findById(req.params.id).lean();
        if (!specialization) {
            return res.status(404).json({ error: 'Specialization not found' });
        }
        res.json(specialization);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update specialization
exports.updateSpecialization = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const updateData = {};
        
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const specialization = await Specialization.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!specialization) {
            return res.status(404).json({ error: 'Specialization not found' });
        }
        
        res.json(specialization);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete specialization
exports.deleteSpecialization = async (req, res) => {
    try {
        const specialization = await Specialization.findByIdAndDelete(req.params.id);
        
        if (!specialization) {
            return res.status(404).json({ error: 'Specialization not found' });
        }
        
        res.json({ message: 'Specialization deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};