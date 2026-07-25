// Quick way to add a real employee login without writing SQL by hand.
// Usage:
//   node scripts/addEmployee.js <username> <password> "<Full Name>" [admin]
// The optional 4th argument "admin" creates an admin instead of an employee.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../lib/supabaseClient');

(async () => {
  const [username, password, full_name, roleArg] = process.argv.slice(2);

  if (!username || !password || !full_name) {
    console.log('Usage: node scripts/addEmployee.js <username> <password> "<Full Name>" [admin]');
    process.exit(1);
  }

  const role = roleArg === 'admin' ? 'admin' : 'employee';

  try {
    const { data: existing } = await supabase.from('users').select('id').eq('username', username).maybeSingle();
    if (existing) {
      console.log(`❌ username "${username}" already exists`);
      process.exit(1);
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { error } = await supabase.from('users').insert({ username, password_hash, full_name, role });
    if (error) throw error;

    console.log(`✅ created ${role} login → username: "${username}"  password: "${password}"`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
})();
