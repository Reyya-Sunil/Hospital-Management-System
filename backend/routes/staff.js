const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all staff
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM staff');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

// GET staff by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM staff WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Staff not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

// POST to create a staff
router.post('/', async (req, res) => {
    const { name, role, department, contact } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO staff (name, role, department, contact) VALUES (?, ?, ?, ?)',
            [name, role, department, contact]
        );
        res.status(201).json({ id: result.insertId, name, role, department, contact });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create staff' });
    }
});

module.exports = router;
