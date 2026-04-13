const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all patients
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM patients');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// GET patient by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM patients WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patient' });
    }
});

// POST to create a patient
router.post('/', async (req, res) => {
    const { name, age, gender, diagnosis, contact } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO patients (name, age, gender, diagnosis, contact) VALUES (?, ?, ?, ?, ?)',
            [name, age, gender, diagnosis, contact]
        );
        res.status(201).json({ id: result.insertId, name, age, gender, diagnosis, contact });
    } catch (error) {
        console.error('SERVER ERROR AT INSERT PATIENT:', error);
        res.status(500).json({ error: 'Failed to create patient', details: error.message });
    }
});

module.exports = router;
