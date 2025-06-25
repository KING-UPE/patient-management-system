const Medication = require('../models/medicationModel');
const Patient = require('../models/patientModel');

exports.getAllMedications = async (req, res) => {
    try {
        const { search, date } = req.query;
        const query = {};
        
        if (search) {
            const patients = await Patient.find({
                $or: [
                    { FirstName: new RegExp(search, 'i') },
                    { LastName: new RegExp(search, 'i') },
                    { PID: new RegExp(search, 'i') }
                ]
            }).select('_id').lean();
            
            query.patient = { $in: patients.map(p => p._id) };
        }
        
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            
            query.date = {
                $gte: startDate,
                $lt: endDate
            };
        }
        
        const medications = await Medication.find(query)
            .populate('patient')
            .sort({ date: -1 })
            .lean();
            
        res.json(medications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMedicationById = async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id)
            .populate('patient')
            .lean();
            
        if (!medication) {
            return res.status(404).json({ error: 'Medication record not found' });
        }
        
        res.json(medication);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMedication = async (req, res) => {
    try {
        const { patient, date, medications, notes } = req.body;
        
        if (!patient || !date || !medications || medications.length === 0) {
            return res.status(400).json({ error: 'Patient, date, and medications are required' });
        }
        
        // Validate patient exists
        const patientExists = await Patient.findById(patient);
        if (!patientExists) {
            return res.status(400).json({ error: 'Patient not found' });
        }
        
        const medication = new Medication({
            patient,
            date,
            medications,
            notes
        });
        
        await medication.save();
        res.status(201).json(medication);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateMedication = async (req, res) => {
    try {
        const { patient, date, medications, notes } = req.body;
        
        if (!patient || !date || !medications || medications.length === 0) {
            return res.status(400).json({ error: 'Patient, date, and medications are required' });
        }
        
        // Validate patient exists
        const patientExists = await Patient.findById(patient);
        if (!patientExists) {
            return res.status(400).json({ error: 'Patient not found' });
        }
        
        const medication = await Medication.findByIdAndUpdate(
            req.params.id,
            {
                patient,
                date,
                medications,
                notes
            },
            { new: true, runValidators: true }
        ).populate('patient');
        
        if (!medication) {
            return res.status(404).json({ error: 'Medication record not found' });
        }
        
        res.json(medication);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteMedication = async (req, res) => {
    try {
        const medication = await Medication.findByIdAndDelete(req.params.id);
        
        if (!medication) {
            return res.status(404).json({ error: 'Medication record not found' });
        }
        
        res.json({ message: 'Medication record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

