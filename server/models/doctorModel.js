const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    specialization: { 
        type: String, 
        required: true,
        trim: true
    },
    contact: { 
        type: String, 
        required: true,
        trim: true
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for doctor's full name
doctorSchema.virtual('fullName').get(function() {
    return this.name;
});

module.exports = mongoose.model('Doctor', doctorSchema);