const pool = require('./db');
async function test() {
   try {
       const [users] = await pool.query('SELECT * FROM users WHERE email = ?', ['reyyasunil86@gmail.com']);
       console.log("Found users:", users);
   } catch(e) {
       console.error("DB Query error:", e);
   }
   process.exit(0);
}
test();
