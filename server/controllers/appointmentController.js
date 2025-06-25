const Appointment = require('../models/appointmentModel');
const Doctor = require('../models/doctorModel'); // Assuming you have a Doctor model
const Patient = require('../models/patientModel'); // Assuming you have a Patient model

// Helper function to calculate end time
const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes + durationMinutes, 0, 0);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
    try {
        const { patient, doctor, date, startTime, reason } = req.body;

        // Basic validation
        if (!patient || !doctor || !date || !startTime) {
            return res.status(400).json({ error: 'Patient, Doctor, Date, and Start Time are required.' });
        }

        // Assume a default duration of 30 minutes for simplicity, or get from doctor settings
        const durationMinutes = 30;
        const endTime = calculateEndTime(startTime, durationMinutes);

        const newAppointment = new Appointment({
            patient,
            doctor,
            date,
            startTime,
            endTime,
            reason,
            status: 'Scheduled' // Default status
        });

        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return res.status(409).json({ error: 'An appointment already exists for this doctor at this date and time.' });
        }
        res.status(500).json({ error: 'Error creating appointment', details: error.message });
    }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const { doctorId, date } = req.query;
        let query = {};

        if (doctorId) {
            query.doctor = doctorId;
        }
        if (date) {
            // For date, we need to match the date part only, ignoring time
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'FirstName LastName PID') // Populate patient details
            .populate('doctor', 'name specialization') // Populate doctor details
            .sort({ date: 1, startTime: 1 }); // Sort by date and time

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching appointments', details: error.message });
    }
};

// Get available slots for a doctor on a specific date
exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({ error: 'Doctor ID and Date are required.' });
        }

        // Convert date to a proper Date object for comparison
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0); // Normalize to start of day

        // Find existing appointments for the given doctor and date
        const existingAppointments = await Appointment.find({
            doctor: doctorId,
            date: {
                $gte: queryDate,
                $lte: new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999)
            }
        }).select('startTime endTime');

        // Define working hours and slot duration
        const workingHoursStart = 9 * 60; // 9:00 AM in minutes from midnight
        const workingHoursEnd = 17 * 60;   // 5:00 PM in minutes from midnight
        const slotDuration = 30; // 30 minutes per slot

        let allPossibleSlots = [];
        for (let i = workingHoursStart; i < workingHoursEnd; i += slotDuration) {
            const hours = Math.floor(i / 60);
            const minutes = i % 60;
            allPossibleSlots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
        }

        // Filter out occupied slots
        const occupiedSlots = new Set();
        existingAppointments.forEach(appt => {
            const startMinutes = parseInt(appt.startTime.split(':')[0]) * 60 + parseInt(appt.startTime.split(':')[1]);
            const endMinutes = parseInt(appt.endTime.split(':')[0]) * 60 + parseInt(appt.endTime.split(':')[1]);

            for (let i = startMinutes; i < endMinutes; i += slotDuration) {
                const hours = Math.floor(i / 60);
                const minutes = i % 60;
                occupiedSlots.add(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
            }
        });

        const availableSlots = allPossibleSlots.filter(slot => !occupiedSlots.has(slot));

        res.status(200).json({ availableSlots });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: 'Error fetching available slots', details: error.message });
    }
};


// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            { status, notes },
            { new: true } // Return the updated document
        );

        if (!updatedAppointment) {
            return res.status(404).json({ error: 'Appointment not found.' });
        }

        res.status(200).json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ error: 'Error updating appointment status', details: error.message });
    }
};