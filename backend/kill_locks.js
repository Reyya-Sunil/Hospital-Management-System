const mysql = require('mysql2/promise');

async function fix() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Sunil@2005'
        });
        console.log("Connected to MySQL.");
        
        const [rows] = await connection.query("SHOW PROCESSLIST");
        
        let killed = 0;
        for (const row of rows) {
            if (row.Id !== connection.threadId) {
                console.log(`Killing process ${row.Id}`);
                try {
                    await connection.query(`KILL ${row.Id}`);
                    killed++;
                } catch(e) {
                    console.log(`Failed to kill process ${row.Id}`, e.message);
                }
            }
        }
        console.log(`Killed ${killed} processes.`);
        
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
