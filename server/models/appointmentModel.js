const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Patient',
        required: true 
    },
    doctor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Doctor',
        required: true 
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,  // Format: "HH:MM" (e.g., "09:00")
        required: true
    },
    endTime: {
        type: String,  // Format: "HH:MM" (e.g., "09:30")
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'No-Show'],
        default: 'Scheduled'
    },
    reason: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
}, { 
    timestamps: true 
});

// Index for preventing double bookings
appointmentSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);  