const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');

// Helper function to find doctor by name
async function findDoctorByName(name) {
    return await Doctor.findOne({ name: new RegExp('^' + name + '$', 'i'), isActive: true });
}

exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findOne({ PID: req.params.pid })
            .populate({
                path: 'Doctor',
                select: '_id name specialization isActive',
                options: { lean: true }
            })
            .lean();

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Format doctor data for frontend
        if (patient.Doctor) {
            patient.Doctor = {
                _id: patient.Doctor._id.toString(),
                name: patient.Doctor.name,
                specialization: patient.Doctor.specialization,
                isActive: patient.Doctor.isActive
            };
        }

        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePatient = async (req, res) => {
    try {
        const { pid } = req.params;
        
        // Validate doctor exists if provided
        if (req.body.Doctor) {
            const doctor = await Doctor.findById(req.body.Doctor);
            if (!doctor) {
                return res.status(400).json({ error: 'Doctor not found' });
            }
        }

        // Validate status
        const validStatuses = ['Active', 'Inactive', 'Deceased'];
        if (req.body.Status && !validStatuses.includes(req.body.Status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const updateData = {
            ...req.body,
            LastVisitDate: new Date()
        };

        // Don't allow PID to be updated
        if (updateData.PID) {
            delete updateData.PID;
        }

        const updatedPatient = await Patient.findOneAndUpdate(
            { PID: pid },
            { $set: updateData },
            { 
                new: true, 
                runValidators: true 
            }
        ).populate({
            path: 'Doctor',
            select: '_id name specialization isActive',
            options: { lean: true }
        });

        if (!updatedPatient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(updatedPatient);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Patient ID already exists' });
        }
        res.status(400).json({ error: err.message });
    }
};


exports.getAllPatients = async (req, res) => {
    try {
        const { name, pid, city, doctor, guardian, limit } = req.query;
        const query = {};
        
        if (name) {
            query.$or = [
                { FirstName: new RegExp(name, 'i') },
                { LastName: new RegExp(name, 'i') }
            ];
        }
        if (pid) query.PID = new RegExp(pid, 'i');
        if (city) query.NearCity = new RegExp(city, 'i');
        if (doctor) query.Doctor = doctor;
        if (guardian) query.Guardian = new RegExp(guardian, 'i');
        
        let queryBuilder = Patient.find(query)
            .populate({
                path: 'Doctor',
                select: 'name specialization',
                options: { lean: true }
            })
            .sort({ createdAt: -1 });
        
        if (limit) {
            queryBuilder = queryBuilder.limit(parseInt(limit));
        }
        
        const patients = await queryBuilder.exec();
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add the new functions here
exports.createPatient = async (req, res) => {
    try {
        const { PID, FirstName, LastName, Email, NearCity, Doctor, Guardian, Status } = req.body;
        
        if (!PID || !FirstName || !LastName) {
            return res.status(400).json({ error: 'PID, FirstName, and LastName are required' });
        }
        
        const patient = new Patient({
            PID,
            FirstName,
            LastName,
            Email,
            NearCity,
            Doctor: Doctor || null,
            Guardian,
            Status: Status || 'Active',
            MedicalConditions: req.body.MedicalConditions || [],
            Medications: req.body.Medications || [],
            Allergies: req.body.Allergies || [],
            LastVisitDate: new Date()
        });
        
        await patient.save();
        res.status(201).json(patient);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findOneAndDelete({ PID: req.params.pid });
        
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        
        res.json({ message: 'Patient deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPatientStats = async (req, res) => {
    try {
        const totalPatients = await Patient.countDocuments();
        const activePatients = await Patient.countDocuments({ Status: 'Active' });
        const doctorsCount = await Doctor.countDocuments({ isActive: true });
        
        res.json({ totalPatients, activePatients, doctorsCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};