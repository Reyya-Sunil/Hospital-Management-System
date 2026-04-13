const mysql = require('mysql2/promise');

async function fix() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Sunil@2005'
        });
        console.log("Connected to MySQL.");
        await connection.query("DROP DATABASE IF EXISTS Hospital");
        await connection.query("CREATE DATABASE Hospital");
        console.log("Recreated database 'Hospital' completely.");
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
