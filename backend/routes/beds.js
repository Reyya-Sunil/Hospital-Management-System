const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all beds status
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM beds');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching beds:', error);
        res.status(500).json({ error: 'Failed to fetch beds' });
    }
});

// POST to admit a patient
router.post('/admit', async (req, res) => {
    // This expects a patient_id, but our simple schema might just assign a bed.
    // Let's just find an available bed and assign it.
    const { ward_preference } = req.body; // optional
    try {
        let query = "SELECT * FROM beds WHERE status = 'available' LIMIT 1";
        let params = [];
        
        if (ward_preference) {
            query = "SELECT * FROM beds WHERE status = 'available' AND ward = ? LIMIT 1";
            params.push(ward_preference);
        }

        const [availableBeds] = await pool.query(query, params);

        if (availableBeds.length === 0) {
            return res.status(400).json({ error: 'No available beds for admission' });
        }

        const bed = availableBeds[0];

        await pool.query("UPDATE beds SET status = 'occupied' WHERE id = ?", [bed.id]);

        res.json({ 
            message: 'Patient admitted successfully', 
            bed: { ...bed, status: 'occupied' }
        });
    } catch (error) {
        console.error('Error admitting patient:', error);
        res.status(500).json({ error: 'Failed to process admission' });
    }
});

module.exports = router;
