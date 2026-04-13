const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all appointments
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM appointments ORDER BY appointment_date ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// POST to create a new appointment (surgery scheduling, etc.)
router.post('/', async (req, res) => {
    const { patient_name, doctor_name, appointment_date, type } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO appointments (patient_name, doctor_name, appointment_date, status, type) VALUES (?, ?, ?, ?, ?)',
            [patient_name, doctor_name, appointment_date || new Date(), 'Scheduled', type]
        );
        res.status(201).json({ 
            id: result.insertId, 
            patient_name, 
            doctor_name, 
            appointment_date, 
            status: 'Scheduled', 
            type 
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});

// PUT to update status
router.put('/:id', async (req, res) => {
    const { status } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE appointments SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json({ message: 'Appointment updated successfully' });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});

module.exports = router;
