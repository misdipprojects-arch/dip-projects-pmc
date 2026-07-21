const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabaseClient');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // const { data: user, error } = await supabase
    //   .from('users')
    //   .select('id, username, password_hash, full_name, role, is_active, can_verify, is_mis_executive, can_add_site, can_add_employee')
    //   .eq('username', username.trim())
    //   .maybeSingle();
const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, full_name, role, is_active, can_verify, is_mis_executive, can_add_site, can_add_employee, department, department_id')
      .eq('username', username.trim())
      .maybeSingle();
    if (error) throw error;

    // Same error for "no such user" and "wrong password" so we don't leak
    // which usernames exist.
    if (!user || user.is_active === false) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // const payload = {
    //   id: user.id,
    //   username: user.username,
    //   full_name: user.full_name,
    //   role: user.role,
    //   can_verify: !!user.can_verify,
    //   is_mis_executive: !!user.is_mis_executive,
    //   can_add_site: !!user.can_add_site,
    //   can_add_employee: !!user.can_add_employee
    // };
const payload = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      department: user.department,
      department_id: user.department_id,
      can_verify: !!user.can_verify,
      is_mis_executive: !!user.is_mis_executive,
      can_add_site: !!user.can_add_site,
      can_add_employee: !!user.can_add_employee
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed, please try again' });
  }
});

module.exports = router;
