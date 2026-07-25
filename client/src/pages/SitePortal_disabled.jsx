import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "../components/Navbar";
import SiteReport from "./Sitereport";
import { ClockInOut, CalendarView, CLOCK_CSS } from "./Clockinout.jsx";
import MyReports from "./MyReports";
import DPR from "./Dpr.jsx";
import ManpowerReport from "./Manpowerreport.jsx";
import Profile from "./Profile";
import WprGenerator from "./Wprgenerator.jsx";
import MatRequirement from "./MatRequirement.jsx";

// ─── Supabase ────────────────────────────────────────────────────────────────
const SUPABASE_URL  = "https://efqfjfthsleymhljswcq.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcWZqZnRoc2xleW1obGpzd2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNDY0MjMsImV4cCI6MjA5NTkyMjQyM30.PYMRiKdnhzb6pkvhDB4M4Qdp3nSGhsZpHGuclVqYNMs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const today  = () => new Date().toISOString().split("T")[0];
const fmtD   = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "—";
const fmtDT  = (dt) => dt ? new Date(dt).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}) : "—";
const pad    = (n)  => String(n).padStart(2,"0");

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WDAYS  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const LEAVE_TYPES = ["Casual Leave","Sick Leave","Earned Leave","Maternity Leave","Paternity Leave","Compensatory Leave","Unpaid Leave"];

const DARK_CSS = `
[data-theme="dark"] {
  --ink:#f0ede8;
  --ink2:#c4bdb4;
  --ink3:#7a7368;
  --paper:#1e1c19;
  --surface:#252320;
  --line:#2e2b27;
  --line2:#3a3733;
  --amber:#f59e0b;
  --amber2:#fbbf24;
  --amber-bg:#2a1f08;
  --amber-line:#4a3210;
  --red:#f87171;
  --green:#4ade80;
  --blue:#60a5fa;
  --shadow:0 2px 16px rgba(0,0,0,.3);
} 

/* ── Report Submissions ── */
[data-theme="dark"] .op-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* Overview banner */
[data-theme="dark"] .rs-banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%) !important;
}

/* Tab bar container */
[data-theme="dark"] .rs-tab-bar {
  background: #252320 !important;
  border-color: #3a3733 !important;
}

/* Tab buttons */
[data-theme="dark"] .rs-tab-btn {
  color: #7a7368 !important;
  background: transparent !important;
}
[data-theme="dark"] .rs-tab-btn.active {
  background: #1e1c19 !important;
  box-shadow: 0 1px 6px rgba(0,0,0,.3) !important;
}

/* Filters row */
[data-theme="dark"] .rs-filter-row {
  background: #252320 !important;
  border-color: #3a3733 !important;
}
[data-theme="dark"] .rs-filter-row input,
[data-theme="dark"] .rs-filter-row select {
  background: #1e1c19 !important;
  border-color: #3a3733 !important;
  color: #f0ede8 !important;
}
[data-theme="dark"] .rs-filter-row select option {
  background: #252320;
  color: #f0ede8;
}

/* Report cards */
[data-theme="dark"] .rs-card {
  background: #1e1c19 !important;
  border-color: #2e2b27 !important;
}

/* Date section divider line */
[data-theme="dark"] .rs-date-divider {
  background: #2e2b27 !important;
}
[data-theme="dark"] .rs-date-label {
  color: #7a7368 !important;
}

/* Card inner text */
[data-theme="dark"] .rs-engineer-name {
  color: #c4bdb4 !important;
}
[data-theme="dark"] .rs-preview-text {
  color: #7a7368 !important;
}
[data-theme="dark"] .rs-submitted-time {
  color: #3a3733 !important;
}

/* View/Download buttons on cards */
[data-theme="dark"] .rs-btn-view {
  background: #252320 !important;
  border-color: #3a3733 !important;
  color: #c4bdb4 !important;
}
[data-theme="dark"] .rs-btn-download {
  background: #0c1d38 !important;
  border-color: #1e3a5f !important;
  color: #60a5fa !important;
}

/* No-PDF label */
[data-theme="dark"] .rs-no-pdf {
  color: #3a3733 !important;
}

/* WPR empty state */
[data-theme="dark"] .rs-wpr-empty svg {
  stroke: #3a3733 !important;
}
[data-theme="dark"] .rs-wpr-empty p {
  color: #7a7368 !important;
}

[data-theme="dark"] {.card-title{font-size:15px;font-weight:800;color:white;}}

[data-theme="dark"] body,
[data-theme="dark"] #root {
  background:#141210;
  color:#f0ede8;
}

[data-theme="dark"] .tb {
  background:#0f0e0c;
  box-shadow:0 2px 0 rgba(255,255,255,.04);
}

[data-theme="dark"] .sidebar {
  background:#1a1815;
  border-color:#2e2b27;
}

[data-theme="dark"] .card {
  background:#1e1c19;
  border-color:#2e2b27;
}

[data-theme="dark"] .card-hdr {
  border-color:#2e2b27;
}

[data-theme="dark"] .card-ico {
  background:#2a1f08;
  color:#fbbf24;
}

[data-theme="dark"] .finput {
  background:#252320;
  border-color:#3a3733;
  color:#f0ede8;
}

[data-theme="dark"] .finput:focus {
  background:#2e2b27;
  border-color:#f59e0b;
}

[data-theme="dark"] .sni {
  color:#c4bdb4;
}

[data-theme="dark"] .sni:hover {
  background:#252320;
  color:#f0ede8;
}

[data-theme="dark"] .sni.act {
  background:#2a1f08;
  color:#fbbf24;
}

[data-theme="dark"] .sni.act svg {
  stroke:#fbbf24;
}

[data-theme="dark"] .stat-card {
  background:#252320;
  border-color:#2e2b27;
}

[data-theme="dark"] .stat-lbl {
  color:#7a7368;
}

[data-theme="dark"] .tbl th {
  background:#1a1815;
  color:#c4bdb4;
  border-color:#2e2b27;
}

[data-theme="dark"] .tbl td {
  border-color:#2e2b27;
  color:#c4bdb4;
}

[data-theme="dark"] .tbl tr:hover td {
  background:#252320;
}

[data-theme="dark"] .tbl-wrap {
  border-color:#2e2b27;
}

[data-theme="dark"] .badge-green {
  background:#052e16;
  color:#4ade80;
  border-color:#166534;
}

[data-theme="dark"] .badge-amber {
  background:#2a1f08;
  color:#fbbf24;
  border-color:#4a3210;
}

[data-theme="dark"] .badge-red {
  background:#2d0a0a;
  color:#f87171;
  border-color:#7f1d1d;
}

[data-theme="dark"] .badge-blue {
  background:#0c1d38;
  color:#60a5fa;
  border-color:#1e3a5f;
}

[data-theme="dark"] .badge-gray {
  background:#252320;
  color:#c4bdb4;
  border-color:#3a3733;
}

[data-theme="dark"] .info-banner {
  background:#0c1d38;
  border-color:#1e3a5f;
  color:#60a5fa;
}

[data-theme="dark"] .warn-banner {
  background:#2a1f08;
  border-color:#4a3210;
  color:#fbbf24;
}

[data-theme="dark"] .btn-out {
  background:#252320;
  color:#c4bdb4;
  border-color:#3a3733;
}

[data-theme="dark"] .btn-out:hover {
  background:#2e2b27;
}

[data-theme="dark"] .btn-red {
  background:#2d0a0a;
  color:#f87171;
  border-color:#7f1d1d;
}

[data-theme="dark"] .btn-green {
  background:#052e16;
  color:#4ade80;
  border-color:#166534;
}

[data-theme="dark"] .lv-item {
  background:#252320;
  border-color:#2e2b27;
}

[data-theme="dark"] .lv-type {
  color:#f0ede8;
}

[data-theme="dark"] .lv-dates,
[data-theme="dark"] .lv-reason {
  color:#7a7368;
}

[data-theme="dark"] .clock-status {
  background:#252320;
  border-color:#2e2b27;
  color:#c4bdb4;
}

[data-theme="dark"] .clock-status strong {
  color:#f0ede8;
}

[data-theme="dark"] .clock-row {
  background:#252320;
  border-color:#2e2b27;
}

[data-theme="dark"] .clock-row-date,
[data-theme="dark"] .clock-row-times {
  color:#c4bdb4;
}

[data-theme="dark"] .att-summary {
  background:#252320;
  border-color:#2e2b27;
}

[data-theme="dark"] .att-sum-title {
  color:#f0ede8;
}

[data-theme="dark"] .cal-cell:not(.emp):hover {
  background:#252320;
  border-color:#3a3733;
}

[data-theme="dark"] .cal-cell.today {
  background:#2a1f08;
  border-color:#f59e0b;
}

[data-theme="dark"] .cal-cell.sel {
  background:#3a3733;
  border-color:#c4bdb4;
}

[data-theme="dark"] .cal-cell.sel .cal-dn {
  color:#f0ede8;
}

[data-theme="dark"] .cal-dh {
  color:#7a7368;
}

[data-theme="dark"] .cal-dn {
  color:#c4bdb4;
}

[data-theme="dark"] .cal-cell.today .cal-dn {
  color:#fbbf24;
}

[data-theme="dark"] .cal-leg-item {
  color:#c4bdb4;
}

[data-theme="dark"] .rpt-item {
  background:#252320;
  border-color:#2e2b27;
}

[data-theme="dark"] .rpt-item-title {
  color:#f0ede8;
}

[data-theme="dark"] .rpt-item-meta {
  color:#7a7368;
}

[data-theme="dark"] .rpt-dl-btn {
  background:#1e1c19;
  border-color:#3a3733;
  color:#c4bdb4;
}

[data-theme="dark"] .rpt-dl-btn:hover {
  background:#2a1f08;
  color:#fbbf24;
  border-color:#f59e0b;
}

[data-theme="dark"] .empty-state .empty-ico {
  background:#252320;
  color:#7a7368;
}

[data-theme="dark"] .empty-title {
  color:#c4bdb4;
}

[data-theme="dark"] .empty-sub {
  color:#7a7368;
}

[data-theme="dark"] .sgroup-lbl {
  color:#7a7368;
}

[data-theme="dark"] .sgroup-chev {
  color:#7a7368;
}

[data-theme="dark"] .sgroup-hdr:hover .sgroup-lbl {
  color:#c4bdb4;
}

[data-theme="dark"] .success-state .success-ico {
  background:#052e16;
}

[data-theme="dark"] .success-title {
  color:#f0ede8;
}

[data-theme="dark"] .success-sub {
  color:#c4bdb4;
}

[data-theme="dark"] .act-row {
  border-color:#2e2b27;
}

[data-theme="dark"] .tb-ham {
  border-color:rgba(255,255,255,.1);
  background:rgba(255,255,255,.05);
}

[data-theme="dark"] .sb-bottom {
  border-color: #2e2b27;
  background: #1a1815;
}

[data-theme="dark"] select.finput option {
  background:#252320;
  color:#f0ede8;
}

[data-theme="dark"] .cal-nav-btn {
  background:#1e1c19;
  border-color:#3a3733;
  color:#c4bdb4;
}

[data-theme="dark"] .cal-nav-btn:hover {
  background:#252320;
}

[data-theme="dark"] .cal-nav-title {
  color:#f0ede8;
}

[data-theme="dark"] .btn-pri{background:rgb(37, 32, 25);color:white;box-shadow:0 3px 10px rgba(15,13,10,.2); border:1px solid white;}
[data-theme="dark"] .btn-pri:hover{background:#2a2520;transform:translateY(-1px);color:#fff;}
[data-theme="dark"] .btn-pri:disabled{opacity:.5;cursor:not-allowed;transform:none;}

/* ── Logout Modal Dark Theme ── */
[data-theme="dark"] .logout-backdrop {
  background: rgba(5,3,2,0.75);
}

[data-theme="dark"] .logout-modal {
  background: #1e1c19;
  border-color: #c96a10;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}

[data-theme="dark"] .logout-modal-title {
  color: #f0ede8;
}

[data-theme="dark"] .logout-modal-sub {
  color: #a8a29e;
}

[data-theme="dark"] .logout-modal-user {
  background: linear-gradient(135deg,rgba(61,18,0,0.3),rgba(201,106,16,0.15));
  border-color: #c96a10;
}

[data-theme="dark"] .logout-modal-uname {
  color: #f0ede8;
}

[data-theme="dark"] .logout-modal-urole {
  color: #c96a10;
}

[data-theme="dark"] .logout-btn-cancel {
  background: #252320;
  border-color: #c96a10;
  color: #c96a10;
}

[data-theme="dark"] .logout-btn-cancel:hover {
  background: rgba(201,106,16,0.12);
}

[data-theme="dark"] .logout-btn-confirm {
  background: linear-gradient(135deg,#3d1200,#7a2e00,#c96a10);
  box-shadow: 0 3px 12px rgba(61,18,0,0.5);
}
  [data-theme="dark"] .profile-stat-dpr  { background: #2a1f08 !important; border-color: #4a3210 !important; }
[data-theme="dark"] .profile-stat-wpr  { background: #1e1a3a !important; border-color: #3d3470 !important; }
[data-theme="dark"] .profile-stat-svr  { background: #0c1d38 !important; border-color: #1e3a5f !important; }
[data-theme="dark"] .profile-stat-mon  { background: #052e16 !important; border-color: #166534 !important; }
[data-theme="dark"] .profile-stat-last { background: #1e1c19 !important; border-color: #2e2b27 !important; }
`;

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --ink:#0f0d0a;--ink2:#4a4540;--ink3:#9a9289;
  --paper:#f5f2ee;--surface:#fffefb;
  --line:#e8e2d8;--line2:#d4ccc0;
  --amber:#d97706;--amber2:#b45309;--amber-bg:#fffbeb;--amber-line:#fde68a;
  --red:#dc2626;--green:#16a34a;--blue:#2563eb;
  --radius:14px;--font:'Sora',sans-serif;--mono:'JetBrains Mono',monospace;
  --shadow:0 2px 16px rgba(15,13,10,.07);
}

