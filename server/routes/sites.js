const express = require('express');
const supabase = require('../lib/supabaseClient');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const SITE_SELECT = `
  id, name, client_name, project_type, location, start_date, expected_end_date,
  status, description, created_at,
  team_leader_id, coordinator_id, site_incharge_id
`;

// ----------------------------- list sites (everyone, for dropdowns + table) -----------------------------
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(SITE_SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Fetch all user names in one shot and attach them
    const userIds = [...new Set(
      data.flatMap(s => [s.team_leader_id, s.coordinator_id, s.site_incharge_id]).filter(Boolean)
    )];
    let userMap = {};
    if (userIds.length) {
      const { data: users } = await supabase.from('users').select('id, full_name').in('id', userIds);
      (users || []).forEach(u => { userMap[u.id] = u; });
    }

    const enriched = data.map(s => ({
      ...s,
      team_leader:  userMap[s.team_leader_id]  || null,
      coordinator:  userMap[s.coordinator_id]  || null,
      site_incharge: userMap[s.site_incharge_id] || null,
    }));

    res.json(enriched);
  } catch (err) {
    console.error('List sites error:', err.message);
    res.status(500).json({ error: 'Could not load sites' });
  }
});

// ----------------------------- add site (admin only) -----------------------------
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      name, client_name, project_type, location,
      start_date, expected_end_date,
      team_leader_id, coordinator_id, site_incharge_id,
      description
    } = req.body || {};

    if (!name || !client_name || !project_type || !location || !start_date ||
        !team_leader_id || !coordinator_id || !site_incharge_id) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name, client_name, project_type, location,
        start_date, expected_end_date: expected_end_date || null,
        team_leader_id, coordinator_id, site_incharge_id,
        description: description || null,
        status: 'Planning'
      })
      .select(SITE_SELECT)
      .single();

    if (error) throw error;

    const { data: users } = await supabase.from('users').select('id, full_name')
      .in('id', [team_leader_id, coordinator_id, site_incharge_id].filter(Boolean));
    const userMap = {};
    (users || []).forEach(u => { userMap[u.id] = u; });

    res.status(201).json({
      ...data,
      team_leader:   userMap[team_leader_id]   || null,
      coordinator:   userMap[coordinator_id]   || null,
      site_incharge: userMap[site_incharge_id] || null,
    });
  } catch (err) {
    console.error('Add site error:', err.message);
    res.status(500).json({ error: err.message || 'Could not add site' });
  }
});

// ----------------------------- update site team / details (admin only) -----------------------------
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      'name', 'client_name', 'project_type', 'location', 'start_date',
      'expected_end_date', 'team_leader_id', 'coordinator_id',
      'site_incharge_id', 'description', 'status'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select(SITE_SELECT)
      .single();

    if (error) throw error;

    const ids = [data.team_leader_id, data.coordinator_id, data.site_incharge_id].filter(Boolean);
    const userMap = {};
    if (ids.length) {
      const { data: users } = await supabase.from('users').select('id, full_name').in('id', ids);
      (users || []).forEach(u => { userMap[u.id] = u; });
    }
    res.json({
      ...data,
      team_leader:   userMap[data.team_leader_id]   || null,
      coordinator:   userMap[data.coordinator_id]   || null,
      site_incharge: userMap[data.site_incharge_id] || null,
    });
  } catch (err) {
    console.error('Update site error:', err.message);
    res.status(500).json({ error: err.message || 'Could not update site' });
  }
});

// ----------------------------- delete site (admin only) -----------------------------
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete site error:', err.message);
    res.status(500).json({ error: err.message || 'Could not delete site' });
  }
});

module.exports = router;
