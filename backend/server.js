const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const path = require('path');

// Import routes
const patientsRouter = require('./routes/patients');
const staffRouter = require('./routes/staff');
const dashboardRouter = require('./routes/dashboard');
const reportsRouter = require('./routes/reports');
const authRouter = require('./routes/auth');
const appointmentsRouter = require('./routes/appointments');
const bedsRouter = require('./routes/beds');

app.use(cors());
app.use(express.json());

// Serve the frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/patients', patientsRouter);
app.use('/api/staff', staffRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/pdf', reportsRouter);
app.use('/api/auth', authRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/beds', bedsRouter);

// Frontend Route Mappings
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/clinician', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/ClinicianDahboard.html'));
});

app.get('/staff-portal', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/staffPortalDashboard.html'));
});

app.get('/patients', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/PatientDirectory.html'));
});

app.get('/doctors', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/DoctorDirectory.html'));
});

app.get('/appointments', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/BookAppointment.html'));
});

app.get('/patient-profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/patientProfile.html'));
});

// Fallback for unmapped patient-portal (if file missing, route back to login)
app.get('/patient-portal', (req, res) => {
    // Assuming no specific portal exists yet, maybe points to patientProfile for now
    res.sendFile(path.join(__dirname, '../frontend/patientProfile.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    // Auto-open browser on Windows natively right after it connects!
    const exec = require('child_process').exec;
    exec(`start http://localhost:${port}`);
});
