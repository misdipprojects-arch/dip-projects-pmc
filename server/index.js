require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const siteRoutes = require('./routes/sites');
const leaveRoutes = require('./routes/leaves');
const ticketRoutes = require('./routes/tickets');
const drawingRoutes = require('./routes/drawings');
const masterRoutes = require('./routes/master');
const taskRoutes = require('./routes/tasks');
const recurringTaskRoutes = require('./routes/recurring_tasks');
const dailyReportRoutes = require('./routes/daily_report');

const app = express();

// CORS: React dev server runs on a different port (e.g. 3000) than this
// API (e.g. 4000), so the browser needs an explicit allow. Set
// CLIENT_ORIGIN in .env to your deployed frontend URL in production.
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  exposedHeaders: ['X-New-Token'], // so the frontend can read the sliding-session refresh token
}));

app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/sites', siteRoutes);
app.use('/leaves', leaveRoutes);
app.use('/tickets', ticketRoutes);
app.use('/drawings', drawingRoutes);
app.use('/master', masterRoutes);
app.use('/tasks', taskRoutes);
app.use('/recurring-tasks', recurringTaskRoutes);
app.use('/daily-report', dailyReportRoutes);

// TODO (next step): mount the DIP site-portal routes once written —
// /attendance, /manpower, /site-reports, /wpr, /dpr, /material-requirements,
// /checklists — backed by schema_dip_extension.sql's new tables.

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`TaskFlow / DIP Projects PMC backend running on port ${PORT}`);
});