body,#root{background:#c9d0d4d0;font-family:var(--font);color:var(--ink);}

/* ── Topbar ── */
.tb{height:58px;background:var(--ink);display:flex;align-items:center;gap:12px;padding:0 22px;position:sticky;top:0;z-index:100;box-shadow:0 2px 0 rgba(255,255,255,.06);}
.tb-logo{display:flex;align-items:center;gap:10px;flex:1;}
.tb-ico{width:32px;height:32px;background:var(--amber);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.tb-name{font-size:15px;font-weight:800;color:#fff;letter-spacing:-.3px;}
.tb-sub{font-size:10.5px;color:rgba(255,255,255,.45);font-weight:500;letter-spacing:.04em;text-transform:uppercase;}
.tb-ham{width:36px;height:36px;border-radius:8px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}
.tb-ham:hover{background:rgba(255,255,255,.14);}
.tb-user{display:flex;align-items:center;gap:9px;}
.tb-av{width:33px;height:33px;border-radius:50%;background:var(--amber);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;}
.tb-uinfo{display:flex;flex-direction:column;}
.tb-uname{font-size:12px;font-weight:700;color:#fff;}
.tb-urole{font-size:10px;color:rgba(255,255,255,.45);}

/* ── Layout ── */
.body{display:flex;min-height:calc(100vh - 58px);}
.sidebar {
  width: 248px;
  min-width: 248px;
  background: var(--surface);
  border-right: 1px solid var(--line);
  position: sticky;
  top: 58px;
  height: calc(100vh - 58px);
  overflow-y: auto;
  transition: width .22s, min-width .22s, opacity .18s;
  display: flex;
  flex-direction: column;
  z-index: 999;
}
.sb-bottom {
  padding: 10px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.sidebar.closed{width:0;min-width:0;opacity:0;pointer-events:none;overflow:hidden;}
.sidebar::-webkit-scrollbar{width:3px;}
.sidebar::-webkit-scrollbar-thumb{background:var(--line2);border-radius:2px;}
.main{flex:1;padding:28px 32px;overflow:auto;min-width:0;}

/* ── Sidebar nav ── */
.snav{padding:14px 10px;display:flex;flex-direction:column;gap:2px;margin-top:20px;}
.sgroup-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 10px 4px;cursor:pointer;user-select:none;}
.sgroup-lbl{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);}
.sgroup-chev{color:var(--ink3);transition:transform .2s;}
.sgroup-chev.open{transform:rotate(180deg);}
.sgroup-kids{overflow:hidden;max-height:600px;transition:max-height .25s ease,opacity .18s;display:flex;flex-direction:column;gap:1px;padding-left:4px;}
.sgroup-kids.shut{max-height:0;opacity:0;pointer-events:none;}
.sni{display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:9px;cursor:pointer;color:var(--ink2);font-size:13px;font-weight:500;border:none;background:transparent;width:100%;text-align:left;transition:background .15s,color .15s;}
.sni:hover{background:var(--paper);color:var(--ink);}
.sni.act{background:var(--amber-bg);color:var(--amber2);font-weight:700;}
.sni.act svg{stroke:var(--amber2);}
.sni.disabled{opacity:.4;cursor:not-allowed;pointer-events:none;}
.sni.disabled:hover{background:transparent;color:var(--ink2);}

/* ── Card ── */
.card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:20px;box-shadow:var(--shadow);}
.card-hdr{display:flex;align-items:center;gap:10px;margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid var(--line);}
.card-ico{width:36px;height:36px;border-radius:9px;background:var(--amber-bg);display:flex;align-items:center;justify-content:center;color:var(--amber2);flex-shrink:0;}
.card-title{font-size:15px;font-weight:800;color:var(--ink);}

/* ── Buttons ── */
.btn{display:inline-flex;align-items:center;gap:7px;font-family:var(--font);font-size:13px;font-weight:700;padding:10px 20px;border-radius:9px;border:none;cursor:pointer;transition:all .15s;}
.btn-pri{background:rgb(37, 32, 25);color:white;box-shadow:0 3px 10px rgba(15,13,10,.2);}
.btn-pri:hover{background:#2a2520;transform:translateY(-1px);color:#fff;}
.btn-pri:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.btn-out{background:var(--surface);color:var(--ink2);border:1.5px solid var(--line2);}
.btn-out:hover{background:var(--paper);}
.btn-amber{background:var(--amber);color:#fff;box-shadow:0 3px 10px rgba(217,119,6,.3);}
.btn-amber:hover{background:var(--amber2);transform:translateY(-1px);}
.btn-red{background:#fef2f2;color:var(--red);border:1.5px solid #fecaca;}
.btn-red:hover{background:#fee2e2;}
.btn-green{background:#f0fdf4;color:var(--green);border:1.5px solid #bbf7d0;}
.btn-green:hover{background:#dcfce7;}

/* ── Form ── */
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:15px;}
.col2{grid-column:span 2;}
@media(max-width:580px){.grid2{grid-template-columns:1fr;}.col2{grid-column:span 1;}}
.flabel{font-size:11.5px;font-weight:700;color:var(--ink2);margin-bottom:5px;display:flex;align-items:center;gap:5px;}
.req{color:var(--red);}
.opt{font-size:10.5px;font-weight:500;color:var(--ink3);background:var(--paper);border-radius:4px;padding:1px 6px;}
.finput{font-family:var(--font);font-size:13.5px;color:var(--ink);background:var(--paper);border:1.5px solid var(--line2);border-radius:9px;padding:9px 13px;outline:none;width:100%;transition:border .15s,box-shadow .15s;}
.finput:focus{border-color:var(--amber);box-shadow:0 0 0 3px rgba(217,119,6,.12);background:#fff;}
textarea.finput{resize:vertical;min-height:85px;}
select.finput{cursor:pointer;}
.fgroup{display:flex;flex-direction:column;}

/* ── Status badges ── */
.badge{font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap;}
.badge-green{background:#f0fdf4;color:var(--green);border:1px solid #bbf7d0;}
.badge-amber{background:var(--amber-bg);color:var(--amber2);border:1px solid var(--amber-line);}
.badge-red{background:#fef2f2;color:var(--red);border:1px solid #fecaca;}
.badge-gray{background:var(--paper);color:var(--ink2);border:1px solid var(--line2);}
.badge-blue{background:#eff6ff;color:var(--blue);border:1px solid #bfdbfe;}

/* ── Info banner ── */
.info-banner{display:flex;align-items:flex-start;gap:9px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 15px;font-size:13px;color:var(--blue);line-height:1.5;}
.info-banner svg{flex-shrink:0;margin-top:1px;}
.warn-banner{background:var(--amber-bg);border-color:var(--amber-line);color:var(--amber2);}

/* ── Success state ── */
.success-state{display:flex;flex-direction:column;align-items:center;padding:60px 24px;text-align:center;gap:14px;}
.success-ico{width:64px;height:64px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;color:var(--green);}
.success-title{font-size:17px;font-weight:800;}
.success-sub{font-size:13px;color:var(--ink2);max-width:340px;line-height:1.6;}

/* ── Stat cards ── */
.stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;}
.stat-card{background:#e0e5e7;border:1px solid var(--line);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:4px;}
.stat-val{font-size:22px;font-weight:800;font-family:var(--mono);}
.stat-lbl{font-size:11px;color:var(--ink2);font-weight:600;}

/* ── Clock in/out ── */
.clock-panel{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:40px 20px;}
.clock-time{font-size:52px;font-weight:800;font-family:var(--mono);color:var(--ink);letter-spacing:-2px;line-height:1;}
.clock-date{font-size:14px;color:var(--ink2);font-weight:500;}
.clock-btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
.clock-status{padding:12px 20px;background:#c9d0d4d0;border:1px solid var(--line);border-radius:12px;font-size:13px;color:var(--ink2);text-align:center;max-width:380px;width:100%;}
.clock-status strong{color:var(--ink);}
.clock-log{width:100%;max-width:480px;}
.clock-log-title{font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;}
.clock-row{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--paper);border:1px solid var(--line);border-radius:10px;margin-bottom:8px;}
.clock-row-date{font-size:12px;color:var(--ink2);font-weight:600;min-width:90px;}
.clock-row-times{flex:1;display:flex;gap:16px;font-size:12px;color:var(--ink2);}
.clock-row-times span{display:flex;align-items:center;gap:5px;}

/* ── Calendar ── */
.cal-nav{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
.cal-nav-title{font-size:16px;font-weight:800;flex:1;text-align:center;}
.cal-nav-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid var(--line2);background:var(--surface);color:var(--ink2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}
.cal-nav-btn:hover{background:var(--paper);}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;}
.cal-dh{text-align:center;font-size:10.5px;font-weight:800;color:var(--ink3);padding:4px 0 8px;letter-spacing:.05em;}
.cal-cell{min-height:54px;border-radius:9px;border:1.5px solid transparent;padding:6px 4px 4px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;transition:all .15s;position:relative;}
.cal-cell:not(.emp):hover{background:var(--paper);border-color:var(--line2);}
.cal-cell.emp{pointer-events:none;}
.cal-cell.today{background:var(--amber-bg);border-color:var(--amber);}
.cal-cell.sel{background:var(--ink);border-color:var(--ink);}
.cal-cell.sel .cal-dn{color:#fff;}
.cal-dn{font-size:12.5px;font-weight:700;color:var(--ink);}
.cal-cell.today .cal-dn{color:var(--amber2);}
.att-dot{width:7px;height:7px;border-radius:50%;margin-top:2px;}
.cal-legend{display:flex;flex-wrap:wrap;gap:12px;padding:14px 0 6px;}
.cal-leg-item{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--ink2);font-weight:500;}
.cal-leg-dot{width:8px;height:8px;border-radius:50%;}
.att-summary{background:#e0e5e7;border-radius:11px;padding:16px;margin-top:4px;}
.att-sum-title{font-size:12.5px;font-weight:700;margin-bottom:8px;}
.att-sum-info{font-size:13px;color:var(--ink2);display:flex;flex-direction:column;gap:4px;}

/* ── Leave list ── */
.lv-list{display:flex;flex-direction:column;gap:10px;}
.lv-item{display:flex;align-items:center;gap:14px;background:#cfcece94;border:1px solid var(--line);border-radius:11px;padding:14px 16px;}
.lv-left{flex:1;display:flex;flex-direction:column;gap:3px;}
.lv-type{font-size:13.5px;font-weight:700;}
.lv-dates{font-size:12px;color:var(--ink2);}
.lv-reason{font-size:11.5px;color:var(--ink3);font-style:italic;}

/* ── Report list ── */
.rpt-list{display:flex;flex-direction:column;gap:8px;}
.rpt-item{display:flex;align-items:center;gap:12px;background:var(--paper);border:1px solid var(--line);border-radius:11px;padding:13px 16px;}
.rpt-item-info{flex:1;display:flex;flex-direction:column;gap:2px;}
.rpt-item-title{font-size:13px;font-weight:700;}
.rpt-item-meta{font-size:11.5px;color:var(--ink3);}
.rpt-dl-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid var(--line2);background:var(--surface);color:var(--ink2);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.rpt-dl-btn:hover{background:var(--amber-bg);color:var(--amber2);border-color:var(--amber);}

/* ── Table ── */
.tbl-wrap{overflow-x:auto;border-radius:10px;border:1px solid var(--line);}
.tbl{width:100%;border-collapse:collapse;min-width:500px;}
.tbl th{font-size:11px;font-weight:800;color:var(--ink2);background:var(--paper);padding:10px 14px;text-align:left;border-bottom:1px solid var(--line);letter-spacing:.05em;text-transform:uppercase;}
.tbl td{padding:10px 14px;font-size:13px;border-bottom:1px solid var(--line);}
.tbl tr:last-child td{border-bottom:none;}
.tbl tr:hover td{background:#faf9f7;}
.tbl .day-lbl{font-weight:700;color:var(--amber2);font-size:12px;}

/* ── Empty state ── */
.empty-state{display:flex;flex-direction:column;align-items:center;padding:48px 24px;text-align:center;gap:10px;}
.empty-ico{width:52px;height:52px;border-radius:50%;background:var(--paper);display:flex;align-items:center;justify-content:center;color:var(--ink3);}
.empty-title{font-size:14px;font-weight:700;color:var(--ink2);}
.empty-sub{font-size:12.5px;color:var(--ink3);}

/* ── Filter row ── */
.filter-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;}

/* ── Actions row ── */
.act-row{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;padding-top:20px;border-top:1px solid var(--line);}

/* ── Mobile ── */
.sb-backdrop{display:none;}
@media(max-width:768px){
  .sidebar{position:fixed;top:58px;left:0;z-index:200;height:calc(100vh - 58px);width:min(85vw,270px);min-width:0;transform:translateX(0);box-shadow:12px 0 32px rgba(0,0,0,.18);}
  .sidebar.closed{width:min(85vw,270px);min-width:0;transform:translateX(-110%);opacity:0;}
  .sb-backdrop{display:block;position:fixed;inset:0;top:58px;z-index:190;background:rgba(15,13,10,.4);border:none;padding:0;}
  .main{padding:16px 14px 32px;}
  .stat-row{grid-template-columns:1fr 1fr;}
  .act-row{flex-direction:column-reverse;}
  .btn{width:100%;justify-content:center;}
  .tb-uinfo{display:none;}
}
  @media(max-width:999px){

  .sidebar{
    position:fixed;
    top:58px;
    left:0;
    z-index:200;

    width:min(85vw,270px);
    min-width:0;
    height:calc(100dvh - 58px);

    overflow-y:auto;
    overflow-x:hidden;

    -webkit-overflow-scrolling:touch;

    transform:translateX(0);
    box-shadow:12px 0 32px rgba(0,0,0,.18);
  }

  .sidebar.closed{
    transform:translateX(-110%);
    opacity:0;
  }

  .snav{
    padding:14px 10px 90px; /* extra bottom space */
  }

  .sb-bottom{
    position:sticky;
    bottom:0;
    background:var(--surface);
    z-index:2;
  }
}
@media(max-width:440px){
  .cal-cell{min-height:42px;padding:4px 2px;}
  .cal-dn{font-size:11px;}
}
.loading{display:flex;align-items:center;justify-content:center;padding:40px;color:var(--ink2);font-size:14px;gap:10px;}
.spinner{width:20px;height:20px;border:2.5px solid var(--line2);border-top-color:var(--amber);border-radius:50%;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.sni.disabled{opacity:.4;cursor:not-allowed;pointer-events:none;}
.sni.disabled:hover{background:transparent;color:var(--ink2);}
${CLOCK_CSS}
`;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ico = {
  clock:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  cal:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  leave:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>,
  apply:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>,
  report:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-4"/></svg>,
  weeklyPlan: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 12h2l2-4 2 8 2-4h2"/></svg>,
  weekly:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/><line x1="2" y1="21" x2="22" y2="21"/></svg>,
  monthly: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>,
  site:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  materialRequirement: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.3 7 12 12 20.7 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>,
  myRpt:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  manRpt:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  send:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>,
  plus:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  dl:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  info:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  menu:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  chev:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  home:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  in:      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  out:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  profile: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  check:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
};

// ─── Nav structure ────────────────────────────────────────────────────────────
const NAV = [
  { key:"clock-in",   label:"Clock In / Out",    icon:Ico.clock  },
  { key:"calendar",   label:"Attendance",         icon:Ico.cal    },
  { section:"leave",  label:"Leave",
    children:[
      { key:"my-leave",    label:"My Leave",    icon:Ico.leave  },
      { key:"apply-leave", label:"Apply Leave", icon:Ico.apply  },
    ]},
  { section:"reports", label:"Reports",
    children:[
      { key:"daily-report",          label:"Daily Report",        icon:Ico.report             },
      { key:"weekly-planning",         label:"Weekly Planning",     icon:Ico.weeklyPlan         },
      { key:"wpr-generator",         label:"Weekly Report",       icon:Ico.weekly             },
      { key:"monthly-report",        label:"Monthly Report",      icon:Ico.monthly            },
      { key:"site-report",           label:"Site Visit Report",   icon:Ico.site               },
      { key:"material-requirement",  label:"Material Requirement",icon:Ico.materialRequirement},
      { key:"my-reports",            label:"My Reports",          icon:Ico.myRpt              },
      { key:"manpower-reports",      label:"Manpower Report",     icon:Ico.manRpt             },
    ]},
];

const REPORT_SUBMISSIONS_ITEM = { key: "report-submissions", label: "Report Submissions", icon: (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)};

const ALL_ITEMS = [
  ...NAV.flatMap(n => n.children ? n.children : [n]),
  REPORT_SUBMISSIONS_ITEM,
  { key: "profile", label: "Profile & Settings", icon: Ico.profile },
];

// ─── Enabled tabs ─────────────────────────────────────────────────────────────
// REPLACE WITH:
const ENABLED_TABS = new Set([
  "clock-in",
  "calendar",
  "my-leave",
  "apply-leave",
  "daily-report",
  "site-report",
  "my-reports",
  "wpr-generator",
  "report-submissions",
  "profile",
  "manpower-reports",
  "material-requirement",
]);

// ─── Loading ──────────────────────────────────────────────────────────────────
function Loading() {
  return <div className="loading"><div className="spinner"/><span>Loading…</span></div>;
}
// ═══════════════════════════════════════════════════════════════════════════════
// MY LEAVE
// ═══════════════════════════════════════════════════════════════════════════════

function MyLeave({ user, onApply }) {
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("leaves")
        .select("*")
        .eq("user_name", user.user_name)
        .order("created_at", { ascending: false });
      setLeaves(data || []);
      setLoading(false);
    })();
  }, [user.user_name]);

  const normStatus = (l) => {
    if (l.proxy_approved === false) return "rejected";
    if (l.proxy_approved === true)  return "approved";
    const s = (l.status || "").toLowerCase();
    if (s === "reject" || s === "rejected") return "rejected";
    if (s === "approved") return "approved";
    return "pending";
  };

  const counts = { total: leaves.length, approved:0, pending:0, rejected:0 };
  leaves.forEach(l => {
    const s = normStatus(l);
    if (counts[s] !== undefined) counts[s]++;
  });

  const dayCount = (from, to) => {
    if (!from || !to) return null;
    return Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
  };

  if (loading) return <Loading/>;

  return (
    <div>
      <div className="stat-row">
        {[["Total",counts.total,"var(--ink)"],["Approved",counts.approved,"var(--green)"],["Pending",counts.pending,"var(--amber)"],["Rejected",counts.rejected,"var(--red)"]].map(([l,v,c])=>(
          <div key={l} className="stat-card">
            <div className="stat-val" style={{color:c}}>{v}</div>
            <div className="stat-lbl">{l}</div>
          </div>
        ))}
      </div>
      <div className="lv-list">
        {leaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-ico">{Ico.leave}</div>
            <div className="empty-title">No leave applications yet</div>
            <div className="empty-sub">Apply for your first leave below.</div>
          </div>
        ) : leaves.map(l => {
          const status = normStatus(l);
          const days   = dayCount(l.from_date, l.to_date);
          const isOpen = expanded === l.id;
          return (
            <div key={l.id} className="lv-item" style={{flexDirection:"column",alignItems:"stretch",cursor:"pointer",gap:0}}
              onClick={()=>setExpanded(isOpen ? null : l.id)}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div className="lv-left">
                  <div className="lv-type">{l.leave_type}</div>
                  <div className="lv-dates">
                    {fmtD(l.from_date)} → {fmtD(l.to_date)}
                    {days && <> · <strong>{days} day{days>1?"s":""}</strong></>}
                  </div>
                  {l.reason && <div className="lv-reason">"{l.reason}"</div>}
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                  {l.proxy_user_name && (
                    <span className={`badge ${l.proxy_approved===true?"badge-green":l.proxy_approved===false?"badge-red":"badge-amber"}`} style={{fontSize:10}}>
                      Head: {l.proxy_approved===true?"✓ Approved":l.proxy_approved===false?"✗ Rejected":"Pending"}
                    </span>
                  )}
                </div>
              </div>
              {isOpen && (
                <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid var(--line)",display:"flex",flexDirection:"column",gap:6,fontSize:12.5,color:"var(--ink2)"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 16px"}}>
                    <span>Site: <strong>{l.site_name||"—"}</strong></span>
                    <span>Applied from: <strong>{fmtD(l.from_date)}</strong></span>
                    {l.proxy_user_name && (
                      <span>Site Head: <strong>{l.proxy_user_name}</strong></span>
                    )}
                    {l.proxy_approved === true  && <span style={{color:"var(--green)"}}>✓ Head Approved</span>}
                    {l.proxy_approved === false && <span style={{color:"var(--red)"}}>✗ Head Rejected</span>}
                    {l.proxy_approved === null && l.proxy_user_name && <span style={{color:"var(--amber2)"}}>⏳ Head Approval Pending</span>}
                    {l.rejection_reason && (
                      <span style={{gridColumn:"span 2",color:"var(--red)"}}>Reason: {l.rejection_reason}</span>
                    )}
                  </div>
                  {l.rejection_reason && (
                    <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"8px 12px",color:"var(--red)",marginTop:4}}>
                      Rejection reason: {l.rejection_reason}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{marginTop:16,display:"flex"}}>
        <button className="btn btn-pri" onClick={onApply}>{Ico.plus} Apply New Leave</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPLY LEAVE
// ═══════════════════════════════════════════════════════════════════════════════
function ApplyLeave({ user }) {
  const empty = { leave_type:"", from_date:"", to_date:"", reason:"", proxy_user_name:"" };
  const [form, setForm] = useState(empty);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [headLoading, setHeadLoading] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  useEffect(() => {
    if (!user?.site_name) return;
    setHeadLoading(true);
    supabase
      .from("user_details")
      .select("username")
      .eq("site_name", user.site_name)
      .eq("role", "Project Head")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.username) setForm(p => ({ ...p, proxy_user_name: data.username }));
        setHeadLoading(false);
      });
  }, [user?.site_name]);

  const days = form.from_date && form.to_date && new Date(form.to_date)>=new Date(form.from_date)
    ? Math.ceil((new Date(form.to_date)-new Date(form.from_date))/86400000)+1 : null;

  const submit = async () => {
    if (!form.leave_type || !form.from_date || !form.to_date) {
      setErr("Please fill all required fields.");
      return;
    }
    setBusy(true); setErr("");
    const { error } = await supabase.from("leaves").insert({
      user_name:       user.user_name,
      name:            user.name,
      leave_type:      form.leave_type,
      from_date:       form.from_date,
      to_date:         form.to_date,
      reason:          form.reason || null,
      site_name:       user.site_names?.[0] || user.site_name || null,
      proxy_user_name: form.proxy_user_name || null,
      status:          "Pending",
      admin_approved:  null,
      proxy_approved:  null,
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="success-state">
      <div className="success-ico">{Ico.check}</div>
      <div className="success-title">Leave Application Submitted!</div>
      <div className="success-sub">Your request is pending approval. You'll be notified once reviewed.</div>
      <button className="btn btn-pri" onClick={()=>{setSubmitted(false);setForm(empty);}}>Apply Another</button>
    </div>
  );

  return (
    <div>
      <div className="info-banner" style={{marginBottom:20}}>
        {Ico.info} Your leave application will be reviewed and approved or rejected by your site head.
        {form.proxy_user_name && ` Head assigned: ${form.proxy_user_name}`}
      </div>
      {err && <div className="info-banner warn-banner" style={{marginBottom:16}}>{Ico.info} {err}</div>}
      <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{background:"var(--paper)",border:"1px solid var(--line2)",borderRadius:9,padding:"8px 14px",fontSize:12.5}}>
          <span style={{color:"var(--ink3)",fontWeight:600}}>Employee: </span><strong>{user.name}</strong>
        </div>
        <div style={{background:"var(--paper)",border:"1px solid var(--line2)",borderRadius:9,padding:"8px 14px",fontSize:12.5}}>
          <span style={{color:"var(--ink3)",fontWeight:600}}>Site(s): </span>
          <strong>
            {(user.site_names?.length ? user.site_names.join(", ") : user.site_name) || "Not Assigned"}
          </strong>
        </div>
      </div>
      <div className="grid2">
        <div className="fgroup col1"></div>
        <div className="fgroup col2">
          <label className="flabel">Leave Type <span className="req">*</span></label>
          <select className="finput" value={form.leave_type} onChange={e=>set("leave_type",e.target.value)}>
            <option value="">Select leave type…</option>
            {LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="fgroup">
          <label className="flabel">From Date <span className="req">*</span></label>
          <input className="finput" type="date" value={form.from_date} onChange={e=>set("from_date",e.target.value)} min={today()}/>
        </div>
        <div className="fgroup">
          <label className="flabel">To Date <span className="req">*</span></label>
          <input className="finput" type="date" value={form.to_date} onChange={e=>set("to_date",e.target.value)} min={form.from_date||today()}/>
        </div>
        {days && (
          <div className="col2" style={{display:"flex",alignItems:"center",gap:8,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,padding:"10px 14px",fontSize:13,fontWeight:700,color:"var(--green)"}}>
            {Ico.clock} {days} day{days>1?"s":""} of leave
          </div>
        )}
        <div className="fgroup col2">
          <label className="flabel">Reason</label>
          <textarea className="finput" rows={3} placeholder="Briefly describe the reason…" value={form.reason} onChange={e=>set("reason",e.target.value)}/>
        </div>
        <div className="fgroup col2">
          <label className="flabel">
            Site Head Username
            <span className="opt">auto-filled · editable</span>
          </label>
          <div style={{ position:"relative" }}>
            <input
              className="finput"
              placeholder={headLoading ? "Fetching head…" : "e.g. nisarg.p"}
              value={form.proxy_user_name}
              onChange={e => set("proxy_user_name", e.target.value)}
              disabled={headLoading}
            />
            {headLoading && (
              <div style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)" }}>
                <div className="spinner" style={{ width:14, height:14, borderWidth:2 }}/>
              </div>
            )}
          </div>
          {form.proxy_user_name && !headLoading && (
            <div style={{ fontSize:11.5, color:"var(--amber2)", marginTop:4 }}>
              ⚠ Your site head will need to approve this leave.
            </div>
          )}
          {!form.proxy_user_name && !headLoading && (
            <div style={{ fontSize:11.5, color:"var(--ink3)", marginTop:4 }}>
              No head found for your site. You can enter one manually.
            </div>
          )}
        </div>
      </div>
      <div className="act-row">
        <button className="btn btn-out" onClick={()=>setForm(empty)}>Reset</button>
        <button className="btn btn-pri" onClick={submit} disabled={busy}>
          {Ico.send} {busy?"Submitting…":"Submit Application"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WEEKLY REPORT
// ═══════════════════════════════════════════════════════════════════════════════
function WeeklyReport({ user }) {
  const DAYS_FULL = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const [weekFrom, setWeekFrom] = useState("");
  const [weekTo,   setWeekTo]   = useState("");
  const [site, setSite] = useState(user.site_names?.[0] || user.site_name || "");
  const [rows,     setRows]     = useState(DAYS_FULL.map(d=>({day:d,activity:"",target:"",manpower:""})));
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState("");

  const upd = (i,k,v) => setRows(p=>p.map((r,idx)=>idx===i?{...r,[k]:v}:r));

  const submit = async () => {
    if (!weekFrom || !site) { setErr("Week starting date and site are required."); return; }
    setBusy(true); setErr("");
    const { error } = await supabase.from("reports").insert({
      user_id: user.id,
      report_type: "weekly",
      date: weekFrom,
      site,
      status: "submitted",
      data: { week_from:weekFrom, week_to:weekTo, site, rows },
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="success-state">
      <div className="success-ico">{Ico.check}</div>
      <div className="success-title">Weekly Report Submitted!</div>
      <div className="success-sub">Report saved for the selected week.</div>
      <button className="btn btn-pri" onClick={()=>setSubmitted(false)}>New Report</button>
    </div>
  );

  return (
    <div>
      {err && <div className="info-banner warn-banner" style={{marginBottom:16}}>{Ico.info} {err}</div>}
      <div className="grid2" style={{marginBottom:20}}>
        <div className="fgroup">
          <label className="flabel">Week From <span className="req">*</span></label>
          <input className="finput" type="date" value={weekFrom} onChange={e=>setWeekFrom(e.target.value)}/>
        </div>
        <div className="fgroup">
          <label className="flabel">Week To</label>
          <input className="finput" type="date" value={weekTo} onChange={e=>setWeekTo(e.target.value)}/>
        </div>
        <div className="fgroup col2">
          <label className="flabel">Site / Project <span className="req">*</span></label>
          <input className="finput" placeholder="Site name…" value={site} onChange={e=>setSite(e.target.value)}/>
        </div>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr><th>Day</th><th>Planned Activity</th><th>Target / Qty</th><th>Manpower</th></tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={r.day}>
                <td className="day-lbl">{r.day}</td>
                <td><input className="finput" style={{background:"transparent",border:"1.5px solid transparent",padding:"7px 10px"}} placeholder="Activity…" value={r.activity} onChange={e=>upd(i,"activity",e.target.value)}/></td>
                <td><input className="finput" style={{background:"transparent",border:"1.5px solid transparent",padding:"7px 10px"}} placeholder="Target…" value={r.target} onChange={e=>upd(i,"target",e.target.value)}/></td>
                <td><input className="finput" type="number" style={{background:"transparent",border:"1.5px solid transparent",padding:"7px 10px"}} placeholder="0" value={r.manpower} onChange={e=>upd(i,"manpower",e.target.value)}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="act-row">
        <button className="btn btn-out">Save Draft</button>
        <button className="btn btn-pri" onClick={submit} disabled={busy}>{Ico.send} {busy?"Submitting…":"Submit Report"}</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MONTHLY REPORT (placeholder)
// ═══════════════════════════════════════════════════════════════════════════════
function MonthlyReport() {
  return (
    <div className="empty-state" style={{padding:"80px 24px"}}>
      <div className="empty-ico" style={{width:64,height:64}}>{Ico.monthly}</div>
      <div className="empty-title" style={{fontSize:16}}>Monthly Report</div>
      <div className="empty-sub">This feature is coming soon. Monthly consolidated reports will appear here.</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function SitePortal() {
  const [user,           setUser]           = useState(null);
  const [activeTab,      setActiveTab]      = useState("clock-in");
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [expanded,       setExpanded]       = useState({ leave:true, reports:true });
  const [siteReports,    setSiteReports]    = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportTab,      setReportTab]      = useState("dpr");
  const [reportFilter,   setReportFilter]   = useState({ type:"", site:"", month:"" });


  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    return saved === "dark";
  });
  const mainRef = useRef(null);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const val = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", val);
    localStorage.setItem("theme", val);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const fetchSiteReports = useCallback(async (u) => {
    const role = u?.role?.toLowerCase().trim();
    if (!u || (role !== "project head" && role !== "site incharge")) return;
    setLoadingReports(true);

    const sites = Array.isArray(u.site_names) && u.site_names.length
      ? u.site_names
      : u.site_name ? [u.site_name] : [];

    if (!sites.length) { setLoadingReports(false); return; }

    const sitesLower = sites.map(s => s.toLowerCase().trim());

    const { data: dprData } = await supabase
      .from("dpr_reports")
      .select("id, site, engineer, report_type, date, pdf_url, payload, created_at")
      .order("created_at", { ascending: false });

    const { data: svrData } = await supabase
      .from("site_reports")
      .select("id, site_name, reporter_name, designation, visit_date, progress_of_work, quality_observations, safety_concerns, issues_concerns, site_visit_instructions, key_instructions, submitted_by_name, pdf_url, created_at")
      .order("created_at", { ascending: false });

    const normalized = [
      ...(dprData || [])
        .filter(r => sitesLower.includes((r.site || "").toLowerCase().trim()) && r.report_type !== "morning")
        .map(r => ({ ...r, source:"dpr" })),
      ...(svrData || [])
        .filter(r => sitesLower.includes((r.site_name || "").toLowerCase().trim()))
        .map(r => ({
          id: r.id, site: r.site_name, engineer: r.reporter_name,
          report_type:"site_visit", date: r.visit_date,
          pdf_url: r.pdf_url, created_at: r.created_at, source:"svr",
          progress_of_work: r.progress_of_work,
        })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setSiteReports(normalized);
    setLoadingReports(false);
  }, []);

  useEffect(() => {
    if (sidebarOpen && window.innerWidth <= 768) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      (async () => {
        const { data } = await supabase
          .from("user_details")
          .select("site_name, site_names")
          .eq("id", parsed.id)
          .single();
        if (data) {
          const updated = {
            ...parsed,
            site_name:  data.site_name  ?? parsed.site_name,
            site_names: data.site_names ?? (parsed.site_name ? [parsed.site_name] : []),
          };
          setUser(updated);
          localStorage.setItem("user", JSON.stringify(updated));
          fetchSiteReports(updated);
          // ADD inside the useEffect that fetches user data (after fetchSiteReports(updated)):
const site = updated.site_names?.[0] || updated.site_name || "";
if (site) {
  supabase
    .from("material_requirements")
    .select("id", { count: "exact", head: true })
    .eq("site_name", site)
    .eq("status", "received")
} 
        }
      })();
    }
    const onResize = () => { if (window.innerWidth <= 768) setSidebarOpen(false); };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fetchSiteReports]);

  const nav = (key) => {
    setActiveTab(key);
    if (window.innerWidth <= 768) setSidebarOpen(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
      document.body.scrollTo({ top: 0, behavior: "smooth" });
      if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
  };

  const activeItem = ALL_ITEMS.find(i=>i.key===activeTab);

  if (!user) return (
    <>
      <style>{CSS}{DARK_CSS}</style>
      <div className="loading" style={{minHeight:"100vh"}}><div className="spinner"/><span>Loading user…</span></div>
    </>
  );

  const renderContent = () => {
    switch(activeTab) {
      case "clock-in":             return <ClockInOut  user={user} supabase={supabase} />;
      case "calendar":             return <CalendarView user={user} supabase={supabase} />;
      case "my-leave":             return <MyLeave user={user} onApply={()=>nav("apply-leave")}/>;
      case "apply-leave":          return <ApplyLeave user={user}/>;
      case "daily-report":         return <DPR user={user}/>;
      case "weekly-planning":        return <WeeklyReport user={user}/>;
      case "wpr-generator":        return <WprGenerator user={user} supabase={supabase}/>;
      case "monthly-report":       return <MonthlyReport/>;
      case "site-report":          return <SiteReport user={user} />;
      case "material-requirement": return <MatRequirement user={user} />;
      case "my-reports":           return <MyReports user={user}/>;
      case "manpower-reports":     return <ManpowerReport user={user}/>;
      case "profile":              return <Profile user={user} onLogout={handleLogout} onThemeToggle={toggleTheme} isDark={isDark} />;
      case "report-submissions": {
        const role = user?.role?.toLowerCase().trim();
        if (role !== "project head" && role !== "site incharge") return null;

        const fmtD  = (d)  => d  ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";
        const fmtDT = (dt) => dt ? new Date(dt).toLocaleString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true }) : "—";

        const tabFiltered = siteReports.filter(r => {
          if (reportTab === "dpr") return r.source === "dpr" && r.report_type !== "morning";
          if (reportTab === "svr") return r.source === "svr";
          if (reportTab === "wpr") return r.source === "wpr";
          return true;
        });

        const monthFiltered = tabFiltered.filter(r => {
          if (reportFilter.site  && r.site !== reportFilter.site)                   return false;
          if (reportFilter.month && !(r.date || "").startsWith(reportFilter.month)) return false;
          return true;
        });

        const reportSites = [...new Set(siteReports.map(r => r.site).filter(Boolean))].sort();

        const grouped = {};
        monthFiltered.forEach(r => {
          const d = r.date || r.created_at?.slice(0,10) || "—";
          if (!grouped[d]) grouped[d] = [];
          grouped[d].push(r);
        });
        const sortedDates = Object.keys(grouped).sort((a,b) => b.localeCompare(a));

        const TAB_CONFIG = [
          { key:"dpr", label:"DPR", color:"#2563eb", bg:"#eff6ff", border:"#bfdbfe" },
          { key:"wpr", label:"WPR", color:"#7c3aed", bg:"#f5f3ff", border:"#e0e7ff" },
          { key:"svr", label:"SVR", color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0" },
        ];

        const DPR_TYPE_COLOR = {
          morning: { bg:"#fffbeb", color:"#d97706", border:"#fde68a" },
          evening: { bg:"#eff6ff", color:"#2563eb", border:"#bfdbfe" },
          weekly:  { bg:"#f5f3ff", color:"#7c3aed", border:"#e0e7ff" },
        };

        return (
          <div>
            {/* ── Overview banner ── */}
            <div style={{
              display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, flexWrap:"wrap",
              marginBottom:20, padding:"18px 22px", borderRadius:14,
              background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)", color:"#fff",
            }}>
              <div style={{ minWidth:200 }}>
                <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:"#93c5fd", marginBottom:6 }}>
                  Project Head Overview
                </div>
                <div style={{ fontSize:19, fontWeight:700, marginBottom:5 }}>Report Submissions</div>
                <div style={{ fontSize:12.5, color:"var(--ink3)", lineHeight:1.6, maxWidth:480 }}>
                  Daily, weekly and site visit reports submitted across{" "}
                  <strong style={{ color:"#fff" }}>
                    {(user?.site_names?.length ? user.site_names : user?.site_name ? [user.site_name] : []).join(", ") || "your sites"}
                  </strong>.
                </div>
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {[
                  { label:"DPR", count: siteReports.filter(r=>r.source==="dpr").length, color:"#60a5fa" },
                  { label:"WPR", count: siteReports.filter(r=>r.source==="wpr").length, color:"#c4b5fd" },
                  { label:"SVR", count: siteReports.filter(r=>r.source==="svr").length, color:"#86efac" },
                ].map(s => (
                  <div key={s.label} style={{
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    minWidth:64, padding:"8px 14px", borderRadius:10,
                    background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
                  }}>
                    <div style={{ fontSize:18, fontWeight:800, fontFamily:"'DM Mono',monospace", color:s.color }}>{s.count}</div>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:".08em", color:"var(--ink3)", marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tab bar ── */}
            <div style={{
              display:"inline-flex", gap:4, padding:4, borderRadius:10,
              background:"var(--paper)", border:"1px solid var(--line)", marginBottom:20,
            }}>
              {TAB_CONFIG.map(t => (
                <button key={t.key} onClick={() => setReportTab(t.key)} style={{
                  display:"flex", alignItems:"center", gap:6,
                  padding:"7px 16px", borderRadius:7,
                  fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:700,
                  border:"none", cursor:"pointer", transition:"all .15s",
                  color: reportTab === t.key ? t.color : "#64748b",
                  background: reportTab === t.key ? "var(--surface)" : "transparent",
                  boxShadow: reportTab === t.key ? "0 1px 6px rgba(0,0,0,.08)" : "none",
                }}>
                  {t.label}
                  <span style={{
                    fontSize:10, fontWeight:700, padding:"1px 6px", borderRadius:20,
                    background: reportTab === t.key ? t.bg : "#e2e8f0",
                    color: reportTab === t.key ? t.color : "#94a3b8",
                  }}>
                    {siteReports.filter(r => r.source === t.key).length}
                  </span>
                </button>
              ))}
            </div>

            {/* ── WPR empty state ── */}
            {reportTab === "wpr" && siteReports.filter(r => r.source === "wpr").length === 0 && (
              <div className="op-empty-state" style={{display:"flex",flexDirection:"column",justifyContent:"center",alignContent:"center",gap:"10px"}}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.3}}>
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                </svg>
                <p style={{fontWeight:700, color:"gray"}}>No weekly reports yet</p>
                <p style={{fontSize:12,marginTop:-4, color:"gray"}}>Weekly reports from your site(s) will appear here once submitted.</p>
              </div>
            )}

            {(reportTab !== "wpr" || siteReports.filter(r => r.source === "wpr").length > 0) ? (
              <>
                {/* ── Filters ── */}
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:18, padding:"10px 14px", background:"var(--paper)", border:"1px solid var(--line)", borderRadius:10 }}>
                  <input
                    type="month"
                    style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, background:"var(--surface)", border:"1px solid var(--line2)", color:"var(--ink)", borderRadius:6, padding:"5px 9px", height:32, cursor:"pointer", outline:"none" }}
                    value={reportFilter.month}
                    onChange={e => setReportFilter(p => ({ ...p, month:e.target.value }))}
                  />
                  {reportSites.length > 1 && (
                    <select
                      style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12.5, background:"var(--surface)", border:"1px solid var(--line2)", color:"var(--ink)", borderRadius:6, padding:"5px 9px", height:32, cursor:"pointer", outline:"none" }}
                      value={reportFilter.site}
                      onChange={e => setReportFilter(p => ({ ...p, site:e.target.value }))}
                    >
                      <option value="">All Sites</option>
                      {reportSites.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                  {Object.values(reportFilter).some(v=>v) && (
                    <button
                      onClick={() => setReportFilter({ type:"", site:"", month:"" })}
                      style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:"#dc2626", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:6, padding:"5px 11px", height:32, cursor:"pointer" }}
                    >
                      ✕ Clear
                    </button>
                  )}
                  <span style={{ marginLeft:"auto", fontSize:12, color:"var(--ink3)", alignSelf:"center" }}>
                    {monthFiltered.length} of {tabFiltered.length} reports
                  </span>
                </div>

                {/* ── Content ── */}
                {loadingReports ? (
                  <div className="op-empty-state"><div className="spinner"/><p style={{color:"gray"}}>Loading reports…</p></div>
                ) : monthFiltered.length === 0 ? (
                  <div className="op-empty-state">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.3}}>
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                    </svg>
                    <p style={{color:"gray"}}>No {reportTab.toUpperCase()} reports found{reportFilter.month ? " for this month" : ""}.</p>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
                    {sortedDates.map(date => (
                      <div key={date}>
                        <div style={{ fontSize:11, fontWeight:800, letterSpacing:".08em", textTransform:"uppercase", color:"var(--ink3)", marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
                          <span>{new Date(date+"T00:00:00").toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</span>
                          <div style={{ flex:1, height:1, background:"var(--line)" }}/>
                          <span>{grouped[date].length} report{grouped[date].length!==1?"s":""}</span>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
                          {grouped[date].map(r => {
                            const accent =
                              r.source === "svr" ? "#16a34a" :
                              r.source === "wpr" ? "#7c3aed" :
                              (DPR_TYPE_COLOR[r.report_type]?.color || "#2563eb");

                            const typeBadge =
                              r.source === "svr" ? { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0", label:"Site Visit" } :
                              r.source === "wpr" ? { bg:"#f5f3ff", color:"#7c3aed", border:"#e0e7ff", label:"Weekly Report" } :
                              r.report_type === "morning" ? { bg:"#fffbeb", color:"#d97706", border:"#fde68a", label:"Morning DPR" } :
                              r.report_type === "evening" ? { bg:"#eff6ff", color:"#2563eb", border:"#bfdbfe", label:"Evening DPR" } :
                              { bg:"#f8fafc", color:"var(--ink2)", border:"#e8edf3", label: r.report_type || "Report" };

                            return (
                              <div key={r.id} style={{ background:"var(--surface)", border:"1px solid var(--line)", borderLeft:`4px solid ${accent}`, borderRadius:10, padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
                                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                                  <span style={{ display:"inline-flex", alignItems:"center", fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20, background:typeBadge.bg, color:typeBadge.color, border:`1px solid ${typeBadge.border}` }}>
                                    {typeBadge.label}
                                  </span>
                                  {r.site && <span style={{ fontSize:11, color:"var(--ink3)", fontWeight:600, textAlign:"right" }}>{r.site}</span>}
                                </div>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                  <span style={{ fontSize:13, fontWeight:600, color:"var(--ink)" }}>{r.engineer}</span>
                                </div>
                                {r.source === "wpr" && r.week_end && (
                                  <div style={{ fontSize:11.5, color:"var(--ink2)", display:"flex", alignItems:"center", gap:5 }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    {fmtD(r.week_start)} → {fmtD(r.week_end)}
                                  </div>
                                )}
                                {r.source === "svr" && r.progress_of_work && (
                                  <p style={{ fontSize:12, color:"var(--ink2)", lineHeight:1.5, margin:0, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                                    {r.progress_of_work}
                                  </p>
                                )}
                                {r.source === "dpr" && r.payload?.work_done && (
                                  <p style={{ fontSize:12, color:"var(--ink2)", lineHeight:1.5, margin:0, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                                    {r.payload.work_done}
                                  </p>
                                )}
                                <div style={{ fontSize:11, color:"var(--ink3)" }}>
                                  Submitted {new Date(r.created_at).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true})}
                                </div>
                                {r.pdf_url ? (
                                  <div style={{ display:"flex", gap:8 }}>
                                    <a href={r.pdf_url} target="_blank" rel="noopener noreferrer"
                                      style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:"var(--ink2)", background:"var(--paper)", border:"1px solid var(--line2)", borderRadius:7, padding:"6px 12px", textDecoration:"none" }}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                      View
                                    </a>
                                    <a href={r.pdf_url} download
                                      style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:"#2563eb", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:7, padding:"6px 12px", textDecoration:"none" }}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                      Download
                                    </a>
                                  </div>
                                ) : (
                                  <span style={{ fontSize:11, color:"var(--ink3)", fontStyle:"italic" }}>No PDF attached</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        );
      }

      default: return null;
    }
  };

  return (
    <>
      <style>{CSS}{DARK_CSS}</style>
      <div>
        <Navbar onMenuToggle={() => setSidebarOpen(p => !p)} menuOpen={sidebarOpen} />

        <div className="body">
          {sidebarOpen && window.innerWidth<=768 && (
            <button className="sb-backdrop" onClick={() => setSidebarOpen(false)}
              onTouchMove={e => { e.preventDefault(); e.stopPropagation(); }}
              onTouchStart={e => e.stopPropagation()}
              aria-label="Close sidebar"
            />
          )}

          {/* Sidebar */}
          <aside className={`sidebar${sidebarOpen ? "" : " closed"}`}
            onTouchMove={e => e.stopPropagation()}
            onTouchStart={e => e.stopPropagation()}
          >
            <nav className="snav">
              {NAV.map(n => {
                if (!n.section) {
                  const enabled = ENABLED_TABS.has(n.key);
                  return (
                    <button
                      key={n.key}
                      className={`sni${activeTab === n.key ? " act" : ""}${enabled ? "" : " disabled"}`}
                      onClick={() => nav(n.key)}
                    >
                      {n.icon} {n.label}
                    </button>
                  );
                }
                return (
                  <div key={n.section}>
                    <div className="sgroup-hdr" onClick={() => setExpanded(p => ({ ...p, [n.section]: !p[n.section] }))}>
                      <span className="sgroup-lbl">{n.label}</span>
                      <span className={`sgroup-chev${expanded[n.section] ? " open" : ""}`}>{Ico.chev}</span>
                    </div>
                    <div className={`sgroup-kids${expanded[n.section] ? "" : " shut"}`}>
                      {n.children.map(c => {
                        const enabled = ENABLED_TABS.has(c.key);
                        return (

                        // REPLACE WITH:
                        <button key={c.key} className={`sni${activeTab === c.key ? " act" : ""}${!enabled ? " disabled" : ""}`} onClick={() => {
                            if (enabled) nav(c.key);
                          }} style={{ overflow: "visible", position: "relative" }}>
                          {c.icon} {c.label}
                        </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {(user?.role?.toLowerCase().trim() === "project head" || user?.role?.toLowerCase().trim() === "site incharge") && (
                <button
                  className={`sni${activeTab === "report-submissions" ? " act" : ""}`}
                  onClick={() => nav("report-submissions")}
                >
                  {REPORT_SUBMISSIONS_ITEM.icon}
                  {REPORT_SUBMISSIONS_ITEM.label}
                </button>
              )}
            </nav>

            {/* Settings pinned to bottom */}
            <div className="sb-bottom">
              <button
                className={`sni${activeTab === "profile" ? " act" : ""}`}
                onClick={() => nav("profile")}
                style={{ width: "100%", borderRadius: 9 }}
              >
                {Ico.settings}
                Settings &amp; Profile
              </button>
            </div>
          </aside>

          {/* Main */}
          <main className="main" ref={mainRef}>
            <div className="card">
              <div className="card-hdr">
                <div className="card-ico">{activeItem?.icon}</div>
                <span className="card-title">{activeItem?.label}</span>
              </div>
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}