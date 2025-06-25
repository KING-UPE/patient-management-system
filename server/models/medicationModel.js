const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Patient',
        required: true 
    },
    date: { 
        type: Date, 
        required: true,
        default: Date.now 
    },
    medications: { 
        type: [String], 
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'At least one medication is required'
        }
    },
    notes: String
}, { 
    timestamps: true 
});

// Automatic population of patient field
medicationSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'patient',
        select: 'PID FirstName LastName',
        options: { lean: true }
    });
    next();
});

module.exports = mongoose.model('Medication', medicationSchema);