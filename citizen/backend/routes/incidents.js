const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const multer = require('multer');
const path = require('path');
const axios = require('axios');


// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|mp4|mov/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed'));
        }
    }
});

// @route   GET /api/incidents
// @desc    Get all incidents with optional filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, severity, timeRange, verificationStatus } = req.query;

        let query = {};

        // Apply filters
        if (type && type !== 'all') {
            query.type = type;
        }

        if (severity && severity !== 'all') {
            query.severity = severity;
        }

        if (verificationStatus && verificationStatus !== 'all') {
            query.verified = verificationStatus === 'verified';
        }

        // Time range filter
        if (timeRange && timeRange !== 'all') {
            const now = Date.now();
            const ranges = {
                '15min': 15 * 60000,
                '1hour': 60 * 60000,
                '6hours': 6 * 60 * 60000,
                '24hours': 24 * 60 * 60000
            };

            if (ranges[timeRange]) {
                query.timestamp = { $gte: new Date(now - ranges[timeRange]) };
            }
        }

        const incidents = await Incident.find(query).sort({ timestamp: -1 });

        // Transform to match frontend format
        const transformedIncidents = incidents.map(incident => ({
            id: incident.incidentId,
            type: incident.type,
            description: incident.description,
            location: incident.location,
            latitude: incident.latitude,
            longitude: incident.longitude,
            timestamp: incident.timestamp.toISOString(),
            severity: incident.severity,
            upvotes: incident.upvotes,
            verified: incident.verified,
            reportedBy: incident.reportedBy,
            reporterEmail: incident.reporterEmail,
            status: incident.status,
            media: incident.media,
            departments: incident.departments,
            adminType: incident.adminType
        }));

        res.json(transformedIncidents);
    } catch (error) {
        console.error('Error fetching incidents:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/incidents/:id
// @desc    Get single incident by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const incident = await Incident.findOne({ incidentId: req.params.id });

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        res.json({
            id: incident.incidentId,
            type: incident.type,
            description: incident.description,
            location: incident.location,
            latitude: incident.latitude,
            longitude: incident.longitude,
            timestamp: incident.timestamp.toISOString(),
            severity: incident.severity,
            upvotes: incident.upvotes,
            verified: incident.verified,
            reportedBy: incident.reportedBy,
            reporterEmail: incident.reporterEmail,
            status: incident.status,
            media: incident.media,
            departments: incident.departments,
            adminType: incident.adminType
        });
    } catch (error) {
        console.error('Error fetching incident:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/incidents
// @desc    Create new incident
// @access  Public
router.post('/', upload.single('media'), async (req, res) => {
    try {
        const { type, description, location, latitude, longitude, reportedBy, reporterEmail } = req.body;

        // Validate required fields
        if (!type || !description || !location) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Generate incident ID
        const count = await Incident.countDocuments();
        const incidentId = `INC-${String(count + 1).padStart(3, '0')}`;

        // Call AI services for severity and department prediction
        let aiSeverity = 'medium';
        let departments = [];

        try {
            const [severityRes, deptRes] = await Promise.all([
                axios.post('http://localhost:8080/severity', { text: description }),
                axios.post('http://localhost:8080/department', { text: description })
            ]);

            if (severityRes.data && severityRes.data.severity) {
                aiSeverity = severityRes.data.severity.toLowerCase();
            }
            if (deptRes.data && deptRes.data.departments) {
                departments = deptRes.data.departments;
            }
        } catch (aiError) {
            console.error('AI Service Error:', aiError.message);
        }

        const newIncident = new Incident({
            incidentId,
            type,
            description,
            location,
            latitude: parseFloat(latitude) || 37.7749,
            longitude: parseFloat(longitude) || -122.4194,
            severity: aiSeverity,
            reportedBy: reportedBy || 'Anonymous',
            reporterEmail: reporterEmail || 'unknown@example.com',
            media: req.file ? `/uploads/${req.file.filename}` : null,
            departments: departments,
            adminType: departments.length > 0 ? departments[0] : 'General'
        });

        const savedIncident = await newIncident.save();

        res.status(201).json({
            message: 'Incident reported successfully',
            incident: {
                id: savedIncident.incidentId,
                type: savedIncident.type,
                description: savedIncident.description,
                location: savedIncident.location,
                latitude: savedIncident.latitude,
                longitude: savedIncident.longitude,
                timestamp: savedIncident.timestamp.toISOString(),
                severity: savedIncident.severity,
                upvotes: savedIncident.upvotes,
                verified: savedIncident.verified,
                reportedBy: savedIncident.reportedBy,
                reporterEmail: savedIncident.reporterEmail,
                status: savedIncident.status,
                media: savedIncident.media,
                departments: savedIncident.departments,
                adminType: savedIncident.adminType
            }
        });
    } catch (error) {
        console.error('Error creating incident:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/incidents/:id/upvote
// @desc    Upvote an incident
// @access  Public
router.put('/:id/upvote', async (req, res) => {
    try {
        const incident = await Incident.findOne({ incidentId: req.params.id });

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        incident.upvotes += 1;
        await incident.save();

        res.json({
            message: 'Upvote recorded',
            upvotes: incident.upvotes
        });
    } catch (error) {
        console.error('Error upvoting incident:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/incidents/:id/status
// @desc    Update incident status
// @access  Public (should be protected in production)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['active', 'responding', 'investigating', 'resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const incident = await Incident.findOne({ incidentId: req.params.id });

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        incident.status = status;
        await incident.save();

        res.json({
            message: 'Status updated',
            status: incident.status
        });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   DELETE /api/incidents/:id
// @desc    Delete an incident
// @access  Public (should be protected in production)
router.delete('/:id', async (req, res) => {
    try {
        const incident = await Incident.findOneAndDelete({ incidentId: req.params.id });

        if (!incident) {
            return res.status(404).json({ message: 'Incident not found' });
        }

        res.json({ message: 'Incident deleted successfully' });
    } catch (error) {
        console.error('Error deleting incident:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/incidents/analyze
// @desc    Analyze incident description using AI service
// @access  Public
router.post('/analyze', async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        const [severityRes, deptRes] = await Promise.all([
            axios.post('http://localhost:8080/severity', { text: description }),
            axios.post('http://localhost:8080/department', { text: description })
        ]);

        res.json({
            severity: severityRes.data.severity ? severityRes.data.severity.toLowerCase() : 'medium',
            departments: deptRes.data.departments || [],
            adminType: (deptRes.data.departments && deptRes.data.departments.length > 0) ? deptRes.data.departments[0] : 'General'
        });
    } catch (error) {
        console.error('AI Analysis Error:', error.message);
        res.status(500).json({ message: 'AI Analysis failed', error: error.message });
    }
});

module.exports = router;

