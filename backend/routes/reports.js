const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const pool = require('../db');

// Helper function to generate PDF from database rows
function buildPDF(res, title, columns, data) {
    const doc = new PDFDocument({ margin: 30 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${title.replace(/\s+/g, '_')}.pdf`);
    
    doc.pipe(res);
    
    // Title
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown(2);
    
    // Draw table header
    const top = doc.y;
    doc.fontSize(12).font('Helvetica-Bold');
    
    let currentX = 30;
    const cw = (550) / columns.length; // rough column width

    columns.forEach((col, i) => {
        doc.text(col.toUpperCase(), currentX, top, { width: cw, align: 'left' });
        currentX += cw;
    });
    
    doc.moveDown();
    
    // Draw a line
    doc.moveTo(30, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(0.5);

    // Draw rows
    doc.font('Helvetica');
    data.forEach(row => {
        let x = 30;
        let startY = doc.y;
        let maxHeight = 0;

        columns.forEach(col => {
            const val = row[col] ? String(row[col]) : '';
            doc.text(val, x, startY, { width: cw, align: 'left' });
            
            const currentHeight = doc.y - startY;
            if (currentHeight > maxHeight) maxHeight = currentHeight;
            
            x += cw;
        });
        
        doc.y = startY + maxHeight + 5; // Move cursor past the row
        doc.moveTo(30, doc.y).lineTo(570, doc.y).stroke();
        doc.moveDown(0.5);
    });

    doc.end();
}

// Endpoint: Generate Patients PDF
router.get('/patients', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT name, age, gender, diagnosis, contact FROM patients');
        const columns = ['name', 'age', 'gender', 'diagnosis', 'contact'];
        buildPDF(res, 'Patients Directory', columns, rows);
    } catch (error) {
        console.error('Error generating patients PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

// Endpoint: Generate Staff PDF
router.get('/staff', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT name, role, department, contact FROM staff');
        const columns = ['name', 'role', 'department', 'contact'];
        buildPDF(res, 'Staff Directory', columns, rows);
    } catch (error) {
        console.error('Error generating staff PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

module.exports = router;
