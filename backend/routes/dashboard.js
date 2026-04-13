const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const [patientsCount] = await pool.query('SELECT COUNT(*) as count FROM patients');
        const [staffCount] = await pool.query('SELECT COUNT(*) as count FROM staff');
        const [availableBeds] = await pool.query("SELECT COUNT(*) as count FROM beds WHERE status = 'available'");
        const [totalBeds] = await pool.query("SELECT COUNT(*) as count FROM beds");
        
        // Also get appointments for today for ClinicianDashboard
        const [appointments] = await pool.query(`
            SELECT * FROM appointments 
            WHERE DATE(appointment_date) = CURDATE() 
            ORDER BY appointment_date ASC
        `);

        res.json({
            totalAdmittedPatients: patientsCount[0].count,
            onDutyDoctors: staffCount[0].count,
            availableBeds: availableBeds[0].count,
            totalBeds: totalBeds[0].count,
            appointments: appointments
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

module.exports = router;
