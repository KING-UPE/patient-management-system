const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
<<<<<<< HEAD
    PID: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        default: 'TEMP_PID' // Temporary value that will be replaced
    },
    FirstName: { 
        type: String, 
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [100, 'First name cannot exceed 100 characters']
    },
    LastName: { 
        type: String, 
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [100, 'Last name cannot exceed 100 characters']
    },
    Email: { 
        type: String, 
        trim: true, 
        lowercase: true,
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty email
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} is not a valid email address`
        }
    },
=======
    PID: { type: String, required: true, unique: true, trim: true },
    FirstName: { type: String, required: true, trim: true },
    LastName: { type: String, required: true, trim: true },
    Email: { type: String, trim: true, lowercase: true },
>>>>>>> 56dd1b47799f168e49bc158293719968591f80dc
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
<<<<<<< HEAD
    LastVisitDate: { type: Date, default: Date.now }
}, { 
    timestamps: true
});


// Pre-save hook to generate actual PID
patientSchema.pre('save', async function(next) {
    // Only generate PID for new documents
    if (!this.isNew) {
        return next();
    }

    // Skip if PID is already set (not the temp value)
    if (this.PID && this.PID !== 'TEMP_PID') {
        return next();
    }

    try {
        // Get the highest existing PID number
        const lastPatient = await this.constructor.findOne({}, 'PID')
            .sort({ PID: -1 })
            .lean();
        
        let nextNumber = 1;
        if (lastPatient && lastPatient.PID) {
            const lastNumber = parseInt(lastPatient.PID.replace('PAT', ''), 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }
        
        this.PID = `PAT${String(nextNumber).padStart(6, '0')}`;
        next();
    } catch (err) {
        console.error('Error generating PID:', err);
        // Fallback using timestamp
        this.PID = `PAT${Date.now().toString().slice(-6)}`;
        next();
    }
=======
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
>>>>>>> 56dd1b47799f168e49bc158293719968591f80dc
});

module.exports = mongoose.model('Patient', patientSchema);