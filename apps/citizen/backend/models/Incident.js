const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    incidentId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['road_accident', 'medical_emergency', 'infrastructure_failure', 'public_safety', 'fire', 'flood', 'other']
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    severity: {
        type: String,
        default: 'medium'
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'responding', 'investigating', 'resolved']
    },
    verified: {
        type: Boolean,
        default: false
    },
    upvotes: {
        type: Number,
        default: 0
    },
    reportedBy: {
        type: String,
        required: true
    },
    reporterEmail: {
        type: String,
        required: true
    },
    media: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    departments: {
        type: [String],
        default: []
    },
    adminType: {
        type: String,
        default: 'General'
    }
}, {
    timestamps: true
});

// Index for geospatial queries
incidentSchema.index({ latitude: 1, longitude: 1 });
incidentSchema.index({ timestamp: -1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ type: 1 });

module.exports = mongoose.model('Incident', incidentSchema);
