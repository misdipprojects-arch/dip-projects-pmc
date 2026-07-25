const express = require('express');
const supabase = require('../lib/supabaseClient');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendWhatsAppTemplate } = require('../lib/whatsapp');

const router = express.Router();
router.use(requireAuth);

// Every leave row always comes back shaped the same way, with the
// applicant's name attached (and the admin's name once it's been decided).
const LEAVE_SELECT = `
  id, from_date, to_date, is_half_day, reason, status,
  decision_note, created_at, decided_at,
  user:users!leaves_user_id_fkey ( id, full_name ),
  decided_by_user:users!leaves_decided_by_fkey ( id, full_name )
`;

// ----------------------------- apply for leave (anyone logged in) -----------------------------
router.post('/', async (req, res) => {
  try {
    const { from_date, to_date, is_half_day, reason } = req.body || {};

    if (!from_date || !to_date) {
      return res.status(400).json({ error: 'Please select both from and to dates' });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Please give a reason for the leave' });
    }
    if (new Date(to_date) < new Date(from_date)) {
      return res.status(400).json({ error: 'To date cannot be before from date' });
    }

    const { data, error } = await supabase
      .from('leaves')
      .insert({
        user_id: req.user.id,
        from_date,
        to_date,
        is_half_day: !!is_half_day,
        reason: reason.trim(),
        status: 'Pending'
      })
      .select(LEAVE_SELECT)
      .single();
//17 july 
  //   if (error) throw error;
  //   res.status(201).json(data);
  // } catch (err) {
  //   console.error('Apply leave error:', err.message);
if (error) throw error;

    // Notify: hamesha Chirag Sir (top head) + is employee ka apna
    // reporting head (agar set hai) — duplicate na ho isliye Set use kiya
    const numbers = new Set();

    const { data: chirag } = await supabase
      .from('users').select('whatsapp_number').eq('username', 'chirag.s').maybeSingle();
    if (chirag?.whatsapp_number) numbers.add(chirag.whatsapp_number);

    const { data: applicant } = await supabase
      .from('users').select('reporting_head_id').eq('id', req.user.id).maybeSingle();

    if (applicant?.reporting_head_id) {
      const { data: head } = await supabase
        .from('users').select('whatsapp_number').eq('id', applicant.reporting_head_id).maybeSingle();
      if (head?.whatsapp_number) numbers.add(head.whatsapp_number);
    }

    for (const num of numbers) {
      sendWhatsAppTemplate(num, 'leave_application_notification', [
        req.user.full_name,
        from_date,
        to_date,
        reason.trim()
      ]).catch(() => {});
    }

    res.status(201).json(data);

    //above 17th july chg
  } catch (err) {
    console.error('Apply leave error:', err.message);
    res.status(500).json({ error: err.message || 'Could not submit leave request' });
  }
});

// ----------------------------- my leave requests (everyone — only their own) -----------------------------
router.get('/my', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leaves')
      .select(LEAVE_SELECT)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('List my leaves error:', err.message);
    res.status(500).json({ error: 'Could not load your leave requests' });
  }
});

// ----------------------------- all leave requests (admin only) -----------------------------
router.get('/all', requireAdmin, async (req, res) => {
  try {
    let query = supabase.from('leaves').select(LEAVE_SELECT).order('created_at', { ascending: false });
    if (req.query.status) query = query.eq('status', req.query.status);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('List all leaves error:', err.message);
    res.status(500).json({ error: 'Could not load leave requests' });
  }
});

// ----------------------------- approve (admin only) -----------------------------
router.patch('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchErr } = await supabase
      .from('leaves').select('id, status').eq('id', id).maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) return res.status(404).json({ error: 'Leave request not found' });
    if (existing.status !== 'Pending') {
      return res.status(400).json({ error: 'This request has already been decided' });
    }

    const { data, error } = await supabase
      .from('leaves')
      .update({
        status: 'Approved',
        decided_by: req.user.id,
        decided_at: new Date().toISOString(),
        decision_note: null
      })
      .eq('id', id)
      .select(LEAVE_SELECT)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Approve leave error:', err.message);
    res.status(500).json({ error: err.message || 'Could not approve leave request' });
  }
});

// ----------------------------- reject (admin only — reason optional) -----------------------------
router.patch('/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};

    const { data: existing, error: fetchErr } = await supabase
      .from('leaves').select('id, status').eq('id', id).maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) return res.status(404).json({ error: 'Leave request not found' });
    if (existing.status !== 'Pending') {
      return res.status(400).json({ error: 'This request has already been decided' });
    }

    const { data, error } = await supabase
      .from('leaves')
      .update({
        status: 'Rejected',
        decided_by: req.user.id,
        decided_at: new Date().toISOString(),
        decision_note: reason && reason.trim() ? reason.trim() : null
      })
      .eq('id', id)
      .select(LEAVE_SELECT)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Reject leave error:', err.message);
    res.status(500).json({ error: err.message || 'Could not reject leave request' });
  }
});

// ----------------------------- cancel own pending request (employee) -----------------------------
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existing, error: fetchErr } = await supabase
      .from('leaves').select('id, user_id, status').eq('id', id).maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) return res.status(404).json({ error: 'Leave request not found' });

    const isOwn = existing.user_id === req.user.id;
    if (!isOwn && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only cancel your own leave requests' });
    }
    if (existing.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending requests can be cancelled' });
    }

    const { error } = await supabase.from('leaves').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error('Cancel leave error:', err.message);
    res.status(500).json({ error: err.message || 'Could not cancel leave request' });
  }
});

module.exports = router;
