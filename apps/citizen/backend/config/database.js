const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/incident-platform');

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Seed initial data if database is empty
        const Incident = require('../models/Incident');
        const count = await Incident.countDocuments();

        if (count === 0) {
            console.log('📦 Seeding initial incident data...');
            await seedInitialData();
        }
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

const seedInitialData = async () => {
    const Incident = require('../models/Incident');

    const initialIncidents = [
        {
            incidentId: 'INC-001',
            type: 'road_accident',
            description: 'Major collision on Highway 101, multiple vehicles involved',
            location: 'Highway 101, Exit 45',
            latitude: 37.7749,
            longitude: -122.4194,
            severity: 'critical',
            upvotes: 24,
            verified: true,
            reportedBy: 'User #4521',
            status: 'active',
            timestamp: new Date(Date.now() - 15 * 60000)
        },
        {
            incidentId: 'INC-002',
            type: 'medical_emergency',
            description: 'Person collapsed at Central Park, needs immediate medical attention',
            location: 'Central Park, North Entrance',
            latitude: 37.7849,
            longitude: -122.4094,
            severity: 'high',
            upvotes: 12,
            verified: true,
            reportedBy: 'User #8932',
            status: 'responding',
            timestamp: new Date(Date.now() - 45 * 60000)
        },
        {
            incidentId: 'INC-003',
            type: 'infrastructure_failure',
            description: 'Water main burst flooding the street',
            location: 'Main Street & 5th Avenue',
            latitude: 37.7649,
            longitude: -122.4294,
            severity: 'medium',
            upvotes: 8,
            verified: false,
            reportedBy: 'User #2341',
            status: 'active',
            timestamp: new Date(Date.now() - 120 * 60000)
        },
        {
            incidentId: 'INC-004',
            type: 'public_safety',
            description: 'Suspicious package found near shopping mall',
            location: 'Westfield Mall, Parking Lot B',
            latitude: 37.7549,
            longitude: -122.4394,
            severity: 'high',
            upvotes: 18,
            verified: true,
            reportedBy: 'User #5672',
            status: 'investigating',
            timestamp: new Date(Date.now() - 30 * 60000)
        },
        {
            incidentId: 'INC-005',
            type: 'fire',
            description: 'Small fire in residential building, smoke visible',
            location: '234 Oak Street, Apt 12',
            latitude: 37.7449,
            longitude: -122.4494,
            severity: 'critical',
            upvotes: 31,
            verified: true,
            reportedBy: 'User #9123',
            status: 'resolved',
            timestamp: new Date(Date.now() - 60 * 60000)
        },
        {
            incidentId: 'INC-006',
            type: 'road_accident',
            description: 'Minor fender bender, no injuries reported',
            location: 'Elm Street & Park Avenue',
            latitude: 37.7349,
            longitude: -122.4594,
            severity: 'low',
            upvotes: 3,
            verified: false,
            reportedBy: 'User #1234',
            status: 'resolved',
            timestamp: new Date(Date.now() - 180 * 60000)
        }
    ];

    try {
        await Incident.insertMany(initialIncidents);
        console.log('✅ Initial data seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
    }
};

module.exports = connectDB;
