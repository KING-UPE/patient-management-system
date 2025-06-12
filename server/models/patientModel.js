const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    PID: { type: String, required: true, unique: true, trim: true },
    FirstName: { type: String, required: true, trim: true },
    LastName: { type: String, required: true, trim: true },
    Email: { type: String, trim: true, lowercase: true },
    NearCity: { type: String, trim: true },
    Doctor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Doctor',
        default: null 
    },
    Guardian: { type: String, trim: true },
    MedicalConditions: { type: [String], default: [] },
    Medications: { type: [String], default: [] },
    Allergies: { type: [String], default: [] },
    Status: { 
        type: String, 
        enum: ['Active', 'Inactive', 'Deceased'], 
        default: 'Active' 
    },
    LastVisitDate: { type: Date }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Automatic population of Doctor field
patientSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'Doctor',
        select: '_id name specialization isActive',
        options: { lean: true }
    });
    next();
});

module.exports = mongoose.model('Patient', patientSchema);