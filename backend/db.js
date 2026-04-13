const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Sunil@2005',
    database: 'Hospital',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to the database.');

        // Initialize Tables
        const createPatientsTable = `
            CREATE TABLE IF NOT EXISTS patients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                age INT,
                gender VARCHAR(10),
                diagnosis VARCHAR(255),
                contact VARCHAR(20)
            )
        `;

        const createStaffTable = `
            CREATE TABLE IF NOT EXISTS staff (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                role VARCHAR(100),
                department VARCHAR(100),
                contact VARCHAR(20)
            )
        `;

        const createAppointmentsTable = `
            CREATE TABLE IF NOT EXISTS appointments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                patient_name VARCHAR(100) NOT NULL,
                doctor_name VARCHAR(100) NOT NULL,
                appointment_date DATETIME,
                status VARCHAR(50),
                type VARCHAR(100)
            )
        `;

        const createBedsTable = `
            CREATE TABLE IF NOT EXISTS beds (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ward VARCHAR(100),
                bed_number VARCHAR(10),
                status VARCHAR(50) DEFAULT 'available'
            )
        `;

        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                name VARCHAR(100) NOT NULL,
                otp VARCHAR(10),
                otp_expiry DATETIME,
                status VARCHAR(50) DEFAULT 'unverified'
            )
        `;

        await connection.query(createPatientsTable);
        await connection.query(createStaffTable);
        await connection.query(createAppointmentsTable);
        await connection.query(createBedsTable);
        
        // Force refresh of the users table so the status column is 100% created.
        await connection.query("DROP TABLE IF EXISTS users");
        await connection.query(createUsersTable);

        // Check if tables are empty and insert mock data if necessary
        const [patients] = await connection.query('SELECT COUNT(*) as count FROM patients');
        if (patients[0].count === 0) {
            console.log('Inserting mock patients...');
            await connection.query(`
                INSERT INTO patients (name, age, gender, diagnosis, contact) VALUES 
                ('John Smith', 45, 'Male', 'Hypertension', '555-0101'),
                ('Jane Doe', 32, 'Female', 'Type 2 Diabetes', '555-0102'),
                ('Alice Johnson', 28, 'Female', 'Asthma', '555-0103'),
                ('Bob Brown', 55, 'Male', 'Osteoarthritis', '555-0104')
            `);
        }

        const [staff] = await connection.query('SELECT COUNT(*) as count FROM staff');
        if (staff[0].count === 0) {
            console.log('Inserting mock staff...');
            await connection.query(`
                INSERT INTO staff (name, role, department, contact) VALUES 
                ('Dr. Emily White', 'Physician', 'Cardiology', '555-0201'),
                ('Dr. Michael Green', 'Surgeon', 'Orthopedics', '555-0202'),
                ('Dr. Aris', 'Neurologist', 'Neurology', '555-0205'),
                ('Sarah Lee', 'Nurse', 'Pediatrics', '555-0203'),
                ('David Clark', 'Technician', 'Radiology', '555-0204')
            `);
        }

        const [appointments] = await connection.query('SELECT COUNT(*) as count FROM appointments');
        if (appointments[0].count === 0) {
            console.log('Inserting mock appointments...');
            await connection.query(`
                INSERT INTO appointments (patient_name, doctor_name, appointment_date, status, type) VALUES 
                ('John Smith', 'Dr. Aris', NOW(), 'Scheduled', 'Surgical Review'),
                ('Jane Doe', 'Dr. Emily White', DATE_ADD(NOW(), INTERVAL 2 HOUR), 'Scheduled', 'Checkup'),
                ('Alice Johnson', 'Dr. Aris', DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Pending', 'Neurology Review')
            `);
        }
        
        const [beds] = await connection.query('SELECT COUNT(*) as count FROM beds');
        if (beds[0].count === 0) {
            console.log('Inserting mock beds...');
            await connection.query(`
                INSERT INTO beds (ward, bed_number, status) VALUES 
                ('ICU', '101', 'occupied'),
                ('ICU', '102', 'available'),
                ('General', '201', 'occupied'),
                ('General', '202', 'available'),
                ('General', '203', 'available')
            `);
        }

        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        if (users[0].count === 0) {
            console.log('Inserting mock users...');
            await connection.query(`
                INSERT INTO users (email, password, role, name, status) VALUES 
                ('reyyasunil86@gmail.com', 'password123', 'admin', 'Sunil Reyya', 'verified'),
                ('clinician@aurahealth.com', 'password123', 'clinician', 'Dr. Emily White', 'verified'),
                ('patient@example.com', 'password123', 'patient', 'John Doe', 'verified')
            `);
        } else {
            console.log('Updating existing mock users to ensure correct passwords...');
            await connection.query(`
                UPDATE users SET password = 'password123' 
                WHERE email IN ('reyyasunil86@gmail.com', 'clinician@aurahealth.com', 'patient@example.com')
            `);
        }

        console.log('Database initialization completed.');
        connection.release();
    } catch (error) {
        console.error('Error connecting to or initializing database:', error);
    }
}

initializeDatabase();

module.exports = pool;
