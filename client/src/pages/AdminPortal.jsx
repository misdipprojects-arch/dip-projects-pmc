import { useEffect, useState, useCallback, useRef } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase";
import { useRecurringTasks } from "../hooks/useRecurringTasks";
import SiteReport from "./Sitereport";
import "./AdminPortal.css";

import { canAccessPortal, filterNav } from "../access.js"; // adjust path to where access.js lives
import { TaskForm as TaskFormWithCheckpoints, EMPTY_FORM,AudioRecorder,} from "./Taskformwithcheckpoints.jsx";

const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },

  {
    key: "assign-task",
    label: "Assign Task",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    key: "all-tasks",
    label: "All Tasks",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },

  {
    key: "recurring-tasks",
    label: "All Recurring Tasks",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
  },
  {
    key: "leave-requests",
    label: "Leave Requests",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M9 16l2 2 4-4" />
      </svg>
    ),
  },

  {
    key: "reschedule-requests",
    label: "Reschedule Requests",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    key: "add-employee",
    label: "Add Employee",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    key: "manage-employees",
    label: "Manage Employees",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "add-site",
    label: "Add Site",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="3" width="10" height="18" rx="2" />
        <path d="M8 7h2M8 11h2M8 15h2" />
        <path d="M19 8v6" />
        <path d="M16 11h6" />
      </svg>
    ),
  },
  {
    key: "manage-sites",
    label: "Manage Sites",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="7" height="16" rx="1" />
        <rect x="14" y="8" width="7" height="12" rx="1" />
        <path d="M6 8h1M6 12h1M6 16h1" />
        <path d="M17 12h1M17 16h1" />
      </svg>
    ),
  },
];

const REPORTS_NAV = [
  {
    key: "add-drawings",
    label: "Add Drawings",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="5" width="12" height="14" rx="1" />
        <path d="M6 9h6M6 12h6M6 15h4" />
        <path d="M16 16l5-5 2 2-5 5-3 1z" />
      </svg>
    ),
  },
  {
    key: "all-drawings",
    label: "All Drawings",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <path d="M3 9h18" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
        <path d="M3 15h18" />
      </svg>
    ),
  },
  {
    key: "site-report",
    label: "Site Visit Report",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    key: "my-reports",
    label: "My Reports",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9l5 5v3" />
        <polyline points="14 3 14 8 19 8" />
        <path d="M12 22l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "report-submissions",
    label: "Report Submissions",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      </svg>
    ),
  },
];
const TICKETS_NAV = [
  {
    key: "new-tickets",
    label: "New Tickets",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7z" />
        <path d="M12 7v10" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    key: "solved-ticket",
    label: "Solved Tickets",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];
const VERIFICATION_NAV = [
  {
    key: "pending-verification",
    label: "Pending Verification",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2h12" />
        <path d="M6 22h12" />
        <path d="M8 2v4l4 4 4-4V2" />
        <path d="M8 22v-4l4-4 4 4v4" />
      </svg>
    ),
  },
  {
    key: "approved-verification",
    label: "Approved Tasks",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-6" />
      </svg>
    ),
  },
  {
    key: "rejected-verification",
    label: "Rejected Tasks",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9l6 6" />
        <path d="M15 9l-6 6" />
      </svg>
    ),
  },
  {
    key: "overdue-tasks",
    label: "Overdue Tasks",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
        <path d="M19 5l2-2" />
      </svg>
    ),
  },
];
const PRIORITY_STYLES = {
  high: { bg: "#fef2f2", color: "#dc2626", dot: "#dc2626" },
  medium: { bg: "#fffbeb", color: "#d97706", dot: "#d97706" },
  low: { bg: "#f0fdf4", color: "#16a34a", dot: "#16a34a" },
};

const STATUS_STYLES = {
  pending: { bg: "#f1f5f9", color: "#64748b" },
  in_progress: { bg: "#eff6ff", color: "#2563eb" },
  completed: { bg: "#f0fdf4", color: "#16a34a" },
};

const LEAVE_STATUS_STYLES = {
  pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  approved: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  rejected: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const EMPTY_TASK_FILTERS = {
  dateFrom: "",
  dateTo: "",
  assignedTo: "",
  site: "",
  priority: "",
  status: "",
};
// ── helpers ────────────────────────────────────────────────────────────────
function daysInMonth(month) {
  return new Date(2001, parseInt(month, 10), 0).getDate();
}
function nameFor(userMap, username) {
  return (userMap && userMap[username]) || username || "—";
}
function buildAnchor(form) {
  switch (form.recurrence) {
    case "daily":
      return null;
    case "weekly":
      return String(form.anchor_weekday);
    case "monthly":
      return String(form.anchor_day);
    case "yearly":
      return `${String(form.anchor_month).padStart(2, "0")}-${String(form.anchor_month_day).padStart(2, "0")}`;
    default:
      return null;
  }
}

function anchorDescription(recurrence, anchor) {
  if (recurrence === "daily") return "every day"; // ← add this line
  if (!anchor) return null;
  switch (recurrence) {
    case "weekly":
      return `every ${WEEKDAYS[parseInt(anchor, 10)]}`;
    case "monthly":
      return `on the ${anchor}${ordinal(parseInt(anchor, 10))} of every month`;
    case "yearly": {
      const [mm, dd] = anchor.split("-");
      return `every year on ${MONTHS[parseInt(mm, 10) - 1]} ${parseInt(dd, 10)}`;
    }
    default:
      return null;
  }
}

const APPROVAL_SLOT_LABELS = {
  level: "Level Approver",
  head: "Site Head",
  admin: "Admin",
  proxy: "Proxy Approver",
};

function slotLabel(slot) {
  return APPROVAL_SLOT_LABELS[slot] || slot;
}
function ordinal(n) {
  if (n >= 11 && n <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function computeLeaveStatus(leave) {
  const storedStatus = normalizeText(leave.status);
  if (
    leave.admin_approved === false ||
    leave.proxy_approved === false ||
    storedStatus === "rejected"
  )
    return "rejected";
  const proxyDone = !leave.proxy_user_name || leave.proxy_approved === true;
  if (
    (leave.admin_approved === true || storedStatus === "approved") &&
    proxyDone
  )
    return "approved";
  return "pending";
}

function formatLeaveDate(date) {
  return date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";
}

function getLeaveDays(leave) {
  if (!leave.from_date || !leave.to_date) return null;
  return (
    Math.ceil(
      (new Date(leave.to_date) - new Date(leave.from_date)) /
        (1000 * 60 * 60 * 24),
    ) + 1
  );
}

function formatSubmissionDate(d) {
  if (!d) return "—";
  const date = String(d).includes("T")
    ? new Date(d)
    : new Date(d + "T00:00:00");
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function isOfficeDoc(url) {
  return /\.(pptx|ppt|docx|doc|xlsx|xls)(\?|$)/i.test(url || "");
}

function getViewUrl(url) {
  if (!url) return url;
  if (isOfficeDoc(url)) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
  }
  return url; // pdf, images, etc. — browser can render natively
}
function getFileExt(url) {
  if (!url) return "file";
  const clean = url.split("?")[0].split("#")[0];
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "file";
}

function buildDownloadUrl(url, filename) {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}download=${encodeURIComponent(filename || "report.pdf")}`;
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isSiteEngineerLeave(leave) {
  return [
    leave.role,
    leave.designation,
    leave.user_role,
    leave.user_designation,
  ]
    .map(normalizeText)
    .some((value) => value === "site engineer" || value === "site_engineer");
}

function getHeadApprovalText(leave) {
  const storedStatus = normalizeText(leave.status);
  const headName = leave.proxy_user_name || leave.head_user_names;
  if (leave.proxy_approved === true || storedStatus === "approved")
    return "Head: Approved";
  if (leave.proxy_approved === false || storedStatus === "rejected")
    return "Head: Rejected";
  return headName ? `Head (${headName}): Pending` : "Head: Pending";
}

function getHeadApprovalClass(leave) {
  const storedStatus = normalizeText(leave.status);
  if (leave.proxy_approved === true || storedStatus === "approved") return "ok";
  if (leave.proxy_approved === false || storedStatus === "rejected")
    return "no";
  return "";
}

function isFinalLeaveStatus(leave) {
  const storedStatus = normalizeText(leave.status);
  return storedStatus === "approved" || storedStatus === "rejected";
}
function applySubmissionFilters(rows, filters) {
  return rows.filter((r) => {
    if (filters.site && r.site !== filters.site) return false;
    if (filters.engineer && r.engineer !== filters.engineer) return false;
    if (filters.reportType && r.source !== filters.reportType) return false;
    if (filters.dateFrom && r.date && r.date < filters.dateFrom) return false;
    if (filters.dateTo && r.date && r.date > filters.dateTo) return false;
    return true;
  });
}
function applyTaskFilters(tasks, filters) {
  return tasks.filter((t) => {
    if (filters.assignedTo && t.assigned_to !== filters.assignedTo)
      return false;
    if (filters.site && t.site_name !== filters.site) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.dateFrom && t.due_date && t.due_date < filters.dateFrom)
      return false;
    if (filters.dateTo && t.due_date && t.due_date > filters.dateTo)
      return false;
    return true;
  });
}

function getNextDueDate(currentDue, recurrence) {
  const base = currentDue ? new Date(currentDue + "T00:00:00") : new Date();
  switch ((recurrence || "").toLowerCase()) {
    case "daily": base.setDate(base.getDate() + 1); break;
    case "weekly": base.setDate(base.getDate() + 7); break;
    case "monthly": base.setMonth(base.getMonth() + 1); break;
    default: base.setDate(base.getDate() + 1);
  }
  return base.toISOString().split("T")[0];
}

async function spawnNextRecurringInstance(task, nextDue) {
  const { data: newTask, error } = await supabase
    .from("tasks")
    .insert([{
      title: task.title,
      description: task.description || null,
      assigned_to: task.assigned_to,
      assigned_by: task.assigned_by || null,
      site_name: task.site_name || null,
      priority: task.priority || "medium",
      status: "pending",
      is_recurring: true,
      recurrence: task.recurrence,
      due_date: nextDue,
      audio_url: task.audio_url || null,
      document_url: task.document_url || null,
      has_checkpoints: task.has_checkpoints || false,
      reschedule_allowed: task.reschedule_allowed || false,
      parent_task_id: task.parent_task_id || task.id,
      recurrence_anchor: task.recurrence_anchor || task.due_date || nextDue,
      last_generated_date: nextDue,
    }])
    .select()
    .single();
  return { error, task: newTask };
}

function toDateStr(d) {
  if (!d) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatNextDue(date) {
  if (!date) return "—";

  const dueDate = date instanceof Date ? date : new Date(date);

  if (isNaN(dueDate)) return "—";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diff = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

  const label = dueDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (diff === 0)
    return { label, badge: "Today", color: "#dc2626", bg: "#fef2f2" };

  if (diff === 1)
    return { label, badge: "Tomorrow", color: "#d97706", bg: "#fffbeb" };

  if (diff <= 7 && diff > 1)
    return {
      label,
      badge: `In ${diff} days`,
      color: "#2563eb",
      bg: "#eff6ff",
    };

  return { label, badge: null };
} 
function EmployeeFilterBar({
  filters,
  onChange,
  onClear,
  employees,
  sites,
  inline,
  mobileOpen,
  onMobileToggle,
}) {
  const isActive = Object.values(filters).some((v) => v !== "");

  const empSiteNames = (emp) =>
    emp.site_names?.length
      ? emp.site_names
      : emp.site_name
        ? [emp.site_name]
        : [];

  // Names available given the current site filter (but ignoring name filter itself)
  const namesFiltered = employees.filter((emp) =>
    filters.site ? empSiteNames(emp).includes(filters.site) : true,
  );
  const names = [
    ...new Set(namesFiltered.map((e) => e.name).filter(Boolean)),
  ].sort();

  // Sites available given the current name filter (but ignoring site filter itself)
  const sitesFiltered = employees.filter((emp) =>
    filters.name ? emp.name === filters.name : true,
  );
  const siteNames = [
    ...new Set(
      sitesFiltered.flatMap((emp) => empSiteNames(emp)).filter(Boolean),
    ),
  ].sort();

  const fields = (
    <>
      <div className="tf-group">
        <span className="tf-label">Name</span>
        <select
          className="tf-select"
          value={filters.name}
          onChange={(e) => onChange("name", e.target.value)}
        >
          <option value="">All names</option>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="tf-divider" />
      <div className="tf-group">
        <span className="tf-label">Site</span>
        <select
          className="tf-select"
          value={filters.site}
          onChange={(e) => onChange("site", e.target.value)}
        >
          <option value="">All sites</option>
          {siteNames.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {isActive && (
        <button className="tf-clear" onClick={onClear}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear
        </button>
      )}
    </>
  );

  if (inline) {
    return (
      <>
        <div className="tf-bar-inline">{fields}</div>
        <div
          style={{ position: "relative", marginLeft: "auto", flexShrink: 0 }}
        >
          <button
            className={`tf-mobile-btn${mobileOpen ? " Active" : ""}`}
            onClick={onMobileToggle}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            {isActive && <span className="tf-mobile-badge" />}
          </button>
          {mobileOpen && (
            <div className="tf-popup">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fields}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return <div className="tf-bar tf-bar-fixed">{fields}</div>;
}

function SiteFilterBar({
  filters,
  onChange,
  onClear,
  employees,
  sites,
  inline,
  mobileOpen,
  onMobileToggle,
}) {
  const isActive = Object.values(filters).some((v) => v !== "");
  const siteNames = [
    ...new Set((sites || []).map((s) => s.site_name).filter(Boolean)),
  ].sort();

  const fields = (
    <>
      <div className="tf-group">
        <span className="tf-label">Site</span>
        <select
          className="tf-select"
          value={filters.site}
          onChange={(e) => onChange("site", e.target.value)}
        >
          <option value="">All sites</option>
          {siteNames.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="tf-divider" />
      <div className="tf-group">
        <span className="tf-label">Assigned User</span>
        <select
          className="tf-select"
          value={filters.assignedUser}
          onChange={(e) => onChange("assignedUser", e.target.value)}
        >
          <option value="">All users</option>
          {employees.map((e) => (
            <option key={e.username} value={e.username}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      {isActive && (
        <button className="tf-clear" onClick={onClear}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear
        </button>
      )}
    </>
  );

  if (inline) {
    return (
      <>
        <div className="tf-bar-inline">{fields}</div>
        <div
          style={{ position: "relative", marginLeft: "auto", flexShrink: 0 }}
        >
          <button
            className={`tf-mobile-btn${mobileOpen ? " Active" : ""}`}
            onClick={onMobileToggle}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            {isActive && <span className="tf-mobile-badge" />}
          </button>
          {mobileOpen && (
            <div className="tf-popup">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fields}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return <div className="tf-bar tf-bar-fixed">{fields}</div>;
}
function SubmissionFilterBar({
  filters,
  onChange,
  onClear,
  rows,
  inline,
  mobileOpen,
  onMobileToggle,
}) {
  const sitesFiltered = applySubmissionFilters(rows, { ...filters, site: "" });
  const engineersFiltered = applySubmissionFilters(rows, {
    ...filters,
    engineer: "",
  });
  const typesFiltered = applySubmissionFilters(rows, {
    ...filters,
    reportType: "",
  });

  const sites = [
    ...new Set(sitesFiltered.map((r) => r.site).filter(Boolean)),
  ].sort();
  const engineers = [
    ...new Set(engineersFiltered.map((r) => r.engineer).filter(Boolean)),
  ].sort();
  const types = [
    ...new Set(typesFiltered.map((r) => r.source).filter(Boolean)),
  ].sort();

  const isActive = Object.values(filters).some((v) => v !== "");

  const fields = (
    <>
      <div className="tf-group">
        <span className="tf-label">Site</span>
        <select
          className="tf-select"
          value={filters.site}
          onChange={(e) => onChange("site", e.target.value)}
        >
          <option value="">All sites</option>
          {sites.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="tf-divider" />
      <div className="tf-group">
        <span className="tf-label">Engineer</span>
        <select
          className="tf-select"
          value={filters.engineer}
          onChange={(e) => onChange("engineer", e.target.value)}
        >
          <option value="">All engineers</option>
          {engineers.map((e2) => (
            <option key={e2} value={e2}>
              {e2}
            </option>
          ))}
        </select>
      </div>
      <div className="tf-divider" />
      <div className="tf-group">
        <span className="tf-label">Type</span>
        <select
          className="tf-select"
          value={filters.reportType}
          onChange={(e) => onChange("reportType", e.target.value)}
        >
          <option value="">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="tf-divider" />
      <div className="tf-group">
        <span className="tf-label">Date</span>
        <input
          className="tf-input tf-date"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange("dateFrom", e.target.value)}
        />
        <span className="tf-sep-text">–</span>
        <input
          className="tf-input tf-date"
          type="date"
          value={filters.dateTo}
          min={filters.dateFrom}
          onChange={(e) => onChange("dateTo", e.target.value)}
        />
      </div>
      {isActive && (
        <button className="tf-clear" onClick={onClear}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear
        </button>
      )}
    </>
  );

  if (inline) {
    return (
      <>
        <div className="tf-bar-inline">{fields}</div>
        <div
          style={{ position: "relative", marginLeft: "auto", flexShrink: 0 }}
        >
          <button
            className={`tf-mobile-btn${mobileOpen ? " Active" : ""}`}
            onClick={onMobileToggle}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            {isActive && <span className="tf-mobile-badge" />}
          </button>
          {mobileOpen && (
            <div className="tf-popup">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fields}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return <div className="tf-bar tf-bar-fixed">{fields}</div>;
}
function LeaveFilterBar({
  filters,
  onChange,
  onClear,
  leaves,
  inline,
  mobileOpen,
  onMobileToggle,
}) {
  const isActive = Object.values(filters).some((v) => v !== "");
  const names = [
    ...new Set(leaves.map((l) => l.name || l.user_name).filter(Boolean)),
  ].sort();

  const fields = (
    <>
      <div className="tf-group">
        <span className="tf-label">Name</span>
        <select
          className="tf-select"
          value={filters.name}
          onChange={(e) => onChange("name", e.target.value)}
        >
          <option value="">All names</option>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="tf-divider" />
      <div className="tf-group">
        <span className="tf-label">Date</span>
        <input
          className="tf-input tf-date"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange("dateFrom", e.target.value)}
          title="From"
        />
        <span className="tf-sep-text">–</span>
        <input
          className="tf-input tf-date"
          type="date"
          value={filters.dateTo}
          min={filters.dateFrom}
          onChange={(e) => onChange("dateTo", e.target.value)}
          title="To"
        />
      </div>
      {isActive && (
        <button className="tf-clear" onClick={onClear}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear
        </button>
      )}
    </>
  );

  if (inline) {
    return (
      <>
        <div className="tf-bar-inline">{fields}</div>
        <div
          style={{ position: "relative", marginLeft: "auto", flexShrink: 0 }}
        >
          <button
            className={`tf-mobile-btn${mobileOpen ? " Active" : ""}`}
            onClick={onMobileToggle}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            {isActive && <span className="tf-mobile-badge" />}
          </button>
          {mobileOpen && (
            <div className="tf-popup">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fields}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return <div className="tf-bar tf-bar-fixed">{fields}</div>;
}
function RescheduleFilterBar({
  filters,
  onChange,
  onClear,
  reschedules,
  userMap,
  inline,
  mobileOpen,
  onMobileToggle,
}) {
  const isActive = Object.values(filters).some((v) => v !== "");
  const names = [
    ...new Set(
      reschedules.map((r) => nameFor(userMap, r.requested_by)).filter(Boolean),
    ),
  ].sort();

  const fields = (
    <>
      <div className="tf-group">
        <span className="tf-label">Name</span>
        <select
          className="tf-select"
          value={filters.name}
          onChange={(e) => onChange("name", e.target.value)}
        >
          <option value="">All names</option>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="tf-divider" />
      <div className="tf-group">
        <span className="tf-label">Status</span>
        <select
          className="tf-select"
          value={filters.status}
          onChange={(e) => onChange("status", e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {isActive && (
        <button className="tf-clear" onClick={onClear}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear
        </button>
      )}
    </>
  );

  if (inline) {
    return (
      <>
        <div className="tf-bar-inline">{fields}</div>
        <div
          style={{ position: "relative", marginLeft: "auto", flexShrink: 0 }}
        >
          <button
            className={`tf-mobile-btn${mobileOpen ? " Active" : ""}`}
            onClick={onMobileToggle}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            {isActive && <span className="tf-mobile-badge" />}
          </button>
          {mobileOpen && (
            <div className="tf-popup">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fields}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return <div className="tf-bar tf-bar-fixed">{fields}</div>;
}
// ── Task Filter Bar ────────────────────────────────────────────────────────
function TaskFilterBar({
  filters,
  onChange,
  onClear,
  sites,
  priorities,
  statuses,
  assignees,
  inline,
  mobileOpen,
  onMobileToggle,
}) {
  const isActive = Object.values(filters).some((v) => v !== "");

  const fields = (
    <>
      <div className="tf-group">
        <span className="tf-label">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Due
        </span>
        <input
          className="tf-input tf-date"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange("dateFrom", e.target.value)}
          title="From"
        />
        <span className="tf-sep-text">–</span>
        <input
          className="tf-input tf-date"
          type="date"
          value={filters.dateTo}
          min={filters.dateFrom}
          onChange={(e) => onChange("dateTo", e.target.value)}
          title="To"
        />
      </div>
      <div className="tf-divider" />
      <div className="tf-group">
        <span className="tf-label">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </span>
        <select
          className="tf-select"
          value={filters.assignedTo}
          onChange={(e) => onChange("assignedTo", e.target.value)}
        >
          <option value="">All users</option>
          {assignees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      {sites.length > 0 && (
        <>
          <div className="tf-divider" />
          <div className="tf-group">
            <select
              className="tf-select"
              value={filters.site}
              onChange={(e) => onChange("site", e.target.value)}
            >
              <option value="">All sites</option>
              {sites.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      <div className="tf-divider" />
      <div className="tf-group">
        <select
          className="tf-select"
          value={filters.priority}
          onChange={(e) => onChange("priority", e.target.value)}
        >
          <option value="">All priorities</option>
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="tf-divider" />
      <div className="tf-group">
        <select
          className="tf-select"
          value={filters.status}
          onChange={(e) => onChange("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>
      {isActive && (
        <button className="tf-clear" onClick={onClear}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear
        </button>
      )}
    </>
  );

  if (inline) {
    return (
      <>
        <div className="tf-bar-inline">{fields}</div>
        <div
          style={{ position: "relative", marginLeft: "auto", flexShrink: 0 }}
        >
          <button
            className={`tf-mobile-btn${mobileOpen ? " Active" : ""}`}
            onClick={onMobileToggle}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            {isActive && <span className="tf-mobile-badge" />}
          </button>
          {mobileOpen && (
            <div className="tf-popup">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {fields}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return <div className="tf-bar tf-bar-fixed">{fields}</div>;
}
// ── sub-components ─────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent }) {
  return (
    <div className="ap-stat-card" style={{ borderTopColor: accent }}>
      <div
        className="ap-stat-icon"
        style={{ background: accent + "18", color: accent }}
      >
        {icon}
      </div>
      <div className="ap-stat-body">
        <div className="ap-stat-value">{value}</div>
        <div className="ap-stat-label">{label}</div>
      </div>
    </div>
  );
}

function TaskRow({ task, onDelete, userMap, onClick }) {
  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const s = STATUS_STYLES[task.status] || STATUS_STYLES.pending;
  return (
    <tr
      className="ap-tr"
      onClick={() => onClick?.(task)}
      style={{ cursor: "pointer" }}
    >
      <td className="ap-td ap-td-title">
        {task.parent_task_id && (
          <span className="ap-child-badge" title="Auto-generated instance">
            ↳
          </span>
        )}
        {task.title}
        <div
          style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}
        >
          {task.audio_url && (
            <a
              href={task.audio_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: "#7c3aed",
                background: "#f5f3ff",
                border: "1px solid #ddd6fe",
                borderRadius: 5,
                padding: "2px 7px",
                textDecoration: "none",
              }}
              title="Play audio instruction"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              Audio
            </a>
          )}
          {task.document_url && (
            <a
              href={task.document_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: "#0369a1",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 5,
                padding: "2px 7px",
                textDecoration: "none",
              }}
              title="View document"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Doc
            </a>
          )}
        </div>
      </td>
      <td className="ap-td">{nameFor(userMap, task.assigned_to)}</td>
      <td className="ap-td">{task.site_name || "—"}</td>
      <td className="ap-td">{nameFor(userMap, task.assigned_by)}</td>
      <td className="ap-td">
        <span className="ap-badge" style={{ background: p.bg, color: p.color }}>
          <span className="ap-badge-dot" style={{ background: p.dot }} />
          {task.priority}
        </span>
      </td>
      <td className="ap-td">
        <span className="ap-badge" style={{ background: s.bg, color: s.color }}>
          {task.status?.replace("_", " ")}
        </span>
      </td>
      <td className="ap-td">
        {task.hours_to_complete ? `${task.hours_to_complete} hrs` : "—"}
      </td>
      <td className="ap-td">
        {task.due_date
          ? new Date(task.due_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </td>
      <td className="ap-td">
        {task.is_recurring ? (
          <span className="ap-pill-blue">
            {anchorDescription(task.recurrence, task.recurrence_anchor) ||
              task.recurrence}
          </span>
        ) : task.parent_task_id ? (
          <span className="ap-pill-orange">instance</span>
        ) : (
          <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>
        )}
      </td>
      <td className="ap-td" onClick={(e) => e.stopPropagation()}>
        <button
          className="ap-del-btn"
          onClick={() => onDelete(task.id)}
          title="Delete"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </td>
    </tr>
  );
}

function RecurringTaskCard({ task, next, p, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="ap-task-card-mobile"
      onClick={() => setExpanded((e) => !e)}
      style={{ cursor: "pointer" }}
    >
      {/* Compact header — always visible */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="ap-task-card-title" style={{ marginBottom: 5 }}>
            {task.title}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              alignItems: "center",
            }}
          >
            <span
              className="ap-badge"
              style={{ background: p.bg, color: p.color }}
            >
              <span className="ap-badge-dot" style={{ background: p.dot }} />
              {task.priority}
            </span>
            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
              {task.assigned_to}
            </span>
            {next?.label && (
              <span
                style={{ fontSize: 11.5, color: "#64748b", marginLeft: "auto" }}
              >
                {next.label}
                {next.badge && (
                  <span
                    style={{
                      marginLeft: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      background: next.bg,
                      color: next.color,
                      borderRadius: 20,
                      padding: "1px 5px",
                    }}
                  >
                    {next.badge}
                  </span>
                )}
              </span>
            )}
          </div>
          {(task.audio_url || task.document_url) && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontSize: 10.5,
                fontWeight: 600,
                color: "#94a3b8",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: 4,
                padding: "1px 5px",
                marginTop: 5,
              }}
            >
              📎{" "}
              {[task.audio_url && "audio", task.document_url && "doc"]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            className="ap-del-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Delete"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
          <button
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            paddingTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div className="ap-task-card-badges">
            <span className="ap-pill-blue">
              {anchorDescription(task.recurrence, task.recurrence_anchor) ||
                task.recurrence}
            </span>
          </div>
          <div className="ap-task-card-meta">
            <div>
              <span>Site</span>
              <strong>{task.site_name || "Not assigned"}</strong>
            </div>
            <div>
              <span>Next Due</span>
              <strong>
                {next?.label || "—"}
                {next?.badge && (
                  <span
                    style={{
                      marginLeft: 5,
                      fontSize: 10,
                      fontWeight: 700,
                      background: next.bg,
                      color: next.color,
                      borderRadius: 20,
                      padding: "1px 6px",
                    }}
                  >
                    {next.badge}
                  </span>
                )}
              </strong>
            </div>
          </div>
          {task.description && (
            <div
              style={{
                fontSize: 12.5,
                color: "#64748b",
                background: "#f8fafc",
                borderRadius: 6,
                padding: "8px 10px",
                borderLeft: "3px solid #e2e8f0",
                lineHeight: 1.5,
              }}
            >
              {task.description}
            </div>
          )}
          {(task.audio_url || task.document_url) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {task.audio_url && (
                <a
                  href={task.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#7c3aed",
                    background: "#f5f3ff",
                    border: "1px solid #ddd6fe",
                    borderRadius: 7,
                    padding: "6px 12px",
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Audio Instruction
                </a>
              )}
              {task.document_url && (
                <a
                  href={task.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#0369a1",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: 7,
                    padding: "6px 12px",
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Document
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function TaskCard({ task, onDelete, onOpenDetail }) {
  const [expanded, setExpanded] = useState(false);
  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const s = STATUS_STYLES[task.status] || STATUS_STYLES.pending;

  return (
    <div className="ap-task-card-mobile">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{ flex: 1, minWidth: 0 }}
          onClick={() => onOpenDetail?.(task)}
          style={{ cursor: "pointer" }}
        >
          <div className="ap-task-card-title" style={{ marginBottom: 5 }}>
            {task.parent_task_id && <span className="ap-child-badge">↳</span>}
            {task.title}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 5,
              alignItems: "center",
            }}
          >
            <span
              className="ap-badge"
              style={{ background: p.bg, color: p.color }}
            >
              <span className="ap-badge-dot" style={{ background: p.dot }} />
              {task.priority}
            </span>
            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
              {task.assigned_to || "Unassigned"}
            </span>
            {task.due_date && (
              <span
                style={{ fontSize: 11.5, color: "#64748b", marginLeft: "auto" }}
              >
                {new Date(task.due_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
            {(task.audio_url || task.document_url) && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "#94a3b8",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 4,
                  padding: "1px 5px",
                }}
              >
                📎{" "}
                {[task.audio_url && "audio", task.document_url && "doc"]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            className="ap-del-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Delete"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
          <button
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
              transition: "transform .2s",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            paddingTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div className="ap-task-card-badges">
            <span
              className="ap-badge"
              style={{ background: s.bg, color: s.color }}
            >
              {task.status?.replace("_", " ")}
            </span>
            {task.is_recurring ? (
              <span className="ap-pill-blue">
                {anchorDescription(task.recurrence, task.recurrence_anchor) ||
                  task.recurrence}
              </span>
            ) : task.parent_task_id ? (
              <span className="ap-pill-orange">instance</span>
            ) : (
              <span className="ap-mobile-pill-muted">one-time</span>
            )}
          </div>
          <div className="ap-task-card-meta">
            <div>
              <span>Site</span>
              <strong>{task.site_name || "Not assigned"}</strong>
            </div>
            <div>
              <span>Hours to Complete</span>
              <strong>
                {task.hours_to_complete
                  ? `${task.hours_to_complete} hrs`
                  : "Not set"}
              </strong>
            </div>
            <div>
              <span>Due Date</span>
              <strong>
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not set"}
              </strong>
            </div>
          </div>
          {task.description && (
            <div
              style={{
                fontSize: 12.5,
                color: "#64748b",
                background: "#f8fafc",
                borderRadius: 6,
                padding: "8px 10px",
                borderLeft: "3px solid #e2e8f0",
                lineHeight: 1.5,
              }}
            >
              {task.description}
            </div>
          )}
          {(task.audio_url || task.document_url) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {task.audio_url && (
                <a
                  href={task.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#7c3aed",
                    background: "#f5f3ff",
                    border: "1px solid #ddd6fe",
                    borderRadius: 7,
                    padding: "6px 12px",
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Audio Instruction
                </a>
              )}
              {task.document_url && (
                <a
                  href={task.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#0369a1",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: 7,
                    padding: "6px 12px",
                    textDecoration: "none",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Document
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function formatAuditEntries(value, roleByName = {}) {
  if (value == null || value === "") return null;

  const renderEntry = (entry, key) => {
    if (typeof entry === "string") return <div key={key}>{entry}</div>;
    const { by, slot, reason, at } = entry || {};
    const dateStr = at
      ? new Date(at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;
    const roleLabel = roleByName[by];
    return (
      <div key={key} style={{ marginBottom: 6 }}>
        <strong>{by || "Unknown"}</strong>
        {roleLabel ? (
          <span style={{ color: "#94a3b8" }}> ({roleLabel})</span>
        ) : slot ? (
          <span style={{ color: "#94a3b8" }}> ({slotLabel(slot)})</span>
        ) : null}
        {reason && <>: {reason}</>}
        {dateStr && (
          <span style={{ color: "#94a3b8", fontSize: 11 }}> — {dateStr}</span>
        )}
      </div>
    );
  };

  // already a plain string — could be plain text, or a stringified JSON array
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return <>{parsed.map((entry, i) => renderEntry(entry, i))}</>;
      }
      if (parsed && typeof parsed === "object")
        return renderEntry(parsed, "single");
    } catch {
      return value;
    }
    return value;
  }

  if (Array.isArray(value)) {
    return <>{value.map((entry, i) => renderEntry(entry, i))}</>;
  }

  if (typeof value === "object") {
    return renderEntry(value, "single");
  }

  return String(value);
}
function displayReason(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return (
      <>
        {value.reason}
        {value.by && (
          <span style={{ color: "#94a3b8" }}> — requested by {value.by}</span>
        )}
      </>
    );
  }
  return "";
}
function LeaveStatusBadge({ leave }) {
  const status = computeLeaveStatus(leave);
  const style = LEAVE_STATUS_STYLES[status];
  return (
    <span
      className="ap-leave-status"
      style={{
        background: style.bg,
        color: style.color,
        borderColor: style.border,
      }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function VerificationCard({
  verification, task, userMap, onComplete, onCorrect, updatingId, currentUser,
}) {
  const isPending = verification.status === "pending";
  const canAct = isPending && verification.verifier === currentUser;
  const isCompleted = verification.status === "completed";
  const isCorrection = verification.status === "correction_sent";

  const p = task
    ? PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
    : null;
  const s = task ? STATUS_STYLES[task.status] || STATUS_STYLES.pending : null;

  const statusColor = isCompleted
    ? "#16a34a"
    : isCorrection
      ? "#dc2626"
      : "#f59e0b";

  return (
    <div className="ap-leave-card" style={{ borderLeftColor: statusColor }}>
      <div className="ap-leave-card-top">
        <div>
          <div className="ap-leave-title">
            {task?.title || verification.task_title || "Untitled task"}
          </div>
          <div className="ap-leave-sub">
            Sent by{" "}
            <strong>{verification.sent_by_name || verification.sent_by}</strong>
            {verification.site_name ? ` · ${verification.site_name}` : ""}
          </div>
        </div>
        <span
          className="ap-leave-status"
          style={{
            background: isCompleted
              ? "#f0fdf4"
              : isCorrection
                ? "#fef2f2"
                : "#fffbeb",
            color: statusColor,
            borderColor: isCompleted
              ? "#bbf7d0"
              : isCorrection
                ? "#fecaca"
                : "#fde68a",
          }}
        >
          {isCompleted
            ? "Completed"
            : isCorrection
              ? "Correction Sent"
              : "Pending"}
        </span>
      </div>

      {task && (
        <>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              margin: "8px 0",
            }}
          >
            {p && (
              <span
                className="ap-badge"
                style={{ background: p.bg, color: p.color }}
              >
                <span className="ap-badge-dot" style={{ background: p.dot }} />
                {task.priority}
              </span>
            )}
            {s && (
              <span
                className="ap-badge"
                style={{ background: s.bg, color: s.color }}
              >
                {task.status?.replace("_", " ")}
              </span>
            )}
            {task.hours_to_complete && (
              <span className="ap-pill-blue">{task.hours_to_complete} hrs</span>
            )}
          </div>

          <div className="ap-leave-meta">
            <span>Assigned to: {nameFor(userMap, task.assigned_to)}</span>
            {task.due_date && (
              <span>
                Due:{" "}
                {new Date(task.due_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          {task.description && (
            <p className="ap-leave-reason">{task.description}</p>
          )}

          {(task.audio_url || task.document_url) && (
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 6,
              }}
            >
              {task.audio_url && (
                
                <a  href={task.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#7c3aed",
                    background: "#f5f3ff",
                    border: "1px solid #ddd6fe",
                    borderRadius: 6,
                    padding: "3px 9px",
                    textDecoration: "none",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  <span>Original audio</span>
                </a>
              )}
              {task.document_url && (
                
                <a  href={task.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#0369a1",
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: 6,
                    padding: "3px 9px",
                    textDecoration: "none",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Original document</span>
                </a>
              )}
            </div>
          )}
        </>
      )}

      {verification.document_urls?.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>
            VERIFICATION ATTACHMENTS
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {verification.document_urls.map((url, i) => (
              
              <a  key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#475569",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding: "3px 9px",
                  textDecoration: "none",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>File {i + 1}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {isCorrection && (
        <div className="lv-rejection" style={{ marginTop: 8 }}>
          <strong>Correction sent:</strong> {verification.correction_note}
          {(verification.correction_audio_url ||
            verification.correction_document_urls?.length > 0) && (
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 6,
              }}
            >
              {verification.correction_audio_url && (
                
                <a  href={verification.correction_audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#7c3aed" }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  <span>Correction audio</span>
                </a>
              )}
              {verification.correction_document_urls?.map((url, i) => (
                
                <a  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#2563eb" }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>Correction doc {i + 1}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      {isPending ? (
  canAct ? (
    <div className="ap-leave-actions">
      <button className="ap-btn-approve" disabled={updatingId === verification.id}
        onClick={() => onComplete(verification)}>
        Mark Completed
      </button>
      <button className="ap-btn-reject" disabled={updatingId === verification.id}
        onClick={() => onCorrect(verification)}>
        Send Correction
      </button>
      {updatingId === verification.id && <span className="ap-saving">saving...</span>}
    </div>
  ) : (
    <div className="ap-leave-done">
      Waiting on {verification.verifier_name || verification.verifier} to review this.
    </div>
  )
) : (
  <div className="ap-leave-done">
    {isCompleted ? "✓ Marked completed" : "✗ Correction sent back"} by{" "}
    {verification.resolved_by}
  </div>
)}
    </div>
  );
}

function LeaveRequestCard({ leave, onAction, updating, roleByName }) {
  const status = computeLeaveStatus(leave);
  const days = getLeaveDays(leave);
  const managedByHead = isSiteEngineerLeave(leave);
  const canAct =
    !managedByHead &&
    (leave.admin_approved === null || leave.admin_approved === undefined) &&
    !isFinalLeaveStatus(leave);

  return (
    <div
      className="ap-leave-card"
      style={{
        borderLeftColor:
          status === "approved"
            ? "#16a34a"
            : status === "rejected"
              ? "#dc2626"
              : "#f59e0b",
      }}
    >
      <div className="ap-leave-card-top">
        <div>
          <div className="ap-leave-title">
            {leave.name || leave.user_name || "Employee"}
          </div>
          <div className="ap-leave-sub">
            {leave.user_name || "No username"}
            {leave.site_name ? ` - ${leave.site_name}` : ""}
          </div>
        </div>
        <LeaveStatusBadge leave={leave} />
      </div>
      <div className="ap-leave-meta">
        {(leave.role || leave.designation) && (
          <span>{leave.role || leave.designation}</span>
        )}
        <span>{leave.leave_type || "Leave"}</span>
        <span>
          {formatLeaveDate(leave.from_date)} to {formatLeaveDate(leave.to_date)}
        </span>
        {days && (
          <span>
            {days} day{days > 1 ? "s" : ""}
          </span>
        )}
      </div>
      {leave.reason && (
        <p className="ap-leave-reason">
          {formatAuditEntries(leave.reason, roleByName)}
        </p>
      )}
      <div className="ap-leave-approvals">
        {managedByHead ? (
          <span className={`ap-approval-pill ${getHeadApprovalClass(leave)}`}>
            {getHeadApprovalText(leave)}
          </span>
        ) : (
          <>
            {leave.admin_approved === true && (
              <span className="ap-approval-pill ok">Admin: Approved</span>
            )}
            {leave.admin_approved === false && (
              <span className="ap-approval-pill no">Admin: Rejected</span>
            )}
            {leave.proxy_user_name ? (
              <span
                className={`ap-approval-pill ${leave.proxy_approved === true ? "ok" : leave.proxy_approved === false ? "no" : ""}`}
              >
                Proxy ({leave.proxy_user_name}):{" "}
                {leave.proxy_approved === true
                  ? "Accepted"
                  : leave.proxy_approved === false
                    ? "Declined"
                    : "Pending"}
              </span>
            ) : leave.admin_approved === null ||
              leave.admin_approved === undefined ? (
              <span className="ap-approval-pill">Admin: Pending</span>
            ) : null}
          </>
        )}
      </div>
      {leave.rejection_reason && (
        <div className="lv-rejection">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <strong>Rejected:</strong>{" "}
          {formatAuditEntries(leave.rejection_reason, roleByName)}
        </div>
      )}
      {canAct ? (
        <div className="ap-leave-actions">
          <button
            className="ap-btn-approve"
            disabled={updating === leave.id}
            onClick={() => onAction(leave, true)}
          >
            Approve
          </button>
          <button
            className="ap-btn-reject"
            disabled={updating === leave.id}
            onClick={() => onAction(leave, false)}
          >
            Reject
          </button>
          {updating === leave.id && (
            <span className="ap-saving">saving...</span>
          )}
        </div>
      ) : managedByHead ? (
        <div className="ap-leave-done">
          Managed by site head - admin can view status only.
        </div>
      ) : (
        <div className="ap-leave-done">Admin decision already submitted.</div>
      )}
    </div>
  );
}

// ── Shared task form JSX (used in both assign-task tab and modal) ───────────
function TaskForm({
  form,
  handleFormChange,
  setForm,
  handleSubmit,
  submitting,
  onSuccess,
  employees,
  sites = [],
}) {
  const liveAnchor = form.is_recurring ? buildAnchor(form) : null;
  const anchorPreview =
    form.is_recurring && form.recurrence
      ? anchorDescription(form.recurrence, liveAnchor)
      : null;
  const monthDays = daysInMonth(form.anchor_month);

  return (
    <div className="ap-form-grid">
      <div className="ap-field">
        <label className="ap-label">
          Assign To <span className="ap-req">*</span>
        </label>
        <select
          className="ap-input ap-select"
          name="assigned_to"
          value={form.assigned_to}
          onChange={handleFormChange}
        >
          <option value="">Select employee…</option>
          {employees
            .filter((e) => e.status !== "Inactive") // optional: hide inactive staff
            .map((e) => (
              <option key={e.username} value={e.username}>
                {e.name}
              </option>
            ))}
        </select>
      </div>
      <div className="ap-form-row ap-col-2">
        <div className="ap-field ap-field-center">
          <label className="ap-label">Reschedule Request</label>
          <label className="ap-toggle">
            <input
              type="checkbox"
              name="reschedule_allowed"
              checked={form.reschedule_allowed || false}
              onChange={handleFormChange}
            />
            <span className="ap-toggle-track">
              <span className="ap-toggle-thumb" />
            </span>
            <span className="ap-toggle-label">
              {form.reschedule_allowed
                ? "Yes — employee can request reschedule"
                : "No"}
            </span>
          </label>
        </div>
      </div>
      {/* Audio attachment */}
      <div className="ap-form-row ap-col-2">
        <div className="ap-field">
          <label className="ap-label">
            Audio Instruction
            <span
              className="ap-optional"
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#94a3b8",
                background: "#f1f5f9",
                borderRadius: 4,
                padding: "1px 6px",
                marginLeft: 6,
              }}
            >
              optional
            </span>
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 12px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <input
              type="file"
              accept="audio/*"
              style={{
                flex: 1,
                fontSize: 12.5,
                color: "#475569",
                background: "transparent",
                border: "none",
                outline: "none",
                cursor: "pointer",
              }}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  _audioFile: e.target.files[0] || null,
                }))
              }
            />
          </div>
          {form._audioFile && (
            <span style={{ fontSize: 11.5, color: "#16a34a" }}>
              ✓ {form._audioFile.name}
            </span>
          )}
          <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
            MP3, WAV, M4A supported. Max 50MB.
          </span>
        </div>

        <div className="ap-field">
          <label className="ap-label">
            Document Attachment
            <span
              className="ap-optional"
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#94a3b8",
                background: "#f1f5f9",
                borderRadius: 4,
                padding: "1px 6px",
                marginLeft: 6,
              }}
            >
              optional
            </span>
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 12px",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
              style={{
                flex: 1,
                fontSize: 12.5,
                color: "#475569",
                background: "transparent",
                border: "none",
                outline: "none",
                cursor: "pointer",
              }}
              onChange={(e) =>
                setForm((p) => ({ ...p, _docFile: e.target.files[0] || null }))
              }
            />
          </div>
          {form._docFile && (
            <span style={{ fontSize: 11.5, color: "#16a34a" }}>
              ✓ {form._docFile.name}
            </span>
          )}
          <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
            PDF, Word, Excel, images supported. Max 20MB.
          </span>
        </div>
      </div>
      <div className="ap-form-row ap-col-1">
        <div className="ap-field">
          <label className="ap-label">Description</label>
          <textarea
            className="ap-input ap-textarea"
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Add task details, instructions, or notes…"
            rows={3}
          />
        </div>
      </div>
      <div className="ap-form-row ap-col-3">
        <div className="ap-field">
          <label className="ap-label">Site Name</label>
          <select
            className="ap-input ap-select"
            name="site_name"
            value={form.site_name}
            onChange={handleFormChange}
          >
            <option value="">Select site…</option>
            {sites.map((s) => (
              <option key={s.id} value={s.site_name}>
                {s.site_name}
              </option>
            ))}
          </select>
        </div>
        <div className="ap-field">
          <label className="ap-label">Priority</label>
          <select
            className="ap-input ap-select"
            name="priority"
            value={form.priority}
            onChange={handleFormChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="ap-field">
          <label className="ap-label">Initial Status</label>
          <select
            className="ap-input ap-select"
            name="status"
            value={form.status}
            onChange={handleFormChange}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="ap-form-row ap-col-2">
        <div className="ap-field">
          <label className="ap-label">Start / Due Date</label>
          <input
            className="ap-input"
            type="date"
            name="due_date"
            value={form.due_date}
            onChange={handleFormChange}
          />
        </div>
        <div className="ap-field ap-field-center">
          <label className="ap-label">Recurring Task</label>
          <label className="ap-toggle">
            <input
              type="checkbox"
              name="is_recurring"
              checked={form.is_recurring}
              onChange={handleFormChange}
            />
            <span className="ap-toggle-track">
              <span className="ap-toggle-thumb" />
            </span>
            <span className="ap-toggle-label">
              {form.is_recurring ? "Yes" : "No"}
            </span>
          </label>
        </div>
      </div>
      {form.is_recurring && (
        <>
          <div className="ap-recurrence-divider">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Recurrence Schedule
          </div>
          <div className="ap-form-row ap-col-2">
            <div className="ap-field">
              <label className="ap-label">
                Recurrence Pattern <span className="ap-req">*</span>
              </label>
              <div className="ap-recurrence-pills">
                {["daily", "weekly", "monthly", "yearly"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`ap-rpill${form.recurrence === r ? " Active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, recurrence: r }))}
                  >
                    {r === "daily" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                      </svg>
                    )}
                    {r === "weekly" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    )}
                    {r === "monthly" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <line x1="12" y1="14" x2="12" y2="18" />
                      </svg>
                    )}
                    {r === "yearly" && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    )}
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {form.recurrence === "weekly" && (
            <div className="ap-form-row ap-col-1">
              <div className="ap-field">
                <label className="ap-label">Repeat on which day?</label>
                <div className="ap-weekday-grid">
                  {WEEKDAYS.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      className={`ap-wday${String(form.anchor_weekday) === String(i) ? " Active" : ""}`}
                      onClick={() =>
                        setForm((p) => ({ ...p, anchor_weekday: String(i) }))
                      }
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {form.recurrence === "monthly" && (
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Repeat on day of month</label>
                <select
                  className="ap-input ap-select"
                  name="anchor_day"
                  value={form.anchor_day}
                  onChange={handleFormChange}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                      {ordinal(d)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {form.recurrence === "yearly" && (
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Month</label>
                <select
                  className="ap-input ap-select"
                  name="anchor_month"
                  value={form.anchor_month}
                  onChange={handleFormChange}
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">Day</label>
                <select
                  className="ap-input ap-select"
                  name="anchor_month_day"
                  value={form.anchor_month_day}
                  onChange={handleFormChange}
                >
                  {Array.from({ length: monthDays }, (_, i) => i + 1).map(
                    (d) => (
                      <option key={d} value={d}>
                        {d}
                        {ordinal(d)}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          )}
          {anchorPreview && (
            <div className="ap-anchor-preview">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              This task will auto-generate a new instance{" "}
              <strong>{anchorPreview}</strong>. If the previous instance is
              still pending, a warning note will be added.
            </div>
          )}
        </>
      )}
      <div className="ap-form-row ap-col-1 ap-form-actions">
        <button
          className="ap-btn-secondary"
          onClick={() => setForm({ ...EMPTY_FORM })}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset
        </button>
        <button
          className="ap-btn-primary"
          onClick={async () => {
            const ok = await handleSubmit();
            if (ok && onSuccess) onSuccess();
          }}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="ap-mini-spinner" /> Assigning…
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>{" "}
              Assign Task
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const RESCHED_STATUS_STYLES = {
  pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  approved: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  rejected: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};
function toTitleCase(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function slugify(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function generateJobNo(siteName, existingSites) {
  let maxNum = 0;
  (existingSites || []).forEach((s) => {
    const m = /^DIP-(\d+)\|/.exec(s.job_no || "");
    if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
  });
  const nextNum = String(maxNum + 1).padStart(3, "0");
  const year = new Date().getFullYear();
  const cleanName = (siteName || "").replace(/\s+/g, "");
  return `DIP-${nextNum}|${year}|${cleanName}`;
}

async function addSiteToUser(supabaseClient, username, siteName) {
  if (!username || !siteName) return;
  const { data: userRow, error } = await supabaseClient
    .from("user_details")
    .select("id, site_name, site_names")
    .eq("username", username)
    .single();
  if (error || !userRow) return;

  const current = userRow.site_names?.length
    ? userRow.site_names
    : userRow.site_name
      ? [userRow.site_name]
      : [];

  if (current.includes(siteName)) return; // already has it, nothing to do

  const updated = [...current, siteName];

  await supabaseClient
    .from("user_details")
    .update({
      site_names: updated,
      site_name: userRow.site_name || updated[0], // keep legacy single-site column populated
    })
    .eq("id", userRow.id);
}

async function removeSiteFromUser(supabaseClient, username, siteName) {
  if (!username || !siteName) return;
  const { data: userRow, error } = await supabaseClient
    .from("user_details")
    .select("id, site_name, site_names")
    .eq("username", username)
    .single();
  if (error || !userRow) return;

  const current = userRow.site_names?.length
    ? userRow.site_names
    : userRow.site_name
      ? [userRow.site_name]
      : [];

  const updated = current.filter((s) => s !== siteName);

  await supabaseClient
    .from("user_details")
    .update({
      site_names: updated.length ? updated : null,
      site_name:
        userRow.site_name === siteName ? updated[0] || null : userRow.site_name,
    })
    .eq("id", userRow.id);
}
function findUsernameByEmployeeName(employeesList, name) {
  if (!name) return null;
  const match = employeesList.find((e) => e.name === name);
  return match?.username || null;
}

async function syncAllSiteUsers(
  supabaseClient,
  payload,
  employeesList,
  onError,
) {
  const usernamesToSync = new Set();
  if (payload.user_name) usernamesToSync.add(payload.user_name);

  const headUsername = findUsernameByEmployeeName(
    employeesList,
    payload.head_name,
  );
  if (headUsername) usernamesToSync.add(headUsername);

  const coordinatorUsername = findUsernameByEmployeeName(
    employeesList,
    payload.coordinator_name,
  );
  if (coordinatorUsername) usernamesToSync.add(coordinatorUsername);

  const pcUsername = findUsernameByEmployeeName(employeesList, payload.pc_name);
  if (pcUsername) usernamesToSync.add(pcUsername);

  console.log("syncAllSiteUsers: usernames to sync", [...usernamesToSync]);

  for (const uname of usernamesToSync) {
    const syncResult = await syncUserSiteNames(
      supabaseClient,
      uname,
      payload.site_name,
    );
    if (!syncResult.ok && syncResult.reason !== "already_present") {
      onError?.(
        `Site saved, but failed to sync "${uname}"'s site list: ${syncResult.reason}`,
      );
    }
  }
}
async function syncUserSiteNames(supabaseClient, username, siteName) {
  if (!username || !siteName) {
    console.warn("syncUserSiteNames: missing username or siteName", {
      username,
      siteName,
    });
    return { ok: false, reason: "missing_args" };
  }

  const { data: userRow, error: fetchErr } = await supabaseClient
    .from("user_details")
    .select("id, site_name, site_names")
    .eq("username", username)
    .maybeSingle(); // ← safer than .single(), won't throw on 0 or >1 rows

  if (fetchErr) {
    console.error("syncUserSiteNames: fetch failed", fetchErr);
    return { ok: false, reason: fetchErr.message };
  }
  if (!userRow) {
    console.warn(
      "syncUserSiteNames: no user_details row for username",
      username,
    );
    return { ok: false, reason: "user_not_found" };
  }

  const current = Array.isArray(userRow.site_names)
    ? userRow.site_names
    : userRow.site_name
      ? [userRow.site_name]
      : [];

  if (current.includes(siteName)) {
    console.log("syncUserSiteNames: already present, skipping", {
      username,
      siteName,
      current,
    });
    return { ok: true, reason: "already_present" };
  }

  const updated = [...current, siteName];

  const { error: updateErr } = await supabaseClient
    .from("user_details")
    .update({
      site_names: updated,
      site_name: userRow.site_name || siteName,
    })
    .eq("id", userRow.id);

  if (updateErr) {
    console.error("syncUserSiteNames: update failed", updateErr);
    return { ok: false, reason: updateErr.message };
  }

  console.log("syncUserSiteNames: success", { username, updated });
  return { ok: true, updated };
}

async function uploadSiteImage(supabaseClient, siteName, file) {
  const bucket = slugify(siteName);
  if (!bucket) throw new Error("Enter a site name before uploading an image.");

  const { error: bucketErr } = await supabaseClient.storage.createBucket(
    bucket,
    {
      public: true,
    },
  );
  if (bucketErr && !/already exists/i.test(bucketErr.message || "")) {
    throw new Error(
      `Could not create bucket "${bucket}": ${bucketErr.message}`,
    );
  }

  const ext = file.name.split(".").pop();
  const path = `SiteImg/site_title.${ext}`;
  const { error: upErr } = await supabaseClient.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (upErr) throw upErr;

  const { data: urlData } = supabaseClient.storage
    .from(bucket)
    .getPublicUrl(path);
  return urlData.publicUrl;
}
function LeaveRow({ leave, onAction, updating, roleByName }) {
  const status = computeLeaveStatus(leave);
  const style = LEAVE_STATUS_STYLES[status];
  const days = getLeaveDays(leave);
  const managedByHead = isSiteEngineerLeave(leave);
  const canAct =
    !managedByHead &&
    (leave.admin_approved === null || leave.admin_approved === undefined) &&
    !isFinalLeaveStatus(leave);

  return (
    <tr className="ap-tr">
      <td className="ap-td ap-td-title">
        {leave.name || leave.user_name || "Employee"}
        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
          {leave.user_name}
        </div>
      </td>
      <td className="ap-td">{leave.site_name || "—"}</td>
      <td className="ap-td">{leave.leave_type || "Leave"}</td>
      <td className="ap-td">
        {formatLeaveDate(leave.from_date)} → {formatLeaveDate(leave.to_date)}
        {days && (
          <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
            {days} day{days > 1 ? "s" : ""}
          </div>
        )}
      </td>
      <td className="ap-td" style={{ maxWidth: 220 }}>
        {leave.reason ? (
          <span style={{ fontSize: 12.5, color: "#64748b" }}>
            {formatAuditEntries(leave.reason, roleByName)}
          </span>
        ) : (
          <span style={{ color: "#94a3b8" }}>—</span>
        )}
      </td>
      <td className="ap-td">
        {managedByHead ? (
          <span className={`ap-approval-pill ${getHeadApprovalClass(leave)}`}>
            {getHeadApprovalText(leave)}
          </span>
        ) : (
          <>
            {leave.admin_approved === true && (
              <span className="ap-approval-pill ok">Admin: Approved</span>
            )}
            {leave.admin_approved === false && (
              <span className="ap-approval-pill no">Admin: Rejected</span>
            )}
            {(leave.admin_approved === null ||
              leave.admin_approved === undefined) && (
              <span className="ap-approval-pill">Admin: Pending</span>
            )}
          </>
        )}
      </td>
      <td className="ap-td">
        <span
          className="ap-leave-status"
          style={{
            background: style.bg,
            color: style.color,
            borderColor: style.border,
          }}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {leave.rejection_reason && (
          <div
            style={{
              fontSize: 11,
              color: "#dc2626",
              marginTop: 4,
              maxWidth: 180,
            }}
          >
            {formatAuditEntries(leave.rejection_reason, roleByName)}
          </div>
        )}
      </td>
      <td className="ap-td">
        {canAct ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="ap-btn-approve"
              disabled={updating === leave.id}
              onClick={() => onAction(leave, true)}
              style={{ padding: "5px 10px", fontSize: 11.5 }}
            >
              Approve
            </button>
            <button
              className="ap-btn-reject"
              disabled={updating === leave.id}
              onClick={() => onAction(leave, false)}
              style={{ padding: "5px 10px", fontSize: 11.5 }}
            >
              Reject
            </button>
            {updating === leave.id && (
              <span className="ap-saving">saving…</span>
            )}
          </div>
        ) : managedByHead ? (
          <span
            style={{ fontSize: 11.5, color: "#94a3b8", fontStyle: "italic" }}
          >
            Managed by site head
          </span>
        ) : (
          <span
            style={{ fontSize: 11.5, color: "#94a3b8", fontStyle: "italic" }}
          >
            Actioned
          </span>
        )}
      </td>
    </tr>
  );
}

function RescheduleRow({ req, onAction, updating, userMap }) {
  const ss = RESCHED_STATUS_STYLES[req.status] || RESCHED_STATUS_STYLES.pending;
  const fmtDate = (d) =>
    d
      ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";
  const taskTitle = req.tasks?.title || `Task #${req.task_id}`;
  const siteName = req.tasks?.site_name;

  return (
    <tr className="ap-tr">
      <td className="ap-td ap-td-title">
        {nameFor(userMap, req.requested_by)}
      </td>
      <td className="ap-td">
        {taskTitle}
        {siteName && (
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
            {siteName}
          </div>
        )}
      </td>
      <td className="ap-td">{fmtDate(req.current_due)}</td>
      <td className="ap-td" style={{ color: "#7c3aed", fontWeight: 600 }}>
        {fmtDate(req.requested_date)}
      </td>
      <td className="ap-td" style={{ maxWidth: 220 }}>
        {req.reason ? (
          <span style={{ fontSize: 12.5, color: "#64748b" }}>
            {formatAuditEntries(req.reason)}
          </span>
        ) : (
          <span style={{ color: "#94a3b8" }}>—</span>
        )}
      </td>
      <td className="ap-td">
        <span
          className="ap-leave-status"
          style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}
        >
          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
        </span>
      </td>
      <td className="ap-td">
        {req.status === "pending" ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="ap-btn-approve"
              disabled={updating === req.id}
              onClick={() => onAction(req, true)}
              style={{ padding: "5px 10px", fontSize: 11.5 }}
            >
              Approve
            </button>
            <button
              className="ap-btn-reject"
              disabled={updating === req.id}
              onClick={() => onAction(req, false)}
              style={{ padding: "5px 10px", fontSize: 11.5 }}
            >
              Reject
            </button>
            {updating === req.id && <span className="ap-saving">saving…</span>}
          </div>
        ) : (
          <span
            style={{ fontSize: 11.5, color: "#94a3b8", fontStyle: "italic" }}
          >
            {req.status === "approved"
              ? `Approved by ${nameFor(userMap, req.actioned_by)}`
              : `Rejected by ${nameFor(userMap, req.actioned_by)}`}
          </span>
        )}
      </td>
    </tr>
  );
}

function RescheduleRequestCard({
  req,
  onAction,
  updating,
  roleByName,
  userMap,
}) {
  const ss = RESCHED_STATUS_STYLES[req.status] || RESCHED_STATUS_STYLES.pending;
  const fmtDate = (d) =>
    d
      ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";
  const taskTitle = req.tasks?.title || `Task #${req.task_id}`;
  const siteName = req.tasks?.site_name;

  return (
    <div
      className="ap-leave-card"
      style={{
        borderLeftColor:
          req.status === "approved"
            ? "#16a34a"
            : req.status === "rejected"
              ? "#dc2626"
              : "#f59e0b",
      }}
    >
      <div className="ap-leave-card-top">
        <div>
          <div className="ap-leave-title">
            {nameFor(userMap, req.requested_by)}
          </div>
          <div className="ap-leave-sub">
            Task: <strong>{taskTitle}</strong>
            {siteName && ` · ${siteName}`}
          </div>
        </div>
        <span
          className="ap-leave-status"
          style={{ background: ss.bg, color: ss.color, borderColor: ss.border }}
        >
          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
        </span>
      </div>

      <div className="ap-leave-meta">
        <span>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: 3 }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Current: {fmtDate(req.current_due)}
        </span>
        <span
          style={{
            color: "#2563eb",
            background: "#eff6ff",
            borderColor: "#bfdbfe",
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: 3 }}
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Requested: {fmtDate(req.requested_date)}
        </span>
        <span>
          {new Date(req.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {req.reason && (
        <p className="ap-leave-reason">
          {formatAuditEntries(req.reason, roleByName)}
        </p>
      )}
      {req.admin_note && (
        <div className="ap-leave-rejection">
          {formatAuditEntries(req.admin_note, roleByName)}
        </div>
      )}

      {req.status === "pending" ? (
        <div className="ap-leave-actions">
          <button
            className="ap-btn-approve"
            disabled={updating === req.id}
            onClick={() => onAction(req, true)}
          >
            Approve & Update Due Date
          </button>
          <button
            className="ap-btn-reject"
            disabled={updating === req.id}
            onClick={() => onAction(req, false)}
          >
            Reject
          </button>
          {updating === req.id && <span className="ap-saving">saving…</span>}
        </div>
      ) : (
        <div className="ap-leave-done">
          {req.status === "approved"
            ? `✓ Approved by ${nameFor(userMap, req.actioned_by)} — due date updated to ${fmtDate(req.requested_date)}`
            : `✗ Rejected by ${nameFor(userMap, req.actioned_by)}`}
        </div>
      )}
    </div>
  );
}

function VerificationTable({ verifications, allTasks, userMap, onComplete, onCorrect, updatingId, showAction = true, onRowClick, currentUser }) {
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";
  const statusStyle = {
    pending: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    completed: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    correction_sent: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  };
  const statusLabel = {
    pending: "Pending",
    completed: "Completed",
    correction_sent: "Correction Sent",
  };
  const taskFor = (v) => allTasks.find((t) => t.id === v.task_id);

  return (
    <div className="ap-table-wrap">
      <table className="ap-table">
        <thead>
          <tr>
            {[
              "Task",
              "Site",
              "Sent By",
              "Assigned To",
              "Priority",
              "Attachments",
              "Sent On",
              "Status",
              showAction ? "Action" : null,
            ]
              .filter(Boolean)
              .map((h) => (
                <th key={h} className="ap-th">
                  {h}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {verifications.map((v) => {
            const task = taskFor(v);
            const sc = statusStyle[v.status] || statusStyle.pending;
            const p = task
              ? PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
              : null;
            return (
              <tr
                key={v.id}
                className="ap-tr"
                onClick={() => onRowClick?.(v, task)}
                style={{ cursor: "pointer" }}
              >
                <td className="ap-td ap-td-title">
                  {task?.title || v.task_title || "—"}
                </td>
                <td className="ap-td">
                  {task?.site_name || v.site_name || "—"}
                </td>
                <td className="ap-td">{v.sent_by_name || v.sent_by}</td>
                <td className="ap-td">
                  {task ? nameFor(userMap, task.assigned_to) : "—"}
                </td>
                <td className="ap-td">
                  {p ? (
                    <span
                      className="ap-badge"
                      style={{ background: p.bg, color: p.color }}
                    >
                      <span
                        className="ap-badge-dot"
                        style={{ background: p.dot }}
                      />
                      {task.priority}
                    </span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>
                <td className="ap-td" onClick={(e) => e.stopPropagation()}>
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {/* Files the employee submitted with this verification */}
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {v.document_urls?.length > 0 ? (
        v.document_urls.map((url, i) => (
          
          <a  key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: "#475569",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: "2px 8px",
              textDecoration: "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>File {i + 1}</span>
          </a>
        ))
      ) : (
        <span style={{ color: "#94a3b8", fontSize: 11.5 }}>No files</span>
      )}
    </div>

    {/* Admin's correction attachments — only relevant when a correction was sent */}
    {v.status === "correction_sent" && (v.correction_audio_url || v.correction_document_urls?.length > 0) && (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 4, borderTop: "1px dashed #e2e8f0" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", width: "100%" }}>ADMIN CORRECTION</span>
        {v.correction_audio_url && (
          
          <a  href={v.correction_audio_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: "#7c3aed",
              background: "#f5f3ff",
              border: "1px solid #ddd6fe",
              borderRadius: 6,
              padding: "2px 8px",
              textDecoration: "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <span>Audio</span>
          </a>
        )}
        {v.correction_document_urls?.map((url, i) => (
          
          <a  key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              color: "#0369a1",
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: 6,
              padding: "2px 8px",
              textDecoration: "none",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>Doc {i + 1}</span>
          </a>
        ))}
      </div>
    )}
  </div>
</td>
                <td className="ap-td">{fmt(v.created_at)}</td>
                <td className="ap-td">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 20,
                      background: sc.bg,
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                    }}
                  >
                    {statusLabel[v.status] || v.status}
                  </span>
                  {v.status === "correction_sent" && v.correction_note && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#dc2626",
                        marginTop: 4,
                        maxWidth: 220,
                      }}
                    >
                      {v.correction_note}
                    </div>
                  )}
                  {v.status !== "pending" && v.resolved_by && (
                    <div
                      style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}
                    >
                      by {v.resolved_by}
                    </div>
                  )}
                </td>
                  {showAction && (
  <td className="ap-td" onClick={(e) => e.stopPropagation()}>
    {v.status === "pending" ? (
      v.verifier === currentUser ? (
        <div style={{ display: "flex", gap: 6 }}>
          <button className="ap-btn-approve" disabled={updatingId === v.id}
            onClick={(e) => { e.stopPropagation(); onComplete(v); }}
            style={{ padding: "5px 10px", fontSize: 11.5 }}>
            Complete
          </button>
          <button className="ap-btn-reject" disabled={updatingId === v.id}
            onClick={(e) => { e.stopPropagation(); onCorrect(v); }}
            style={{ padding: "5px 10px", fontSize: 11.5 }}>
            Correct
          </button>
        </div>
      ) : (
        <span style={{ fontSize: 11.5, color: "#94a3b8", fontStyle: "italic" }}
          title="Only the admin this task was sent to can action it">
          Assigned to {v.verifier_name || v.verifier}
        </span>
      )
    ) : (
      <span style={{ fontSize: 11.5, color: "#94a3b8", fontStyle: "italic" }}>
        {v.status === "completed" ? "✓ Done" : "✗ Sent back"}
      </span>
    )}
  </td>
)}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile fallback — reuse the existing card layout */}
      <div className="ap-task-mobile-grid">
          {verifications.map((v) => (
            <VerificationCard
              key={v.id}
              verification={v}
              task={taskFor(v)}
              userMap={userMap}
              onComplete={onComplete}
              onCorrect={onCorrect}
              updatingId={updatingId}
              onClick={() => onRowClick?.(v, taskFor(v))}
              currentUser={currentUser}
            />
          ))}
        </div>
    </div>
  );
}

function AdminTicketsTable({
  tickets,
  onSolve,
  updatingId,
  showAction = true,
}) {
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";
  const statusStyle = {
    open: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    solved: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  };

  return (
    <div className="ap-table-wrap">
      <table className="ap-table">
        <thead>
          <tr>
            {[
              "Task",
              "Raised By",
              "Sent To",
              "Site",
              "Query",
              "Attachment",
              "Raised On",
              "Status",
              showAction ? "Action" : null,
            ]
              .filter(Boolean)
              .map((h) => (
                <th key={h} className="ap-th">
                  {h}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => {
            const sc = statusStyle[t.status] || statusStyle.open;
            return (
              <tr key={t.id} className="ap-tr">
                <td className="ap-td ap-td-title">{t.task_title || "—"}</td>
                <td className="ap-td">{t.raised_by_name || t.raised_by}</td>
                <td className="ap-td">{t.assigned_to_name || t.assigned_to}</td>
                <td className="ap-td">{t.site_name || "—"}</td>
                <td className="ap-td" style={{ maxWidth: 220 }}>
                  <span style={{ fontSize: 12.5, color: "#64748b" }}>
                    {t.query}
                  </span>
                </td>
                <td className="ap-td">
                  {t.document_url ? (
                    <a
                      href={t.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        color: "#2563eb",
                        fontWeight: 600,
                      }}
                    >
                      View file
                    </a>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>

                <td className="ap-td">{fmt(t.created_at)}</td>
                <td className="ap-td">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 20,
                      background: sc.bg,
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                    }}
                  >
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                  {t.status === "solved" && t.resolution_note && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#16a34a",
                        marginTop: 4,
                        maxWidth: 200,
                      }}
                    >
                      {t.resolution_note}
                    </div>
                  )}
                  {t.status === "solved" && t.resolution_document_url && (
                    <a
                      href={t.resolution_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 12,
                        color: "#2563eb",
                        fontWeight: 600,
                      }}
                    >
                      View resolution file
                    </a>
                  )}
                  {t.status === "solved" && t.resolved_by && (
                    <div
                      style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}
                    >
                      by {t.resolved_by}
                    </div>
                  )}
                </td>
                {showAction && (
                  <td className="ap-td">
                    {t.status === "open" ? (
                      <button
                        className="ap-btn-approve"
                        disabled={updatingId === t.id}
                        onClick={() => onSolve(t)}
                        style={{ padding: "5px 10px", fontSize: 11.5 }}
                      >
                        Mark Solved
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: 11.5,
                          color: "#94a3b8",
                          fontStyle: "italic",
                        }}
                      >
                        ✓ Solved
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="ap-task-mobile-grid">
        {tickets.map((t) => {
          const sc = statusStyle[t.status] || statusStyle.open;
          return (
            <div key={t.id} className="ap-task-card-mobile">
              <div className="ap-task-card-head">
                <div>
                  <div className="ap-task-card-title">
                    {t.task_title || "—"}
                  </div>
                  <div className="ap-task-card-sub">
                    {t.raised_by_name || t.raised_by} →{" "}
                    {t.assigned_to_name || t.assigned_to}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: 20,
                    background: sc.bg,
                    color: sc.color,
                    border: `1px solid ${sc.border}`,
                  }}
                >
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "#64748b" }}>{t.query}</div>
              {t.document_url && (
                <a
                  href={t.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}
                >
                  View attachment
                </a>
              )}
              {showAction && t.status === "open" && (
                <button
                  className="ap-btn-approve"
                  disabled={updatingId === t.id}
                  onClick={() => onSolve(t)}
                  style={{ width: "100%" }}
                >
                  Mark Solved
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ── main component ─────────────────────────────────────────────────────────
export default function AdminPortal() {
  const [allReschedules, setAllReschedules] = useState([]);
  const [loadingReschedules, setLoadingReschedules] = useState(false);
  const [updatingRescheduleId, setUpdatingRescheduleId] = useState(null);
  const [recurringMobileFilterOpen, setRecurringMobileFilterOpen] = useState(false);
  const [showRecurringInAllTasks, setShowRecurringInAllTasks] = useState(false);
  const [user, setUser] = useState(null);
  const canSwitchToOffice = canAccessPortal(user, "office");
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window === "undefined" ? true : window.innerWidth > 760,);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);

  const [overdueRescheduleModal, setOverdueRescheduleModal] = useState(null); 
  const [updatingOverdueId, setUpdatingOverdueId] = useState(null);
  const [overdueTasksSeen, setOverdueTasksSeen] = useState(false);

  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loadingVerifications, setLoadingVerifications] = useState(false);
  const [updatingVerificationId, setUpdatingVerificationId] = useState(null);
  const [correctionModal, setCorrectionModal] = useState(null); 

  const [allTickets, setAllTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketSolveModal, setTicketSolveModal] = useState(null); 
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [leaveRejectModal, setLeaveRejectModal] = useState(null); 
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null); 
  const mainRef = useRef(null);

  const [seenOverdueIds, setSeenOverdueIds] = useState(() => {
  try {return JSON.parse(localStorage.getItem("seenOverdueTaskIds") || "[]");} 
  catch {return [];}
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);
  const [empForm, setEmpForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
    department: "",
    site_name: "",
    site_names: [],
    status: "Active",
  });
  const [showEmpPassword, setShowEmpPassword] = useState(false);
  const [empSubmitting, setEmpSubmitting] = useState(false);
  const [mySvrReports, setMySvrReports] = useState([]);
  const [loadingSvrReports, setLoadingSvrReports] = useState(false);
  const [rescheduleFilters, setRescheduleFilters] = useState({
    name: "",
    status: "",
  });
  const [rescheduleMobileFilterOpen, setRescheduleMobileFilterOpen] =
    useState(false);
  const [leaveFilters, setLeaveFilters] = useState({
    name: "",
    dateFrom: "",
    dateTo: "",
  });
  const [leaveMobileFilterOpen, setLeaveMobileFilterOpen] = useState(false);
  const [submissionMobileFilterOpen, setSubmissionMobileFilterOpen] =
    useState(false);
  const [employeeFilters, setEmployeeFilters] = useState({
    name: "",
    site: "",
  });
  const [employeeMobileFilterOpen, setEmployeeMobileFilterOpen] =
    useState(false);

  const [siteFiltersState, setSiteFiltersState] = useState({
    site: "",
    assignedUser: "",
  });
  const [siteMobileFilterOpen, setSiteMobileFilterOpen] = useState(false);

  const fetchAllReportSubmissions = useCallback(async (u) => {
    if (!u || u.role?.toLowerCase().trim() !== "admin") return;
    setLoadingSubmissions(true);

    const [dprRes, svrRes, wprRes] = await Promise.allSettled([
      supabase
        .from("dpr_reports")
        .select("id, site, engineer, report_type, date, pdf_url, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("site_reports")
        .select("id, site_name, reporter_name, visit_date, pdf_url, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("wpr_reports")
        .select(
          "id, site_name, engineer_name, created_at, presentation_url, created_at",
        )
        .order("created_at", { ascending: false }),
    ]);

    const dprData =
      dprRes.status === "fulfilled" && !dprRes.value.error
        ? dprRes.value.data
        : [];
    const svrData =
      svrRes.status === "fulfilled" && !svrRes.value.error
        ? svrRes.value.data
        : [];
    const wprData =
      wprRes.status === "fulfilled" && !wprRes.value.error
        ? wprRes.value.data
        : [];

    const normalized = [
      ...(dprData || [])
        .filter((r) => normalizeText(r.report_type) !== "morning")
        .map((r) => ({
          id: `dpr-${r.id}`,
          site: r.site,
          engineer: r.engineer,
          date: r.date,
          created_at: r.created_at,
          pdf_url: r.pdf_url,
          report_type: r.report_type
            ? `DPR (${toTitleCase(r.report_type)})`
            : "DPR",
          source: "dpr",
        })),
      ...(svrData || []).map((r) => ({
        id: `svr-${r.id}`,
        site: r.site_name,
        engineer: r.reporter_name,
        date: r.visit_date,
        created_at: r.created_at,
        pdf_url: r.pdf_url,
        report_type: "SVR",
        source: "svr",
      })),
      ...(wprData || []).map((r) => ({
        id: `wpr-${r.id}`,
        site: r.site_name,
        engineer: r.engineer_name,
        date: r.created_at,
        created_at: r.created_at,
        pdf_url: r.presentation_url,
        report_type: "WPR",
        source: "wpr",
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    setAllSubmissions(normalized);
    setLoadingSubmissions(false);
  }, []);

  const fetchMySvrReports = useCallback(async (u) => {
    if (!u) return;
    setLoadingSvrReports(true);
    const { data, error } = await supabase
      .from("site_reports")
      .select(
        "id, site_name, reporter_name, designation, visit_date, visit_time, progress_of_work, quality_observations, safety_concerns, issues_concerns, site_visit_instructions, key_instructions, submitted_by, submitted_by_name, pdf_url, created_at",
      )
      .eq("submitted_by", u.user_name) // ✅ matches what's actually stored
      .order("created_at", { ascending: false });
    if (!error) setMySvrReports(data || []);
    setLoadingSvrReports(false);
  }, []);
  const EMPTY_SITE_FORM = {
    site_name: "",
    user_name: "",
    role: "",
    job_no: "",
    started_date: "",
    client_name: "",
    head_name: "",
    site_image_url: "",
    coordinator_name: "",
    head_contact_no: "",
    coordinator_contact_no: "",
    pc_name: "",
    pc_contact_no: "",
    status: "Active",
    _imageFile: null,
  };
  const [sites, setSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [siteForm, setSiteForm] = useState({ ...EMPTY_SITE_FORM });
  const [siteSubmitting, setSiteSubmitting] = useState(false);
  const [uploadingSiteImage, setUploadingSiteImage] = useState(false);

  useEffect(() => {
    if (editingSite) return;
    if (!siteForm.site_name.trim()) return;
    setSiteForm((p) => ({ ...p, job_no: generateJobNo(p.site_name, sites) }));
  }, [siteForm.site_name, sites, editingSite]);

  const regenerateJobNo = () => {
    setSiteForm((p) => ({ ...p, job_no: generateJobNo(p.site_name, sites) }));
  };

  const [allTasks, setAllTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [updatingLeaveId, setUpdatingLeaveId] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  //Report submission
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionFilters, setSubmissionFilters] = useState({
    site: "",
    engineer: "",
    reportType: "",
    dateFrom: "",
    dateTo: "",
  });
  // Task filters
  const [taskFilters, setTaskFilters] = useState({ ...EMPTY_TASK_FILTERS });
  const total = allTasks.length;
  const roleByName = employees.reduce(
    (map, e) => ({ ...map, [e.name]: e.role }),
    {},
  );
  const filteredEmployees = employees
    .filter((emp) => {
      if (employeeFilters.name && emp.name !== employeeFilters.name)
        return false;
      if (employeeFilters.site) {
        const empSites = emp.site_names?.length
          ? emp.site_names
          : emp.site_name
            ? [emp.site_name]
            : [];
        if (!empSites.includes(employeeFilters.site)) return false;
      }
      return true;
    })
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const [userMap, setUserMap] = useState({});
  useEffect(() => {
    supabase
      .from("user_details")
      .select("username, name")
      .then(({ data, error }) => {
        if (!error && data) {
          const map = {};
          data.forEach((u) => {
            map[u.username] = u.name;
          });
          setUserMap(map);
        }
      });
  }, []);
  const filteredReschedules = allReschedules.filter((r) => {
    if (
      rescheduleFilters.name &&
      nameFor(userMap, r.requested_by) !== rescheduleFilters.name
    )
      return false;
    if (rescheduleFilters.status && r.status !== rescheduleFilters.status)
      return false;
    return true;
  });
  const filteredLeaves = allLeaves.filter((l) => {
    if (leaveFilters.name && (l.name || l.user_name) !== leaveFilters.name)
      return false;
    if (leaveFilters.dateTo && l.from_date && l.from_date > leaveFilters.dateTo)
      return false;
    if (leaveFilters.dateFrom && l.to_date && l.to_date < leaveFilters.dateFrom)
      return false;
    return true;
  });
  const filteredSites = sites
    .filter((site) => {
      if (siteFiltersState.site && site.site_name !== siteFiltersState.site)
        return false;
      if (
        siteFiltersState.assignedUser &&
        site.user_name !== siteFiltersState.assignedUser
      )
        return false;
      return true;
    })
    .sort((a, b) => (a.site_name || "").localeCompare(b.site_name || ""));
  const assignableEmployees = employees;
  const EMPTY_RECURRING_FILTERS = {
    dueSoon: false,
    site: "",
    assignedTo: "",
    recurrence: "",
  };
  const [recurringFilters, setRecurringFilters] = useState({
    ...EMPTY_RECURRING_FILTERS,
  });
const [verificationDetail, setVerificationDetail] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
  }, []);
  const fetchPendingVerifications = useCallback(async () => {
    setLoadingVerifications(true);
    const { data, error } = await supabase
      .from("task_verifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setPendingVerifications(data || []);
    setLoadingVerifications(false);
  }, []);
  const fetchAllTasks = useCallback(async () => {
    setLoadingTasks(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    setAllTasks(data || []);
    setLoadingTasks(false);
  }, []);

  const fetchAllTickets = useCallback(async () => {
    setLoadingTickets(true);
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setAllTickets(data || []);
    setLoadingTickets(false);
  }, []);
  const fetchAllReschedules = useCallback(async () => {
    setLoadingReschedules(true);
    const { data } = await supabase
      .from("reschedule_requests")
      .select("*, tasks(title, site_name)")
      .is("verify_with", null) // ← only requests with no specific verifier
      .order("created_at", { ascending: false });
    setAllReschedules(data || []);
    setLoadingReschedules(false);
  }, []);

  const fetchAllLeaves = useCallback(async () => {
    setLoadingLeaves(true);
    const { data, error } = await supabase
      .from("leaves")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      showToast("error", "Failed to load leaves. " + error.message);
    } else {
      const leaves = data || [];
      const userNames = [
        ...new Set(leaves.map((l) => l.user_name).filter(Boolean)),
      ];
      let siteNames = [
        ...new Set(leaves.map((l) => l.site_name).filter(Boolean)),
      ];
      let usersByName = {};
      let headsBySite = {};

      if (userNames.length) {
        const { data: users } = await supabase
          .from("user_details")
          .select("username, role, site_name")
          .in("username", userNames);
        usersByName = (users || []).reduce(
          (map, item) => ({ ...map, [item.username]: item }),
          {},
        );
        siteNames = [
          ...new Set([
            ...siteNames,
            ...(users || []).map((u) => u.site_name).filter(Boolean),
          ]),
        ];
      }
      if (siteNames.length) {
        const { data: heads } = await supabase
          .from("site_details")
          .select("site_name, user_name, role")
          .in("site_name", siteNames)
          .eq("role", "Project Head");
        headsBySite = (heads || []).reduce(
          (map, item) => ({
            ...map,
            [item.site_name]: [...(map[item.site_name] || []), item.user_name],
          }),
          {},
        );
      }

      setAllLeaves(
        leaves.map((leave) => ({
          ...leave,
          role: leave.role || usersByName[leave.user_name]?.role || "",
          site_name:
            leave.site_name || usersByName[leave.user_name]?.site_name || "",
          head_user_names:
            headsBySite[
              leave.site_name || usersByName[leave.user_name]?.site_name
            ]?.join(", ") || "",
        })),
      );
    }
    setLoadingLeaves(false);
  }, []);
  const headEmployees = employees.filter(
    (e) => normalizeText(e.role) === "project head",
  );
  const inchargeEmployees = employees.filter(
    (e) => normalizeText(e.role) === "site incharge",
  );
  const pcEmployees = employees.filter(
    (e) => normalizeText(e.role) === "process controller",
  );
  const fetchSites = useCallback(async () => {
    setLoadingSites(true);
    const { data } = await supabase
      .from("site_details")
      .select("*")
      .order("created_at", { ascending: false });
    setSites(data || []);
    setLoadingSites(false);
  }, []);

  const handleSiteFormChange = (e) => {
    const { name, value } = e.target;
    setSiteForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "user_name") {
        const match = employees.find((emp) => emp.username === value);
        if (match?.role) next.role = match.role;
      }
      return next;
    });
  };

  const handleSiteSubmit = async () => {
    if (!siteForm.site_name.trim())
      return showToast("error", "Site name is required.");

    setSiteSubmitting(true);

    let site_image_url = siteForm.site_image_url || null;
    if (siteForm._imageFile) {
      try {
        setUploadingSiteImage(true);
        site_image_url = await uploadSiteImage(
          supabase,
          siteForm.site_name,
          siteForm._imageFile,
        );
      } catch (err) {
        setUploadingSiteImage(false);
        setSiteSubmitting(false);
        return showToast("error", err.message);
      }
      setUploadingSiteImage(false);
    }

    const payload = {
      site_name: siteForm.site_name.trim(),
      user_name: siteForm.user_name || null,
      role: siteForm.role.trim() || null,
      job_no: siteForm.job_no.trim() || null,
      started_date: siteForm.started_date || null,
      client_name: siteForm.client_name.trim() || null,
      head_name: siteForm.head_name.trim() || null,
      site_image_url,
      coordinator_name: siteForm.coordinator_name.trim() || null,
      head_contact_no: siteForm.head_contact_no.trim() || null,
      coordinator_contact_no: siteForm.coordinator_contact_no.trim() || null,
      pc_name: siteForm.pc_name.trim() || null,
      pc_contact_no: siteForm.pc_contact_no.trim() || null,
      status: toTitleCase(siteForm.status) || "Active",
    };

    if (editingSite) {
      const { error } = await supabase
        .from("site_details")
        .update(payload)
        .eq("id", editingSite.id);
      setSiteSubmitting(false);
      if (error)
        return showToast("error", "Failed to update site. " + error.message);

      if (payload.user_name) {
        const syncResult = await syncUserSiteNames(
          supabase,
          payload.user_name,
          payload.site_name,
        );
        if (!syncResult.ok) {
          showToast(
            "error",
            "Site saved, but failed to sync user's site list: " +
              syncResult.reason,
          );
        }
      }

      showToast("success", "Site updated successfully!");
    } else {
      const { error } = await supabase.from("site_details").insert([payload]);
      setSiteSubmitting(false);
      await syncAllSiteUsers(supabase, payload, employees, (msg) =>
        showToast("error", msg),
      );

      showToast("success", "Site updated successfully!");
    }
    setSiteForm({ ...EMPTY_SITE_FORM });
    setEditingSite(null);
    fetchSites();
    fetchEmployees();
    setActiveTab("manage-sites");
  };

  const handleSiteEdit = (site) => {
    setEditingSite(site);
    setSiteForm({
      _imageFile: null,
      site_name: site.site_name || "",
      user_name: site.user_name || "",
      role: site.role || "",
      job_no: site.job_no || "",
      started_date: site.started_date || "",
      client_name: site.client_name || "",
      head_name: site.head_name || "",
      site_image_url: site.site_image_url || "",
      coordinator_name: site.coordinator_name || "",
      head_contact_no: site.head_contact_no || "",
      coordinator_contact_no: site.coordinator_contact_no || "",
      pc_name: site.pc_name || "",
      pc_contact_no: site.pc_contact_no || "",
      status: site.status || "Active",
    });
    setActiveTab("add-site");
  };

  const handleSiteDelete = async (id) => {
    if (!window.confirm("Delete this site?")) return;
    const site = sites.find((s) => s.id === id);
    await supabase.from("site_details").delete().eq("id", id);
    if (site?.user_name) {
      await removeSiteFromUser(supabase, site.user_name, site.site_name);
    }
    setSites((p) => p.filter((s) => s.id !== id));
    fetchEmployees();
    showToast("success", "Site deleted.");
  };

  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    const { data } = await supabase
      .from("user_details") // ← must be "users" not "user_details"
      .select("*")
      .order("name", { ascending: true });
    setEmployees(data || []);
    setLoadingEmployees(false);
  }, []);

  const handleEmpFormChange = (e) => {
    const { name, value } = e.target;
    setEmpForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmpSubmit = async () => {
    if (
      !empForm.name.trim() ||
      !empForm.username.trim() ||
      !empForm.password.trim() ||
      !empForm.role.trim() ||
      !empForm.department.trim()
    )
      return showToast("error", "Please fill all required fields.");
    setEmpSubmitting(true);

    if (editingEmployee) {
      const { error } = await supabase
        .from("user_details")
        .update({
          name: empForm.name.trim(),
          username: empForm.username.trim(),
          password: empForm.password.trim(),
          role: empForm.role.trim(),
          department: toTitleCase(empForm.department),
          site_name: empForm.site_names[0] || empForm.site_name.trim() || null,
          site_names: empForm.site_names.length ? empForm.site_names : null,
          status: toTitleCase(empForm.status) || "Active",
        })
        .eq("id", editingEmployee.id);
      setEmpSubmitting(false);
      if (error)
        return showToast("error", "Failed to update. " + error.message);
      showToast("success", "Employee updated successfully!");
    } else {
      const { error } = await supabase.from("user_details").insert([
        {
          name: empForm.name.trim(),
          username: empForm.username.trim(),
          password: empForm.password.trim(),
          role: empForm.role.trim(),
          department: toTitleCase(empForm.department),
          site_name: empForm.site_names[0] || empForm.site_name.trim() || null,
          site_names: empForm.site_names.length ? empForm.site_names : null,
          status: toTitleCase(empForm.status) || "Active",
        },
      ]);
      setEmpSubmitting(false);
      if (error) return showToast("error", "Failed to save. " + error.message);
      showToast("success", "Employee added successfully!");
    }

    setEmpForm({
      name: "",
      username: "",
      password: "",
      role: "",
      department: "",
      site_name: "",
      status: "Active",
    });
    setEditingEmployee(null);
    fetchEmployees();
    setActiveTab("manage-employees");
  };

  const handleEmpEdit = (emp) => {
    setEditingEmployee(emp);
    setEmpForm({
      name: emp.name || "",
      username: emp.username || "",
      password: emp.password || "",
      role: emp.role || "",
      department: emp.department || "",
      site_name: emp.site_name || "",
      site_names: emp.site_names || (emp.site_name ? [emp.site_name] : []),
      status: emp.status || "Active",
    });
    setActiveTab("add-employee");
  };

  const handleEmpDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    const { error } = await supabase.from("user_details").delete().eq("id", id);
    if (error) {
      showToast("error", "Failed to delete employee. " + error.message);
      return;
    }
    setEmployees((p) => p.filter((e) => e.id !== id));
    showToast("success", "Employee deleted.");
  };

  useEffect(() => {
    if (user) {
      fetchAllTasks();
      fetchAllLeaves();
      fetchEmployees();
      fetchAllReschedules();
      fetchSites();
      fetchMySvrReports(user);
      fetchAllReportSubmissions(user);
      fetchAllTickets();
      fetchPendingVerifications(); // ← add
    }
  }, [
    user,
    fetchAllTasks,
    fetchAllLeaves,
    fetchEmployees,
    fetchAllReschedules,
    fetchSites,
    fetchMySvrReports,
    fetchAllReportSubmissions,
    fetchAllTickets,
    fetchPendingVerifications, // ← add
  ]);

  useRecurringTasks(user, fetchAllTasks);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

const handleNavClick = (key) => {
  setActiveTab(key);
  if (key === "my-reports") fetchMySvrReports(user);
  if (key === "report-submissions") fetchAllReportSubmissions(user);
  if (key === "overdue-tasks") {
    const ids = overdueTasks.map((t) => t.id);
    setSeenOverdueIds(ids);
    localStorage.setItem("seenOverdueTaskIds", JSON.stringify(ids));
  }

    if (key === "add-employee") {
      setEditingEmployee(null);
      setEmpForm({
        name: "",
        username: "",
        password: "",
        role: "",
        department: "",
        site_name: "",
        site_names: [],
        status: "active",
      });
    }
    if (key === "add-site") {
      setEditingSite(null);
      setSiteForm({ ...EMPTY_SITE_FORM });
    }
    if (typeof window !== "undefined" && window.innerWidth <= 760)
      setSidebarOpen(false);
  };
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "is_recurring" && !checked ? { recurrence: "" } : {}),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return showToast("error", "Title is required.");
    if (!form.assigned_to.trim())
      return showToast("error", "Assigned To is required.");
    if (form.is_recurring && !form.recurrence)
      return showToast("error", "Please select a recurrence pattern.");

    const anchor = form.is_recurring ? buildAnchor(form) : null;
          const computedDueDate = form.is_recurring
          ? getNextDueDate(null, form.recurrence)   // ← fixed: returns a date string directly
          : form.due_date || null;
            setSubmitting(true);

    // Upload audio if provided
    let audio_url = null;
    if (form._audioFile) {
      const ext = form._audioFile.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("task-audio")
        .upload(path, form._audioFile);
      if (upErr) {
        setSubmitting(false);
        return showToast("error", "Audio upload failed: " + upErr.message);
      }
      const { data: urlData } = supabase.storage
        .from("task-audio")
        .getPublicUrl(path);
      audio_url = urlData.publicUrl;
    }

    // Upload document if provided
    let document_url = null;
    if (form._docFile) {
      const ext = form._docFile.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("task-documents")
        .upload(path, form._docFile);
      if (upErr) {
        setSubmitting(false);
        return showToast("error", "Document upload failed: " + upErr.message);
      }
      const { data: urlData } = supabase.storage
        .from("task-documents")
        .getPublicUrl(path);
      document_url = urlData.publicUrl;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      assigned_to: form.assigned_to.trim(),
      site_name: form.site_name.trim() || null,
      assigned_by: user.user_name,
      priority: form.priority,
      status: form.status,
      due_date: computedDueDate,
      is_recurring: form.is_recurring,
      recurrence: form.is_recurring ? form.recurrence : null,
      recurrence_anchor: anchor,
      last_generated_date: null,
      parent_task_id: null,
      reschedule_allowed: form.reschedule_allowed || false,
      hours_to_complete: form.hours_to_complete
        ? parseFloat(form.hours_to_complete)
        : null,
      audio_url,
      document_url,
    };

    const { data: insertedTask, error } = await supabase
      .from("tasks")
      .insert([payload])
      .select("id")
      .single();
    setSubmitting(false);

    if (error) {
      showToast("error", "Failed to assign task. " + error.message);
      return false;
    }

    if (form.enable_checkpoints) {
      await supabase
        .from("tasks")
        .update({ has_checkpoints: true })
        .eq("id", insertedTask.id);
    }

    const desc = form.is_recurring
      ? anchorDescription(form.recurrence, anchor)
      : null;
    showToast(
      "success",
      `Task "${form.title}" assigned${desc ? ` — repeats ${desc}` : ""}!`,
    );
    fetchAllTasks();
    return true;
  };

  const handleOverdueRescheduleSubmit = async () => {
  if (!overdueRescheduleModal?.newDate)
    return showToast("error", "Please pick a new due date.");
  const { task, newDate } = overdueRescheduleModal;
  setUpdatingOverdueId(task.id);
  const { error } = await supabase
    .from("tasks")
    .update({ due_date: newDate })
    .eq("id", task.id);
  setUpdatingOverdueId(null);
  if (error) return showToast("error", "Failed to reschedule: " + error.message);
  setAllTasks((prev) =>
    prev.map((t) => (t.id === task.id ? { ...t, due_date: newDate } : t)),
  );
  showToast(
    "success",
    `Due date updated to ${new Date(newDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`,
  );
  setOverdueRescheduleModal(null);
};

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    setAllTasks((p) => p.filter((t) => t.id !== id));
    showToast("success", "Task deleted.");
  };

  const handleRescheduleAction = async (req, approved) => {
    if (!approved) {
      // Open the reject modal instead of window.prompt
      setRejectModal({ req, reason: "" });
      return;
    }
    // Approve path — unchanged
    setUpdatingRescheduleId(req.id);
    const payload = {
      status: "approved",
      actioned_by: user.user_name,
      actioned_at: new Date().toISOString(),
      admin_note: null,
    };
    const { error } = await supabase
      .from("reschedule_requests")
      .update(payload)
      .eq("id", req.id);
    if (!error) {
      await supabase
        .from("tasks")
        .update({ due_date: req.requested_date })
        .eq("id", req.task_id);
      fetchAllTasks();
    }
    setUpdatingRescheduleId(null);
    if (error) {
      showToast("error", "Failed to update: " + error.message);
      return;
    }
    setAllReschedules((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, ...payload } : r)),
    );
    showToast("success", "Reschedule approved — task due date updated.");
  };

  // Add this new function for confirming the rejection:
  const handleRejectConfirm = async () => {
    if (!rejectModal.reason.trim()) return; // button is disabled, but guard anyway
    const req = rejectModal.req;
    const reason = rejectModal.reason.trim();
    setRejectModal(null);
    setUpdatingRescheduleId(req.id);
    const payload = {
      status: "rejected",
      actioned_by: user.user_name,
      actioned_at: new Date().toISOString(),
      admin_note: reason,
    };
    const { error } = await supabase
      .from("reschedule_requests")
      .update(payload)
      .eq("id", req.id);
    setUpdatingRescheduleId(null);
    if (error) {
      showToast("error", "Failed to reject: " + error.message);
      return;
    }
    setAllReschedules((prev) =>
      prev.map((r) => (r.id === req.id ? { ...r, ...payload } : r)),
    );
    showToast("success", "Reschedule rejected.");
  };

  const handleMarkVerificationCompleted = async (verification) => {
      if (verification.verifier !== user.user_name)
    return showToast("error", "Only the assigned admin can complete this task.");
  setUpdatingVerificationId(verification.id);
  const payload = {
    status: "completed",
    resolved_by: user.user_name,
    resolved_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("task_verifications")
    .update(payload)
    .eq("id", verification.id);

  if (!error && verification.task_id) {
    const task = allTasks.find((t) => t.id === verification.task_id);

    await supabase
      .from("tasks")
      .update({ status: "completed" })
      .eq("id", verification.task_id);

    // If it's a recurring task, spawn the next instance now.
    if (task?.is_recurring && task.recurrence) {
      const nextDue = getNextDueDate(task.due_date, task.recurrence);
      await spawnNextRecurringInstance(task, nextDue);
    }

    fetchAllTasks();
  }

  setUpdatingVerificationId(null);
  if (error)
    return showToast("error", "Failed to mark completed: " + error.message);

  setPendingVerifications((prev) =>
    prev.map((v) => (v.id === verification.id ? { ...v, ...payload } : v)),
  );
  showToast("success", "Task marked as completed.");
};

const openCorrectionModal = (verification) => {
  if (verification.verifier !== user.user_name)
    return showToast("error", "Only the assigned admin can send a correction.");
  setCorrectionModal({ verification, note: "", audioFile: null, docFiles: [], submitting: false });
};

  const handleCorrectionSubmit = async () => {
    if (!correctionModal.note.trim())
      return showToast("error", "Please write a correction note.");

    setCorrectionModal((p) => ({ ...p, submitting: true }));

    let audio_url = null;
    if (correctionModal.audioFile) {
      const file = correctionModal.audioFile;
      const path = `${user.user_name}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage
        .from("task-verification-docs")
        .upload(path, file);
      if (upErr) {
        setCorrectionModal((p) => ({ ...p, submitting: false }));
        return showToast("error", "Audio upload failed: " + upErr.message);
      }
      const { data: pub } = supabase.storage
        .from("task-verification-docs")
        .getPublicUrl(path);
      audio_url = pub?.publicUrl || null;
    }

    const documentUrls = [];
    for (const file of correctionModal.docFiles) {
      const path = `${user.user_name}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage
        .from("task-verification-docs")
        .upload(path, file);
      if (upErr) {
        setCorrectionModal((p) => ({ ...p, submitting: false }));
        return showToast("error", "Document upload failed: " + upErr.message);
      }
      const { data: pub } = supabase.storage
        .from("task-verification-docs")
        .getPublicUrl(path);
      if (pub?.publicUrl) documentUrls.push(pub.publicUrl);
    }

    const payload = {
      status: "correction_sent",
      correction_note: correctionModal.note.trim(),
      correction_audio_url: audio_url,
      correction_document_urls: documentUrls,
      resolved_by: user.user_name,
      resolved_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("task_verifications")
      .update(payload)
      .eq("id", correctionModal.verification.id);

    setCorrectionModal((p) => (p ? { ...p, submitting: false } : p));
    if (error)
      return showToast("error", "Failed to send correction: " + error.message);

    setPendingVerifications((prev) =>
      prev.map((v) =>
        v.id === correctionModal.verification.id ? { ...v, ...payload } : v,
      ),
    );
    showToast(
      "success",
      `Correction sent to ${correctionModal.verification.sent_by_name || correctionModal.verification.sent_by}.`,
    );
    setCorrectionModal(null);
  };
  const handleLeaveAction = async (leave, approved) => {
    if (!approved) {
      setLeaveRejectModal({ leave, reason: "" });
      return;
    }
    setUpdatingLeaveId(leave.id);
    const payload = {
      admin_approved: true,
      approved_by: user.user_name,
      rejection_reason: null,
      status: "Approved",
    };
    const { error } = await supabase
      .from("leaves")
      .update(payload)
      .eq("id", leave.id);
    setUpdatingLeaveId(null);
    if (error) {
      showToast("error", "Failed to update leave. " + error.message);
      return;
    }
    setAllLeaves((prev) =>
      prev.map((item) =>
        item.id === leave.id ? { ...item, ...payload } : item,
      ),
    );
    showToast("success", "Leave approved.");
  };

  const handleMarkTicketSolved = async () => {
    if (!ticketSolveModal) return;
    const ticket = ticketSolveModal.ticket;
    const note = ticketSolveModal.note.trim();

    setUpdatingTicketId(ticket.id);

    let resolution_document_url = null;
    if (ticketSolveModal.file) {
      const file = ticketSolveModal.file;
      const path = `${user.user_name}/resolved_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadErr } = await supabase.storage
        .from("ticket-raised")
        .upload(path, file);
      if (uploadErr) {
        setUpdatingTicketId(null);
        return showToast("error", "File upload failed: " + uploadErr.message);
      }
      const { data: pub } = supabase.storage
        .from("ticket-raised")
        .getPublicUrl(path);
      resolution_document_url = pub?.publicUrl || null;
    }

    const payload = {
      status: "solved",
      resolution_note: note || null,
      resolution_document_url,
      resolved_by: user.user_name,
      resolved_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from("tickets")
      .update(payload)
      .eq("id", ticket.id);
    setUpdatingTicketId(null);
    if (error) return showToast("error", "Failed: " + error.message);
    setAllTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, ...payload } : t)),
    );
    setTicketSolveModal(null);
    showToast("success", "Ticket marked as solved.");
  };
  const handleLeaveRejectConfirm = async () => {
    if (!leaveRejectModal.reason.trim()) return;
    const leave = leaveRejectModal.leave;
    const reason = leaveRejectModal.reason.trim();
    setLeaveRejectModal(null);
    setUpdatingLeaveId(leave.id);
    const payload = {
      admin_approved: false,
      approved_by: null,
      rejection_reason: reason,
      status: "Rejected",
    };
    const { error } = await supabase
      .from("leaves")
      .update(payload)
      .eq("id", leave.id);
    setUpdatingLeaveId(null);
    if (error) {
      showToast("error", "Failed to reject leave. " + error.message);
      return;
    }
    setAllLeaves((prev) =>
      prev.map((item) =>
        item.id === leave.id ? { ...item, ...payload } : item,
      ),
    );
    showToast("success", "Leave rejected.");
  };

  if (!user)
    return (
      <h2 style={{ textAlign: "center", marginTop: 80, color: "#94a3b8" }}>
        Loading…
      </h2>
    );

const activeItem = [
    ...NAV_ITEMS,
    ...REPORTS_NAV,
    ...VERIFICATION_NAV,
    ...TICKETS_NAV,
  ].find((n) => n.key === activeTab);

  const pending = allTasks.filter((t) => t.status === "pending").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const completed = allTasks.filter((t) => t.status === "completed").length;

  const todayStr = new Date().toISOString().split("T")[0];
  const overdueTasks = allTasks.filter(
    (t) => t.due_date && t.due_date < todayStr && t.status !== "completed",
  );
  const unseenOverdueCount = overdueTasks.filter(
    (t) => !seenOverdueIds.includes(t.id),
  ).length;

  const leaveTotal = allLeaves.length;
  const leavePending = allLeaves.filter(
    (l) => computeLeaveStatus(l) === "pending",
  ).length;
  const leavePendingForAdmin = allLeaves.filter(
    (l) => computeLeaveStatus(l) === "pending" && !isSiteEngineerLeave(l),
  ).length;
  const leaveApproved = allLeaves.filter(
    (l) => computeLeaveStatus(l) === "approved",
  ).length;
  const leaveRejected = allLeaves.filter(
    (l) => computeLeaveStatus(l) === "rejected",
  ).length;
  const reschedPending = allReschedules.filter(
    (r) => r.status === "pending",
  ).length;
  const recentLeaves = allLeaves.slice(0, 4);
  const verificationsPending = pendingVerifications.filter(
    (v) => v.status === "pending",
  );
  const verificationsCompleted = pendingVerifications.filter(
    (v) => v.status === "completed",
  );
  const verificationsCorrection = pendingVerifications.filter(
    (v) => v.status === "correction_sent",
  );

  const taskForVerification = (v) => allTasks.find((t) => t.id === v.task_id);
  // Filtered tasks for the all-tasks tab
  const baseAllTasks = showRecurringInAllTasks
    ? allTasks
    : allTasks.filter((t) => !t.is_recurring && !t.parent_task_id);
  const filteredTasks = applyTaskFilters(baseAllTasks, taskFilters);
  const hasActiveFilters = Object.values(taskFilters).some((v) => v !== "");
  // Replace the 4 lines that compute tfSites/tfPriorities/tfStatuses/tfAssignees:

  // Each filter sees data filtered by everything EXCEPT itself
  const tasksForSites = applyTaskFilters(baseAllTasks, {
    ...taskFilters,
    site: "",
  });
  const tasksForPriorities = applyTaskFilters(baseAllTasks, {
    ...taskFilters,
    priority: "",
  });
  const tasksForStatuses = applyTaskFilters(baseAllTasks, {
    ...taskFilters,
    status: "",
  });
  const tasksForAssignees = applyTaskFilters(baseAllTasks, {
    ...taskFilters,
    assignedTo: "",
  });

  const tfSites = [
    ...new Set(tasksForSites.map((t) => t.site_name).filter(Boolean)),
  ].sort();
  const tfPriorities = [
    ...new Set(tasksForPriorities.map((t) => t.priority).filter(Boolean)),
  ].sort();
  const tfStatuses = [
    ...new Set(tasksForStatuses.map((t) => t.status).filter(Boolean)),
  ].sort();
  const tfAssignees = [
    ...new Set(tasksForAssignees.map((t) => t.assigned_to).filter(Boolean)),
  ].sort();

  const recurringTasks = allTasks.filter((t) => t.is_recurring);

  const filteredRecurring = recurringTasks.filter((t) => {
    if (recurringFilters.site && t.site_name !== recurringFilters.site)
      return false;
    if (
      recurringFilters.assignedTo &&
      t.assigned_to !== recurringFilters.assignedTo
    )
      return false;
    if (
      recurringFilters.recurrence &&
      t.recurrence !== recurringFilters.recurrence
    )
      return false;
    if (recurringFilters.dueSoon) {
      const nextDateStr = getNextDueDate(t.due_date, t.recurrence);  // ← fixed
      if (!nextDateStr) return false;
      const next = new Date(nextDateStr + "T00:00:00");
      const diff = Math.round(
        (next - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24),
      );
      if (diff > 7) return false;
    }
    return true;
  });

  const rfSites = [
    ...new Set(recurringTasks.map((t) => t.site_name).filter(Boolean)),
  ].sort();
  const rfAssignees = [
    ...new Set(recurringTasks.map((t) => t.assigned_to).filter(Boolean)),
  ].sort();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <div className="ap-stats-row">
              <StatCard
                label="Total Tasks"
                value={total}
                accent="#2563eb"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                }
              />
              <StatCard
                label="Pending"
                value={pending}
                accent="#f59e0b"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                }
              />
              <StatCard
                label="In Progress"
                value={inProgress}
                accent="#6366f1"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                }
              />
              <StatCard
                label="Completed"
                value={completed}
                accent="#16a34a"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                }
              />
              <StatCard
                label="Pending Admin Leaves"
                value={leavePendingForAdmin}
                accent="#dc2626"
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              />
            </div>
            <div className="ap-leave-summary">
              <div>
                <span>Total leave requests</span>
                <strong>{leaveTotal}</strong>
              </div>
              <div>
                <span>Approved</span>
                <strong>{leaveApproved}</strong>
              </div>
              <div>
                <span>Rejected</span>
                <strong>{leaveRejected}</strong>
              </div>
              <div>
                <span>Pending admin action</span>
                <strong>{leavePendingForAdmin}</strong>
              </div>
            </div>
            {recentLeaves.length > 0 && (
              <div className="ap-recent-leaves">
                <div className="ap-section-title">Recent Leave Requests</div>
                <div className="ap-recent-list">
                  {recentLeaves.map((leave) => (
                    <div key={leave.id} className="ap-recent-leave">
                      <div>
                        <strong>
                          {leave.name || leave.user_name || "Employee"}
                        </strong>
                        <span>
                          {leave.leave_type} -{" "}
                          {formatLeaveDate(leave.from_date)} to{" "}
                          {formatLeaveDate(leave.to_date)}
                        </span>
                      </div>
                      <LeaveStatusBadge leave={leave} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="ap-dash-hint">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Recurring tasks auto-generate new instances on their scheduled
              day. If the previous instance is incomplete, the new one includes
              a warning note.
            </div>
          </>
        );
      case "assign-task":
        return (
          <TaskFormWithCheckpoints
            form={form}
            handleFormChange={handleFormChange}
            setForm={setForm}
            handleSubmit={handleSubmit}
            submitting={submitting}
            onSuccess={() => setShowTaskModal(false)}
            employees={assignableEmployees}
            sites={sites}
          />
        );

      case "all-tasks":
        return loadingTasks ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading tasks…</p>
          </div>
        ) : (
          <>
            {hasActiveFilters && (
              <p className="tf-count">
                Showing {filteredTasks.length} of {baseAllTasks.length} task
                {baseAllTasks.length !== 1 ? "s" : ""}
              </p>
            )}
            {filteredTasks.length === 0 ? (
              <div className="op-empty-state">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.3 }}
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="13" x2="13" y2="13" />
                </svg>
                <p className="op-empty-text">
                  {hasActiveFilters
                    ? "No tasks match the current filters."
                    : "No tasks found. Start by assigning one."}
                </p>
                {hasActiveFilters && (
                  <button
                    className="tf-clear"
                    style={{ marginTop: 4 }}
                    onClick={() => setTaskFilters({ ...EMPTY_TASK_FILTERS })}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead>
                      <tr>
                        {[
                          "Title",
                          "Assigned To",
                          "Site",
                          "Given By",
                          "Priority",
                          "Status",
                          "Due Date",
                          "Hours",
                          "Schedule",
                          "",
                        ].map((h) => (
                          <th key={h} className="ap-th">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((t) => (
                        <TaskRow
                          key={t.id}
                          task={t}
                          onDelete={handleDelete}
                          userMap={userMap}
                          onClick={setDetailTask}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="ap-task-mobile-grid">
                  {filteredTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onDelete={handleDelete}
                      onOpenDetail={setDetailTask}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        );

      case "recurring-tasks":
        return (
          <>
            {/* Header row: count + filter icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
                gap: 10,
              }}
            >
              <p className="tf-count" style={{ margin: 0 }}>
                {filteredRecurring.length} of {recurringTasks.length} recurring
                task{recurringTasks.length !== 1 ? "s" : ""}
              </p>

              {/* Filter icon button (always visible, especially useful on mobile) */}
              <div style={{ position: "relative" }}>
                <button
                  className={`tf-mobile-btn recurring-mobile-filter-btn${recurringMobileFilterOpen ? " Active" : ""}`}
                  onClick={() => setRecurringMobileFilterOpen((p) => !p)}
                  title="Filter"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                  {Object.values(recurringFilters).some(
                    (v) => v !== "" && v !== false,
                  ) && <span className="tf-mobile-badge" />}
                </button>

                {/* Dropdown filter panel */}
                {recurringMobileFilterOpen && (
                  <div className="tf-popup" style={{ width: 280 }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div className="tf-group" style={{ width: "100%" }}>
                        <span className="tf-label">
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          Assignee
                        </span>
                        <select
                          className="tf-select"
                          style={{ flex: 1 }}
                          value={recurringFilters.assignedTo}
                          onChange={(e) =>
                            setRecurringFilters((p) => ({
                              ...p,
                              assignedTo: e.target.value,
                            }))
                          }
                        >
                          <option value="">All users</option>
                          {rfAssignees.map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>
                      </div>

                      {rfSites.length > 0 && (
                        <div className="tf-group" style={{ width: "100%" }}>
                          <span className="tf-label">Site</span>
                          <select
                            className="tf-select"
                            style={{ flex: 1 }}
                            value={recurringFilters.site}
                            onChange={(e) =>
                              setRecurringFilters((p) => ({
                                ...p,
                                site: e.target.value,
                              }))
                            }
                          >
                            <option value="">All sites</option>
                            {rfSites.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="tf-group" style={{ width: "100%" }}>
                        <span className="tf-label">Pattern</span>
                        <select
                          className="tf-select"
                          style={{ flex: 1 }}
                          value={recurringFilters.recurrence}
                          onChange={(e) =>
                            setRecurringFilters((p) => ({
                              ...p,
                              recurrence: e.target.value,
                            }))
                          }
                        >
                          <option value="">All patterns</option>
                          {["daily", "weekly", "monthly", "yearly"].map((r) => (
                            <option key={r} value={r}>
                              {r.charAt(0).toUpperCase() + r.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: recurringFilters.dueSoon
                            ? "#dc2626"
                            : "#64748b",
                          background: recurringFilters.dueSoon
                            ? "#fef2f2"
                            : "#f8fafc",
                          border: `1px solid ${recurringFilters.dueSoon ? "#fecaca" : "#e2e8f0"}`,
                          borderRadius: 8,
                          padding: "8px 12px",
                          transition: "all .15s",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={recurringFilters.dueSoon}
                          onChange={(e) =>
                            setRecurringFilters((p) => ({
                              ...p,
                              dueSoon: e.target.checked,
                            }))
                          }
                          style={{
                            accentColor: "#dc2626",
                            width: 14,
                            height: 14,
                          }}
                        />
                        Due within 7 days
                      </label>

                      {Object.values(recurringFilters).some(
                        (v) => v !== "" && v !== false,
                      ) && (
                        <button
                          className="tf-clear"
                          style={{
                            width: "100%",
                            justifyContent: "center",
                            marginLeft: 0,
                          }}
                          onClick={() => {
                            setRecurringFilters({ ...EMPTY_RECURRING_FILTERS });
                            setRecurringMobileFilterOpen(false);
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop filter bar — hidden on mobile via CSS */}
            <div
              className="tf-bar recurring-desktop-bar"
              style={{
                marginBottom: 16,
                position: "fixed",
                top: "120px",
                right: "80px",
              }}
            >
              <div className="tf-group">
                <span className="tf-label">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <select
                  className="tf-select"
                  value={recurringFilters.assignedTo}
                  onChange={(e) =>
                    setRecurringFilters((p) => ({
                      ...p,
                      assignedTo: e.target.value,
                    }))
                  }
                >
                  <option value="">All users</option>
                  {rfAssignees.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tf-divider" />
              {rfSites.length > 0 && (
                <>
                  <div className="tf-group">
                    <select
                      className="tf-select"
                      value={recurringFilters.site}
                      onChange={(e) =>
                        setRecurringFilters((p) => ({
                          ...p,
                          site: e.target.value,
                        }))
                      }
                    >
                      <option value="">All sites</option>
                      {rfSites.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="tf-divider" />
                </>
              )}
              <div className="tf-group">
                <select
                  className="tf-select"
                  value={recurringFilters.recurrence}
                  onChange={(e) =>
                    setRecurringFilters((p) => ({
                      ...p,
                      recurrence: e.target.value,
                    }))
                  }
                >
                  <option value="">All patterns</option>
                  {["daily", "weekly", "monthly", "yearly"].map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="tf-divider" />
              <div className="tf-group">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: recurringFilters.dueSoon ? "#dc2626" : "#64748b",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={recurringFilters.dueSoon}
                    onChange={(e) =>
                      setRecurringFilters((p) => ({
                        ...p,
                        dueSoon: e.target.checked,
                      }))
                    }
                    style={{ accentColor: "#dc2626" }}
                  />
                  Due within 7 days
                </label>
              </div>
              {Object.values(recurringFilters).some(
                (v) => v !== "" && v !== false,
              ) && (
                <button
                  className="tf-clear"
                  onClick={() =>
                    setRecurringFilters({ ...EMPTY_RECURRING_FILTERS })
                  }
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Clear
                </button>
              )}
            </div>

            {filteredRecurring.length === 0 ? (
              <div className="op-empty-state">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.3 }}
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <p className="op-empty-text">
                  {recurringTasks.length === 0
                    ? "No recurring tasks yet. Create one from Assign Task."
                    : "No tasks match the current filters."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead>
                      <tr>
                        {[
                          "Title",
                          "Assigned To",
                          "Site",
                          "Priority",
                          "Pattern",
                          "Next Due",
                          "",
                        ].map((h) => (
                          <th key={h} className="ap-th">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecurring.map((task) => {
                        const nextDate = getNextDueDate(task.due_date, task.recurrence);  // ← fixed
                        const next = formatNextDue(nextDate);
                        const p =
                          PRIORITY_STYLES[task.priority] ||
                          PRIORITY_STYLES.medium;
                        return (
                          <tr key={task.id} className="ap-tr">
                            <td className="ap-td ap-td-title">
                              {task.title}
                              <div
                                style={{
                                  display: "flex",
                                  gap: 6,
                                  marginTop: 4,
                                  flexWrap: "wrap",
                                }}
                              >
                                {task.audio_url && (
                                  <a
                                    href={task.audio_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color: "#7c3aed",
                                      background: "#f5f3ff",
                                      border: "1px solid #ddd6fe",
                                      borderRadius: 5,
                                      padding: "2px 7px",
                                      textDecoration: "none",
                                    }}
                                  >
                                    <svg
                                      width="11"
                                      height="11"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                      <line x1="12" y1="19" x2="12" y2="23" />
                                      <line x1="8" y1="23" x2="16" y2="23" />
                                    </svg>
                                    Audio
                                  </a>
                                )}
                                {task.document_url && (
                                  <a
                                    href={task.document_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 4,
                                      fontSize: 11,
                                      fontWeight: 600,
                                      color: "#0369a1",
                                      background: "#f0f9ff",
                                      border: "1px solid #bae6fd",
                                      borderRadius: 5,
                                      padding: "2px 7px",
                                      textDecoration: "none",
                                    }}
                                  >
                                    <svg
                                      width="11"
                                      height="11"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    Doc
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="ap-td">{task.assigned_to}</td>
                            <td className="ap-td">{task.site_name || "—"}</td>
                            <td className="ap-td">
                              <span
                                className="ap-badge"
                                style={{ background: p.bg, color: p.color }}
                              >
                                <span
                                  className="ap-badge-dot"
                                  style={{ background: p.dot }}
                                />
                                {task.priority}
                              </span>
                            </td>
                            <td className="ap-td">
                              <span className="ap-pill-blue">
                                {anchorDescription(
                                  task.recurrence,
                                  task.recurrence_anchor,
                                ) || task.recurrence}
                              </span>
                            </td>
                            <td className="ap-td">
                              {next?.label ? (
                                <span
                                  style={{ fontSize: 13, color: "#334155" }}
                                >
                                  {next.label}
                                  {next.badge && (
                                    <span
                                      style={{
                                        marginLeft: 6,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        background: next.bg,
                                        color: next.color,
                                        borderRadius: 20,
                                        padding: "2px 7px",
                                      }}
                                    >
                                      {next.badge}
                                    </span>
                                  )}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="ap-td">
                              <button
                                className="ap-del-btn"
                                onClick={() => handleDelete(task.id)}
                                title="Delete"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14H6L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4h6v2" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="ap-task-mobile-grid">
                  <div className="ap-task-mobile-grid">
                    {filteredRecurring.map((task) => {
                      const nextDate = getNextDueDate(task.due_date, task.recurrence);  // ← fixed
                      const next = formatNextDue(nextDate);
                      const p =
                        PRIORITY_STYLES[task.priority] ||
                        PRIORITY_STYLES.medium;
                      return (
                        <RecurringTaskCard
                          key={task.id}
                          task={task}
                          next={next}
                          p={p}
                          onDelete={handleDelete}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        );
      case "leave-requests":
        return loadingLeaves ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading leaves...</p>
          </div>
        ) : allLeaves.length === 0 ? (
          <div className="op-empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.3 }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="op-empty-text">No leave requests found.</p>
          </div>
        ) : (
          <>
            <div className="ap-leave-summary ap-leave-summary-tight">
              <div style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
                <span>Total</span>
                <strong style={{ color: "#2563eb" }}>{leaveTotal}</strong>
              </div>
              <div style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                <span>Pending</span>
                <strong style={{ color: "#d97706" }}>{leavePending}</strong>
              </div>
              <div style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                <span>Admin Action</span>
                <strong style={{ color: "#dc2626" }}>
                  {leavePendingForAdmin}
                </strong>
              </div>
              <div style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                <span>Approved</span>
                <strong style={{ color: "#16a34a" }}>{leaveApproved}</strong>
              </div>
              <div style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                <span>Rejected</span>
                <strong style={{ color: "#dc2626" }}>{leaveRejected}</strong>
              </div>
            </div>
            {filteredLeaves.length === 0 ? (
              <div className="op-empty-state">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.3 }}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p className="op-empty-text">
                  No leave requests match the current filters.
                </p>
                <button
                  className="tf-clear"
                  style={{ marginTop: 4 }}
                  onClick={() =>
                    setLeaveFilters({ name: "", dateFrom: "", dateTo: "" })
                  }
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead>
                      <tr>
                        {[
                          "Employee",
                          "Site",
                          "Type",
                          "Dates",
                          "Reason",
                          "Approval",
                          "Status",
                          "Action",
                        ].map((h) => (
                          <th key={h} className="ap-th">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaves.map((leave) => (
                        <LeaveRow
                          key={leave.id}
                          leave={leave}
                          onAction={handleLeaveAction}
                          updating={updatingLeaveId}
                          roleByName={roleByName}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="ap-task-mobile-grid">
                  {filteredLeaves.map((leave) => (
                    <LeaveRequestCard
                      key={leave.id}
                      leave={leave}
                      onAction={handleLeaveAction}
                      updating={updatingLeaveId}
                      roleByName={roleByName}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        );
      case "add-employee":
        return (
          <div className="ap-form-grid">
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">
                  Full Name <span className="ap-req">*</span>
                </label>
                <input
                  className="ap-input"
                  name="name"
                  value={empForm.name}
                  onChange={handleEmpFormChange}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="ap-field">
                <label className="ap-label">
                  Username <span className="ap-req">*</span>
                </label>
                <input
                  className="ap-input"
                  name="username"
                  autoComplete="off"
                  value={empForm.username}
                  onChange={handleEmpFormChange}
                  placeholder="e.g. john.doe"
                  disabled={!!editingEmployee}
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">
                  Password <span className="ap-req">*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="ap-input"
                    type={showEmpPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    value={empForm.password}
                    onChange={handleEmpFormChange}
                    placeholder="••••••••"
                    style={{ paddingRight: 38, width: "100%" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmpPassword((v) => !v)}
                    tabIndex={-1}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                    }}
                    title={showEmpPassword ? "Hide password" : "Show password"}
                    aria-label={
                      showEmpPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showEmpPassword ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="ap-field">
                <label className="ap-label">
                  Role <span className="ap-req">*</span>
                </label>
                <input
                  className="ap-input"
                  name="role"
                  value={empForm.role}
                  onChange={handleEmpFormChange}
                  placeholder="e.g. Site Engineer"
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">
                  Department <span className="ap-req">*</span>
                </label>
                <select
                  className="ap-input ap-select"
                  name="department"
                  value={empForm.department}
                  onChange={handleEmpFormChange}
                >
                  <option value="">Select department…</option>
                  <option value="admin">Admin</option>
                  <option value="site engineer">Site Engineer</option>
                  <option value="project head">Project Head</option>
                  <option value="engineer office">Engineer Office</option>
                  <option value="mdo office">MDO Office</option>
                  <option value="hr">HR</option>
                  <option value="client">Client</option>
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">Site(s) Assigned</label>
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "8px 10px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    minHeight: 42,
                  }}
                >
                  {empForm.site_names.length === 0 && (
                    <span
                      style={{
                        fontSize: 12.5,
                        color: "#94a3b8",
                        padding: "3px 2px",
                      }}
                    >
                      No sites assigned yet
                    </span>
                  )}
                  {empForm.site_names.map((s) => (
                    <span
                      key={s}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        borderRadius: 6,
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: "2px 8px",
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() =>
                          setEmpForm((p) => ({
                            ...p,
                            site_names: p.site_names.filter((x) => x !== s),
                          }))
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#2563eb",
                          padding: 0,
                          lineHeight: 1,
                          fontSize: 13,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <select
                  className="ap-input ap-select"
                  value=""
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !empForm.site_names.includes(val)) {
                      setEmpForm((p) => ({
                        ...p,
                        site_names: [...p.site_names, val],
                      }));
                    }
                  }}
                >
                  <option value="">+ Add a site…</option>
                  {sites
                    .filter((s) => !empForm.site_names.includes(s.site_name))
                    .map((s) => (
                      <option key={s.id} value={s.site_name}>
                        {s.site_name}
                      </option>
                    ))}
                </select>

                <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  Select a site to add it. Click the × on a chip to remove.
                </span>
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Status</label>
                <select
                  className="ap-input ap-select"
                  name="status"
                  value={empForm.status}
                  onChange={handleEmpFormChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="ap-form-row ap-col-1 ap-form-actions">
              {editingEmployee ? (
                <button
                  className="ap-btn-secondary"
                  onClick={() => {
                    setEmpForm({
                      name: "",
                      username: "",
                      password: "",
                      role: "",
                      department: "",
                      site_name: "",
                      site_names: [],
                      status: "active",
                    });
                    setEditingEmployee(null);
                    setActiveTab("manage-employees");
                  }}
                >
                  Cancel
                </button>
              ) : (
                <button
                  className="ap-btn-secondary"
                  onClick={() => {
                    setEmpForm({
                      name: "",
                      username: "",
                      password: "",
                      role: "",
                      department: "",
                      site_name: "",
                      site_names: [],
                      status: "active",
                    });
                  }}
                >
                  Reset
                </button>
              )}
              <button
                className="ap-btn-primary"
                onClick={handleEmpSubmit}
                disabled={empSubmitting}
              >
                {empSubmitting ? (
                  <>
                    <span className="ap-mini-spinner" /> Saving…
                  </>
                ) : editingEmployee ? (
                  "Update Employee"
                ) : (
                  "Add Employee"
                )}
              </button>
            </div>
          </div>
        );

      case "manage-employees":
        return loadingEmployees ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading employees…</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="op-empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.3 }}
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <p className="op-empty-text">No employees found.</p>
            <button
              className="ap-btn-primary"
              style={{ marginTop: 4 }}
              onClick={() => setActiveTab("add-employee")}
            >
              Add Employee
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    {[
                      "#",
                      "Name",
                      "Username",
                      "Role",
                      "Department",
                      "Site",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="ap-th">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, idx) => (
                    <tr key={emp.id} className="ap-tr">
                      <td
                        className="ap-td"
                        style={{ color: "#94a3b8", fontSize: 12 }}
                      >
                        {idx + 1}
                      </td>
                      <td className="ap-td ap-td-title">{emp.name || "—"}</td>
                      <td
                        className="ap-td"
                        style={{
                          fontFamily: "'DM Mono',monospace",
                          fontSize: 12.5,
                        }}
                      >
                        {emp.username || "—"}
                      </td>
                      <td className="ap-td">
                        {emp.role ? (
                          <span className="ap-pill-blue">
                            {(emp.role || "").toUpperCase()}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td className="ap-td">{emp.department || "—"}</td>
                      <td className="ap-td">
                        {(emp.site_names?.length > 0
                          ? emp.site_names
                          : emp.site_name
                            ? [emp.site_name]
                            : []
                        ).map((s) => (
                          <span
                            key={s}
                            className="ap-pill-blue"
                            style={{ marginRight: 4, marginBottom: 2 }}
                          >
                            {s.toUpperCase()}
                          </span>
                        ))}
                        {!emp.site_names?.length && !emp.site_name && (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td className="ap-td">
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background:
                              emp.status === "Active" ? "#f0fdf4" : "#fef2f2",
                            color:
                              emp.status === "Active" ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {emp.status || "—"}
                        </span>
                      </td>
                      <td className="ap-td">
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="ap-edit-btn"
                            onClick={() => handleEmpEdit(emp)}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="ap-del-btn"
                            onClick={() => handleEmpDelete(emp.id)}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="ap-task-mobile-grid">
              {filteredEmployees.map((emp) => (
                <div key={emp.id} className="ap-task-card-mobile">
                  <div className="ap-task-card-head">
                    <div>
                      <div className="ap-task-card-title">{emp.name}</div>
                      <div
                        className="ap-task-card-sub"
                        style={{ fontFamily: "'DM Mono',monospace" }}
                      >
                        {emp.user_name}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="ap-edit-btn"
                        onClick={() => handleEmpEdit(emp)}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="ap-del-btn"
                        onClick={() => handleEmpDelete(emp.id)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="ap-task-card-meta">
                    <div>
                      <span>Department</span>
                      <strong>{emp.department || "—"}</strong>
                    </div>
                    <div>
                      <span>Designation</span>
                      <strong>{emp.designation || "—"}</strong>
                    </div>
                    <div>
                      <span>Sites</span>
                      <strong>
                        {(emp.site_names?.length
                          ? emp.site_names
                          : emp.site_name
                            ? [emp.site_name]
                            : []
                        ).join(", ") || "—"}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case "add-site":
        return (
          <div className="ap-form-grid">
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">
                  Site Name <span className="ap-req">*</span>
                </label>
                <input
                  className="ap-input"
                  name="site_name"
                  value={siteForm.site_name}
                  onChange={handleSiteFormChange}
                  placeholder="e.g. Bhagyashree Warehouse"
                />
              </div>
              <div className="ap-field">
                <label className="ap-label">Assigned User</label>
                <select
                  className="ap-input ap-select"
                  name="user_name"
                  value={siteForm.user_name}
                  onChange={handleSiteFormChange}
                >
                  <option value="">Select employee…</option>
                  {employees.map((e) => (
                    <option key={e.username} value={e.username}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Role</label>
                <select
                  className="ap-input ap-select"
                  name="role"
                  value={siteForm.role}
                  onChange={handleSiteFormChange}
                >
                  <option value="">Select role…</option>
                  <option value="admin">Admin</option>
                  <option value="site engineer">Site Engineer</option>
                  <option value="project head">Project Head</option>
                  <option value="engineer office">Engineer Office</option>
                  <option value="mdo office">MDO Office</option>
                  <option value="hr">HR</option>
                  <option value="client">Client</option>
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">
                  Job No.
                  <span
                    className="ap-optional"
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#94a3b8",
                      background: "#f1f5f9",
                      borderRadius: 4,
                      padding: "1px 6px",
                      marginLeft: 6,
                    }}
                  >
                    auto-generated
                  </span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    className="ap-input"
                    name="job_no"
                    value={siteForm.job_no}
                    onChange={handleSiteFormChange}
                    placeholder="e.g. DIP-001|2026|SiteName"
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 12.5,
                    }}
                  />
                  <button
                    type="button"
                    className="ap-btn-secondary"
                    style={{ flexShrink: 0, padding: "0 14px" }}
                    onClick={regenerateJobNo}
                    disabled={!siteForm.site_name.trim()}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    >
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Started Date</label>
                <input
                  className="ap-input"
                  type="date"
                  name="started_date"
                  value={siteForm.started_date}
                  onChange={handleSiteFormChange}
                />
              </div>
              <div className="ap-field">
                <label className="ap-label">Client Name</label>
                <input
                  className="ap-input"
                  name="client_name"
                  value={siteForm.client_name}
                  onChange={handleSiteFormChange}
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Head Name</label>
                <select
                  className="ap-input ap-select"
                  name="head_name"
                  value={siteForm.head_name}
                  onChange={handleSiteFormChange}
                >
                  <option value="">Select…</option>
                  {employees.map((e) => (
                    <option key={e.username} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">Head Contact No.</label>
                <input
                  className="ap-input"
                  name="head_contact_no"
                  value={siteForm.head_contact_no}
                  onChange={handleSiteFormChange}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">Co-ordinator Name</label>
                <select
                  className="ap-input ap-select"
                  name="coordinator_name"
                  value={siteForm.coordinator_name}
                  onChange={handleSiteFormChange}
                >
                  <option value="">Select…</option>
                  {employees.map((e) => (
                    <option key={e.username} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">Co-ordinator Contact No.</label>
                <input
                  className="ap-input"
                  name="coordinator_contact_no"
                  value={siteForm.coordinator_contact_no}
                  onChange={handleSiteFormChange}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">PC Name</label>
                <select
                  className="ap-input ap-select"
                  name="pc_name"
                  value={siteForm.pc_name}
                  onChange={handleSiteFormChange}
                >
                  <option value="">Select…</option>
                  {pcEmployees.map((e) => (
                    <option key={e.username} value={e.name}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ap-field">
                <label className="ap-label">PC Contact No.</label>
                <input
                  className="ap-input"
                  name="pc_contact_no"
                  value={siteForm.pc_contact_no}
                  onChange={handleSiteFormChange}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>
            <div className="ap-form-row ap-col-2">
              <div className="ap-field">
                <label className="ap-label">
                  Site Image
                  <span
                    className="ap-optional"
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#94a3b8",
                      background: "#f1f5f9",
                      borderRadius: 4,
                      padding: "1px 6px",
                      marginLeft: 6,
                    }}
                  >
                    optional
                  </span>
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "8px 12px",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    style={{
                      flex: 1,
                      fontSize: 12.5,
                      color: "#475569",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      cursor: "pointer",
                    }}
                    onChange={(e) =>
                      setSiteForm((p) => ({
                        ...p,
                        _imageFile: e.target.files[0] || null,
                      }))
                    }
                  />
                </div>
                {siteForm._imageFile && (
                  <span style={{ fontSize: 11.5, color: "#16a34a" }}>
                    ✓ {siteForm._imageFile.name}
                  </span>
                )}
                {!siteForm._imageFile && siteForm.site_image_url && (
                  <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                    Current: {siteForm.site_image_url}
                  </span>
                )}
                <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  Uploads to a bucket named after the site, inside SiteImg/.
                </span>
              </div>
              <div className="ap-field">
                <label className="ap-label">Status</label>
                <select
                  className="ap-input ap-select"
                  name="status"
                  value={siteForm.status}
                  onChange={handleSiteFormChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="ap-form-row ap-col-1 ap-form-actions">
              {editingSite ? (
                <button
                  className="ap-btn-secondary"
                  onClick={() => {
                    setSiteForm({ ...EMPTY_SITE_FORM });
                    setEditingSite(null);
                    setActiveTab("manage-sites");
                  }}
                >
                  Cancel
                </button>
              ) : (
                <button
                  className="ap-btn-secondary"
                  onClick={() => setSiteForm({ ...EMPTY_SITE_FORM })}
                >
                  Reset
                </button>
              )}
              <button
                className="ap-btn-primary"
                onClick={handleSiteSubmit}
                disabled={siteSubmitting}
              >
                {siteSubmitting ? (
                  <>
                    <span className="ap-mini-spinner" />{" "}
                    {uploadingSiteImage ? "Uploading image…" : "Saving…"}
                  </>
                ) : editingSite ? (
                  "Update Site"
                ) : (
                  "Add Site"
                )}
              </button>
            </div>
          </div>
        );

      case "manage-sites":
        return loadingSites ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading sites…</p>
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="op-empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.3 }}
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <p className="op-empty-text">No sites found.</p>
            <button
              className="ap-btn-primary"
              style={{ marginTop: 4 }}
              onClick={() => setActiveTab("add-site")}
            >
              Add Site
            </button>
          </div>
        ) : (
          <>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    {[
                      "#",
                      "Site Name",
                      "Assigned User",
                      "Role",
                      "Job No.",
                      "Started",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="ap-th">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSites.map((site, idx) => (
                    <tr key={site.id} className="ap-tr">
                      <td
                        className="ap-td"
                        style={{ color: "#94a3b8", fontSize: 12 }}
                      >
                        {idx + 1}
                      </td>
                      <td className="ap-td ap-td-title">
                        {site.site_name || "—"}
                      </td>
                      <td className="ap-td">
                        {nameFor(userMap, site.user_name)}
                      </td>
                      <td className="ap-td">
                        {site.role ? (
                          <span className="ap-pill-blue">{site.role}</span>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>—</span>
                        )}
                      </td>
                      <td
                        className="ap-td"
                        style={{
                          fontFamily: "'DM Mono',monospace",
                          fontSize: 12,
                        }}
                      >
                        {site.job_no || "—"}
                      </td>
                      <td className="ap-td">
                        {site.started_date
                          ? new Date(
                              site.started_date + "T00:00:00",
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="ap-td">
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background:
                              site.status === "Active" ? "#f0fdf4" : "#fef2f2",
                            color:
                              site.status === "Active" ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {site.status || "—"}
                        </span>
                      </td>
                      <td className="ap-td">
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="ap-edit-btn"
                            onClick={() => handleSiteEdit(site)}
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            className="ap-del-btn"
                            onClick={() => handleSiteDelete(site.id)}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ap-task-mobile-grid">
              {filteredSites.map((site) => (
                <div key={site.id} className="ap-task-card-mobile">
                  <div className="ap-task-card-head">
                    <div>
                      <div className="ap-task-card-title">{site.site_name}</div>
                      <div className="ap-task-card-sub">
                        {nameFor(userMap, site.user_name)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="ap-edit-btn"
                        onClick={() => handleSiteEdit(site)}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="ap-del-btn"
                        onClick={() => handleSiteDelete(site.id)}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="ap-task-card-meta">
                    <div>
                      <span>Role</span>
                      <strong>{site.role || "—"}</strong>
                    </div>
                    <div>
                      <span>Job No.</span>
                      <strong>{site.job_no || "—"}</strong>
                    </div>
                    <div>
                      <span>Client</span>
                      <strong>{site.client_name || "—"}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{site.status || "—"}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case "reschedule-requests":
        return loadingReschedules ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading reschedule requests…</p>
          </div>
        ) : allReschedules.length === 0 ? (
          <div className="op-empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.3 }}
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <p className="op-empty-text">No reschedule requests found.</p>
          </div>
        ) : (
          <>
            <div className="ap-leave-summary ap-leave-summary-tight">
              <div style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
                <span>Total</span>
                <strong style={{ color: "#2563eb" }}>
                  {allReschedules.length}
                </strong>
              </div>
              <div style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                <span>Pending</span>
                <strong style={{ color: "#d97706" }}>{reschedPending}</strong>
              </div>
              <div style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                <span>Approved</span>
                <strong style={{ color: "#16a34a" }}>
                  {allReschedules.filter((r) => r.status === "approved").length}
                </strong>
              </div>
              <div style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                <span>Rejected</span>
                <strong style={{ color: "#dc2626" }}>
                  {allReschedules.filter((r) => r.status === "rejected").length}
                </strong>
              </div>
            </div>
            {/* Desktop table */}
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr>
                    {[
                      "Requested By",
                      "Task",
                      "Current Due",
                      "Requested Date",
                      "Reason",
                      "Status",
                      "",
                    ].map((h) => (
                      <th key={h} className="ap-th">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                {/* Desktop table */}
                <tbody>
                  {filteredReschedules.map((req) => (
                    <RescheduleRow
                      key={req.id}
                      req={req}
                      onAction={handleRescheduleAction}
                      updating={updatingRescheduleId}
                      userMap={userMap}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="ap-task-mobile-grid">
              {filteredReschedules.map((req) => (
                <RescheduleRequestCard
                  key={req.id}
                  req={req}
                  onAction={handleRescheduleAction}
                  updating={updatingRescheduleId}
                  roleByName={roleByName}
                  userMap={userMap}
                />
              ))}
            </div>
          </>
        );
      case "site-report":
        return <SiteReport user={user} />;

      case "my-reports":
        if (loadingSvrReports)
          return (
            <div className="op-empty-state">
              <div className="op-spinner" />
              <p className="op-empty-text">Loading your reports…</p>
            </div>
          );
        if (!mySvrReports.length)
          return (
            <div className="op-empty-state">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.3 }}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p className="op-empty-text">
                You haven't submitted any Site Visit Reports yet.
              </p>
            </div>
          );
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: 12,
            }}
          >
            {mySvrReports.map((r) => (
              <div
                key={r.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e8edf3",
                  borderLeft: "4px solid #16a34a",
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 20,
                      background: "#f0fdf4",
                      color: "#16a34a",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    Site Visit
                  </span>
                  {r.site_name && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        fontWeight: 600,
                      }}
                    >
                      {r.site_name}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: "#64748b" }}>
                  {r.visit_date
                    ? new Date(r.visit_date + "T00:00:00").toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" },
                      )
                    : "—"}
                </div>
                {r.progress_of_work && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      lineHeight: 1.5,
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {r.progress_of_work}
                  </p>
                )}
                {r.pdf_url ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <a
                      href={getViewUrl(r.pdf_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#475569",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 7,
                        padding: "6px 12px",
                        textDecoration: "none",
                      }}
                    >
                      View
                    </a>
                    <a
                      href={buildDownloadUrl(
                        r.pdf_url,
                        `${r.site_name || "site"}-SVR-${r.visit_date || r.id}.pdf`,
                      )}
                      download
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#2563eb",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: 7,
                        padding: "6px 12px",
                        textDecoration: "none",
                      }}
                    >
                      Download
                    </a>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: 11,
                      color: "#94a3b8",
                      fontStyle: "italic",
                    }}
                  >
                    No PDF attached
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      case "report-submissions": {
        if (user?.role?.toLowerCase().trim() !== "admin") return null;
        const filteredSubmissions = applySubmissionFilters(
          allSubmissions,
          submissionFilters,
        );
        const hasSubFilters = Object.values(submissionFilters).some(
          (v) => v !== "",
        );

        return loadingSubmissions ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading report submissions…</p>
          </div>
        ) : (
          <>
            {hasSubFilters && (
              <p className="tf-count">
                Showing {filteredSubmissions.length} of {allSubmissions.length}{" "}
                report
                {allSubmissions.length !== 1 ? "s" : ""}
              </p>
            )}

            {filteredSubmissions.length === 0 ? (
              <div className="op-empty-state">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.3 }}
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p className="op-empty-text">No report submissions found.</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="ap-table-wrap">
                  <table className="ap-table">
                    <thead>
                      <tr>
                        {[
                          "Site Name",
                          "Engineer Name",
                          "Submission Date",
                          "Report Type",
                          "Action",
                        ].map((h) => (
                          <th key={h} className="ap-th">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((r) => (
                        <tr key={r.id} className="ap-tr">
                          <td className="ap-td ap-td-title">{r.site || "—"}</td>
                          <td className="ap-td">{r.engineer || "—"}</td>
                          <td className="ap-td">
                            {formatSubmissionDate(r.date)}
                          </td>
                          <td className="ap-td">
                            <span className="ap-pill-blue">
                              {r.report_type}
                            </span>
                          </td>
                          <td className="ap-td">
                            {r.pdf_url ? (
                              <div style={{ display: "flex", gap: 6 }}>
                                <a
                                  href={getViewUrl(r.pdf_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    color: "#475569",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 6,
                                    padding: "4px 10px",
                                    textDecoration: "none",
                                  }}
                                >
                                  View
                                </a>

                                <a
                                  href={buildDownloadUrl(
                                    r.pdf_url,
                                    `${r.site || "site"}-${r.report_type}-${r.date || r.id}.${getFileExt(r.pdf_url)}`,
                                  )}
                                  download
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    color: "#2563eb",
                                    background: "#eff6ff",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: 6,
                                    padding: "4px 10px",
                                    textDecoration: "none",
                                  }}
                                >
                                  Download
                                </a>
                              </div>
                            ) : (
                              <span
                                style={{
                                  fontSize: 11.5,
                                  color: "#94a3b8",
                                  fontStyle: "italic",
                                }}
                              >
                                No file
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="ap-task-mobile-grid">
                  {filteredSubmissions.map((r) => (
                    <div key={r.id} className="ap-task-card-mobile">
                      <div className="ap-task-card-head">
                        <div>
                          <div className="ap-task-card-title">
                            {r.site || "—"}
                          </div>
                          <div className="ap-task-card-sub">
                            {r.engineer || "—"}
                          </div>
                        </div>
                        <span className="ap-pill-blue">{r.report_type}</span>
                      </div>
                      <div className="ap-task-card-meta">
                        <div>
                          <span>Submission Date</span>
                          <strong>{formatSubmissionDate(r.date)}</strong>
                        </div>
                        <div>
                          <span>File</span>
                          <strong>
                            {r.pdf_url
                              ? getFileExt(r.pdf_url).toUpperCase()
                              : "None"}
                          </strong>
                        </div>
                      </div>
                      {r.pdf_url ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <a
                            href={getViewUrl(r.pdf_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              flex: 1,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: "#475569",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: 7,
                              padding: "8px 12px",
                              textDecoration: "none",
                            }}
                          >
                            View
                          </a>

                          <a
                            href={buildDownloadUrl(
                              r.pdf_url,
                              `${r.site || "site"}-${r.report_type}-${r.date || r.id}.${getFileExt(r.pdf_url)}`,
                            )}
                            download
                            style={{
                              flex: 1,
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              fontSize: 12.5,
                              fontWeight: 600,
                              color: "#2563eb",
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe",
                              borderRadius: 7,
                              padding: "8px 12px",
                              textDecoration: "none",
                            }}
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        <span
                          style={{
                            fontSize: 11.5,
                            color: "#94a3b8",
                            fontStyle: "italic",
                          }}
                        >
                          No file attached
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        );
      }
      case "new-tickets": {
        const openTickets = allTickets.filter((t) => t.status === "open");
        return loadingTickets ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading tickets…</p>
          </div>
        ) : openTickets.length === 0 ? (
          <div className="op-empty-state">
            <p className="op-empty-text">No open tickets.</p>
          </div>
        ) : (
          <AdminTicketsTable
            tickets={openTickets}
            updatingId={updatingTicketId}
            onSolve={(t) =>
              setTicketSolveModal({ ticket: t, note: "", file: null })
            }
          />
        );
      }

      case "solved-ticket": {
        const solvedTickets = allTickets.filter((t) => t.status === "solved");
        return loadingTickets ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading tickets…</p>
          </div>
        ) : solvedTickets.length === 0 ? (
          <div className="op-empty-state">
            <p className="op-empty-text">No solved tickets yet.</p>
          </div>
        ) : (
          <AdminTicketsTable tickets={solvedTickets} showAction={false} />
        );
      }

      case "pending-verification":
        return loadingVerifications ? (
          <div className="op-empty-state">
            <div className="op-spinner" />
            <p className="op-empty-text">Loading verification requests…</p>
          </div>
        ) : verificationsPending.length === 0 ? (
          <div className="op-empty-state">
            <p className="op-empty-text">No tasks pending verification.</p>
          </div>
        ) : (
          <VerificationTable
            verifications={verificationsPending}
            allTasks={allTasks}
            userMap={userMap}
            onComplete={handleMarkVerificationCompleted}
            onCorrect={openCorrectionModal}
            updatingId={updatingVerificationId}
            onRowClick={(v, task) => setVerificationDetail({ v, task })}
            currentUser={user.user_name}
          />
        );

      case "approved-verification":
        return verificationsCompleted.length === 0 ? (
          <div className="op-empty-state">
            <p className="op-empty-text">No completed verifications yet.</p>
          </div>
        ) : (
          <VerificationTable
            verifications={verificationsCompleted}
            allTasks={allTasks}
            userMap={userMap}
            onComplete={handleMarkVerificationCompleted}
            onCorrect={openCorrectionModal}
            updatingId={updatingVerificationId}
            showAction={false}
          />
        );

      case "rejected-verification":
        return verificationsCorrection.length === 0 ? (
          <div className="op-empty-state">
            <p className="op-empty-text">No corrections sent yet.</p>
          </div>
        ) : (
          <VerificationTable
            verifications={verificationsCorrection}
            allTasks={allTasks}
            userMap={userMap}
            onComplete={handleMarkVerificationCompleted}
            onCorrect={openCorrectionModal}
            updatingId={updatingVerificationId}
            showAction={false}
          />
        );
        
        case "overdue-tasks":
  return overdueTasks.length === 0 ? (
    <div className="op-empty-state">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.3 }}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <p className="op-empty-text">
        No overdue tasks. Everything is on schedule.
      </p>
    </div>
  ) : (
    <>
      <p className="tf-count">
        {overdueTasks.length} task{overdueTasks.length !== 1 ? "s" : ""} past
        due and not yet completed
      </p>

      <div className="ap-table-wrap">
        <table className="ap-table">
          <thead>
            <tr>
              {[
                "Title",
                "Assigned To",
                "Site",
                "Given By",
                "Priority",
                "Status",
                "Hours",
                "Due Date",
                "Overdue By",
                "Files",
                "Action",
              ].map((h) => (
                <th key={h} className="ap-th">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {overdueTasks.map((t) => {
              const p = PRIORITY_STYLES[t.priority] || PRIORITY_STYLES.medium;
              const s = STATUS_STYLES[t.status] || STATUS_STYLES.pending;
              const daysOverdue = Math.floor(
                (new Date(todayStr) - new Date(t.due_date)) / 86400000,
              );
              return (
                <tr key={t.id} className="ap-tr">
                  <td className="ap-td ap-td-title">
                    {t.title}
                    {t.description && (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "#94a3b8",
                          marginTop: 2,
                        }}
                      >
                        {t.description}
                      </div>
                    )}
                  </td>
                  <td className="ap-td">{nameFor(userMap, t.assigned_to)}</td>
                  <td className="ap-td">{t.site_name || "—"}</td>
                  <td className="ap-td">{nameFor(userMap, t.assigned_by)}</td>
                  <td className="ap-td">
                    <span
                      className="ap-badge"
                      style={{ background: p.bg, color: p.color }}
                    >
                      <span
                        className="ap-badge-dot"
                        style={{ background: p.dot }}
                      />
                      {t.priority}
                    </span>
                  </td>
                  <td className="ap-td">
                    <span
                      className="ap-badge"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {t.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="ap-td">
                    {t.hours_to_complete ? `${t.hours_to_complete} hrs` : "—"}
                  </td>
                  <td className="ap-td" style={{ color: "#dc2626", fontWeight: 600 }}>
                    {new Date(t.due_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="ap-td">
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: "#fef2f2",
                        color: "#dc2626",
                      }}
                    >
                      {daysOverdue} day{daysOverdue !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="ap-td">
                    <div style={{ display: "flex", gap: 8 }}>
                      {t.audio_url && (
                        
                        <a  href={t.audio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Audio instruction"
                          style={{ color: "#7c3aed" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          </svg>
                        </a>
                      )}
                      {t.document_url && (
                        
                        <a  href={t.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Document"
                          style={{ color: "#2563eb" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </a>
                      )}
                      {!t.audio_url && !t.document_url && (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </div>
                  </td>
                  <td className="ap-td">
                    <button
                      className="ap-btn-approve"
                      style={{ padding: "5px 10px", fontSize: 11.5 }}
                      onClick={() =>
                        setOverdueRescheduleModal({ task: t, newDate: t.due_date })
                      }
                    >
                      Reschedule
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="ap-task-mobile-grid">
        {overdueTasks.map((t) => {
          const daysOverdue = Math.floor(
            (new Date(todayStr) - new Date(t.due_date)) / 86400000,
          );
          return (
            <div key={t.id} className="ap-task-card-mobile">
              <div className="ap-task-card-head">
                <div>
                  <div className="ap-task-card-title">{t.title}</div>
                  <div className="ap-task-card-sub">
                    {nameFor(userMap, t.assigned_to)} ·{" "}
                    {t.site_name || "No site"}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "#fef2f2",
                    color: "#dc2626",
                    flexShrink: 0,
                  }}
                >
                  {daysOverdue}d overdue
                </span>
              </div>
              <div className="ap-task-card-meta">
                <div>
                  <span>Priority</span>
                  <strong>{t.priority}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{t.status?.replace("_", " ")}</strong>
                </div>
                <div>
                  <span>Due Date</span>
                  <strong style={{ color: "#dc2626" }}>
                    {new Date(t.due_date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </div>
                <div>
                  <span>Given By</span>
                  <strong>{nameFor(userMap, t.assigned_by)}</strong>
                </div>
              </div>
              <button
                className="ap-btn-approve"
                style={{ width: "100%" }}
                onClick={() =>
                  setOverdueRescheduleModal({ task: t, newDate: t.due_date })
                }
              >
                Reschedule Due Date
              </button>
            </div>
          );
        })}
      </div>
    </>
  );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="op-root">
        <Navbar
          onMenuToggle={() => setSidebarOpen((p) => !p)}
          menuOpen={sidebarOpen}
        />

        {toast && (
          <div className={`ap-toast ap-toast-${toast.type}`}>
            {toast.type === "success" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {toast.msg}
          </div>
        )}

        <div className="op-body">
          {sidebarOpen && (
            <button
              className="op-sidebar-backdrop"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <aside className={`op-sidebar${sidebarOpen ? "" : " collapsed"}`}>
            <div className="op-sidebar-header">
              {canSwitchToOffice && (
                <button
                  onClick={() => window.location.assign("/office")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#eb2525",
                    background: "#fef2f2",
                    border: "1px solid #f88a8abe",
                    borderRadius: 8,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                  title="Switch to Office view"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M8 3L4 7l4 4" />
                    <path d="M4 7h16" />
                    <path d="M16 21l4-4-4-4" />
                    <path d="M20 17H4" />
                  </svg>
                  Switch to Office
                </button>
              )}

              <button
                className="op-sidebar-close"
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="op-nav">
              {filterNav(NAV_ITEMS.slice(0, 6), user, "admin").map((item) => (
                <button
                  key={item.key}
                  className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
                  onClick={() => handleNavClick(item.key)}
                >
                  <span className="op-nav-icon">{item.icon}</span>
                  {item.label}
                  {item.key === "leave-requests" &&
                    leavePendingForAdmin > 0 && (
                      <span className="op-nav-badge">
                        {leavePendingForAdmin}
                      </span>
                    )}
                  {item.key === "reschedule-requests" && reschedPending > 0 && (
                    <span className="op-nav-badge">{reschedPending}</span>
                  )}
                </button>
              ))}
              <span className="op-nav-section">Task Verification</span>
                {filterNav(VERIFICATION_NAV, user, "admin").map((item) => (
                  <button
                    key={item.key}
                    className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
                    onClick={() => handleNavClick(item.key)}
                  >
                    <span className="op-nav-icon">{item.icon}</span>
                    {item.label}
                    {item.key === "pending-verification" &&
                      verificationsPending.length > 0 && (
                        <span className="op-nav-badge">
                          {verificationsPending.length}
                        </span>
                      )}
                    {item.key === "overdue-tasks" && unseenOverdueCount > 0 && (
                      <span className="op-nav-badge">{unseenOverdueCount}</span>
                    )} 
                  </button>
                ))}
              <span className="op-nav-section">Ticket Raised</span>
              {filterNav(TICKETS_NAV, user, "admin").map((item) => (
                <button
                  key={item.key}
                  className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
                  onClick={() => handleNavClick(item.key)}
                >
                  <span className="op-nav-icon">{item.icon}</span>
                  {item.label}
                  {item.key === "new-tickets" &&
                    allTickets.filter((t) => t.status === "open").length >
                      0 && (
                      <span className="op-nav-badge">
                        {allTickets.filter((t) => t.status === "open").length}
                      </span>
                    )}
                </button>
              ))}
              <span className="op-nav-section">Employee Management</span>
              {filterNav(NAV_ITEMS.slice(6, 8), user, "admin").map((item) => (
                <button
                  key={item.key}
                  className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
                  onClick={() => handleNavClick(item.key)}
                >
                  <span className="op-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <span className="op-nav-section">Site Management</span>
              {filterNav(NAV_ITEMS.slice(8), user, "admin").map((item) => (
                <button
                  key={item.key}
                  className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
                  onClick={() => handleNavClick(item.key)}
                >
                  <span className="op-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <span className="op-nav-section">Drawings & Reports</span>
              {filterNav(REPORTS_NAV, user, "admin").map((item) => (
                <button
                  key={item.key}
                  className={`op-nav-item${activeTab === item.key ? " Active" : ""}`}
                  onClick={() => handleNavClick(item.key)}
                >
                  <span className="op-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="op-main" ref={mainRef}>
            <div className="op-content-card">
              <div className="op-content-header">
                <div className="op-header-left">
                  <div className="op-content-icon">{activeItem?.icon}</div>
                  <span className="op-content-title">{activeItem?.label}</span>
                </div>
                {activeTab === "all-tasks" && (
                  <>
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: showRecurringInAllTasks ? "#2563eb" : "#64748b",
                        background: showRecurringInAllTasks
                          ? "#eff6ff"
                          : "#f8fafc",

                        borderRadius: 8,
                        padding: "7px 12px",
                        transition: "all .15s",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          width: 32,
                          height: 18,
                          borderRadius: 99,
                          background: showRecurringInAllTasks
                            ? "#2563eb"
                            : "#c9d0d4d0",
                          position: "relative",
                          transition: "background .2s",
                          flexShrink: 0,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={showRecurringInAllTasks}
                          onChange={(e) =>
                            setShowRecurringInAllTasks(e.target.checked)
                          }
                          style={{ display: "none" }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: 2,
                            left: showRecurringInAllTasks ? 16 : 2,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "#fff",
                            boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                            transition: "left .2s",
                          }}
                        />
                      </span>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                      Include recurring
                    </label>

                    <TaskFilterBar
                      filters={taskFilters}
                      onChange={(key, val) => {
                        setTaskFilters((prev) => {
                          const next = { ...prev, [key]: val };
                          const base = applyTaskFilters(baseAllTasks, {
                            ...next,
                          });
                          if (
                            next.site &&
                            !base.some((t) => t.site_name === next.site)
                          )
                            next.site = "";
                          if (
                            next.priority &&
                            !base.some((t) => t.priority === next.priority)
                          )
                            next.priority = "";
                          if (
                            next.status &&
                            !base.some((t) => t.status === next.status)
                          )
                            next.status = "";
                          if (
                            next.assignedTo &&
                            !base.some((t) => t.assigned_to === next.assignedTo)
                          )
                            next.assignedTo = "";
                          return next;
                        });
                      }}
                      onClear={() => setTaskFilters({ ...EMPTY_TASK_FILTERS })}
                      sites={tfSites}
                      priorities={tfPriorities}
                      statuses={tfStatuses}
                      assignees={tfAssignees}
                      inline={true}
                      mobileOpen={mobileFilterOpen}
                      onMobileToggle={() => setMobileFilterOpen((p) => !p)}
                    />
                  </>
                )}
                {activeTab === "report-submissions" && (
                  <SubmissionFilterBar
                    filters={submissionFilters}
                    onChange={(key, val) =>
                      setSubmissionFilters((prev) => ({ ...prev, [key]: val }))
                    }
                    onClear={() =>
                      setSubmissionFilters({
                        site: "",
                        engineer: "",
                        reportType: "",
                        dateFrom: "",
                        dateTo: "",
                      })
                    }
                    rows={allSubmissions}
                    inline={true}
                    mobileOpen={submissionMobileFilterOpen}
                    onMobileToggle={() =>
                      setSubmissionMobileFilterOpen((p) => !p)
                    }
                  />
                )}
                {activeTab === "reschedule-requests" && (
                  <RescheduleFilterBar
                    filters={rescheduleFilters}
                    onChange={(key, val) =>
                      setRescheduleFilters((prev) => ({ ...prev, [key]: val }))
                    }
                    onClear={() =>
                      setRescheduleFilters({ name: "", status: "" })
                    }
                    reschedules={allReschedules}
                    userMap={userMap}
                    inline={true}
                    mobileOpen={rescheduleMobileFilterOpen}
                    onMobileToggle={() =>
                      setRescheduleMobileFilterOpen((p) => !p)
                    }
                  />
                )}
                {activeTab === "leave-requests" && (
                  <LeaveFilterBar
                    filters={leaveFilters}
                    onChange={(key, val) =>
                      setLeaveFilters((prev) => ({ ...prev, [key]: val }))
                    }
                    onClear={() =>
                      setLeaveFilters({ name: "", dateFrom: "", dateTo: "" })
                    }
                    leaves={allLeaves}
                    inline={true}
                    mobileOpen={leaveMobileFilterOpen}
                    onMobileToggle={() => setLeaveMobileFilterOpen((p) => !p)}
                  />
                )}
                {activeTab === "manage-employees" && (
                  <EmployeeFilterBar
                    filters={employeeFilters}
                    onChange={(key, val) =>
                      setEmployeeFilters((prev) => ({ ...prev, [key]: val }))
                    }
                    onClear={() => setEmployeeFilters({ name: "", site: "" })}
                    employees={employees}
                    sites={sites}
                    inline={true}
                    mobileOpen={employeeMobileFilterOpen}
                    onMobileToggle={() =>
                      setEmployeeMobileFilterOpen((p) => !p)
                    }
                  />
                )}
                {activeTab === "manage-sites" && (
                  <SiteFilterBar
                    filters={siteFiltersState}
                    onChange={(key, val) =>
                      setSiteFiltersState((prev) => ({ ...prev, [key]: val }))
                    }
                    onClear={() =>
                      setSiteFiltersState({ site: "", assignedUser: "" })
                    }
                    employees={employees}
                    sites={sites}
                    inline={true}
                    mobileOpen={siteMobileFilterOpen}
                    onMobileToggle={() => setSiteMobileFilterOpen((p) => !p)}
                  />
                )}
              </div>
              {renderContent()}
            </div>
          </main>
        </div>

        {/* FAB — dashboard and all-tasks tabs */}
        {(activeTab === "dashboard" || activeTab === "all-tasks") && (
          <button
            className="ap-fab"
            onClick={() => setShowTaskModal(true)}
            title="Assign new task"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        )}

        {/* Assign Task Modal */}
        {showTaskModal && (
          <div
            className="ap-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTaskModal(false);
            }}
          >
            <div className="ap-modal">
              <div className="ap-modal-header">
                <div className="ap-modal-title">
                  <div className="ap-modal-title-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  Assign New Task
                </div>
                <button
                  className="ap-modal-close"
                  onClick={() => setShowTaskModal(false)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="ap-modal-body">
                <TaskFormWithCheckpoints
                  form={form}
                  handleFormChange={handleFormChange}
                  setForm={setForm}
                  handleSubmit={handleSubmit}
                  submitting={submitting}
                  onSuccess={() => setShowTaskModal(false)}
                  employees={assignableEmployees}
                  sites={sites}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {detailTask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10030,
            background: "rgba(15,23,42,.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailTask(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 540,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,.2)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                padding: "18px 22px 14px",
                borderBottom: "1px solid #f1f5f9",
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 1,
                borderRadius: "16px 16px 0 0",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1e293b",
                    lineHeight: 1.3,
                  }}
                >
                  {detailTask.title}
                </div>
                {detailTask.site_name && (
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>
                    {detailTask.site_name}
                  </div>
                )}
              </div>
              <button
                onClick={() => setDetailTask(null)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div
              style={{
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(() => {
                  const p =
                    PRIORITY_STYLES[detailTask.priority] ||
                    PRIORITY_STYLES.medium;
                  return (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 20,
                        background: p.bg,
                        color: p.color,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: p.dot,
                          flexShrink: 0,
                        }}
                      />
                      {detailTask.priority} priority
                    </span>
                  );
                })()}
                {(() => {
                  const s =
                    STATUS_STYLES[detailTask.status] || STATUS_STYLES.pending;
                  return (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 20,
                        background: s.bg,
                        color: s.color,
                      }}
                    >
                      {detailTask.status
                        ?.replace("_", " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  );
                })()}
                {detailTask.is_recurring && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 20,
                      background: "#eff6ff",
                      color: "#2563eb",
                    }}
                  >
                    {anchorDescription(
                      detailTask.recurrence,
                      detailTask.recurrence_anchor,
                    ) || detailTask.recurrence}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  {
                    label: "Assigned To",
                    value: nameFor(userMap, detailTask.assigned_to),
                  },
                  {
                    label: "Given By",
                    value: nameFor(userMap, detailTask.assigned_by),
                  },
                  { label: "Site", value: detailTask.site_name || "—" },
                  {
                    label: "Hours to Complete",
                    value: detailTask.hours_to_complete
                      ? `${detailTask.hours_to_complete} hrs`
                      : "—",
                  },
                  {
                    label: "Due Date",
                    value: detailTask.due_date
                      ? new Date(detailTask.due_date).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )
                      : "—",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e8edf3",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                        color: "#94a3b8",
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {detailTask.description && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e8edf3",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: "#94a3b8",
                      marginBottom: 8,
                    }}
                  >
                    Description
                  </div>
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "#475569",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {detailTask.description}
                  </p>
                </div>
              )}

              {detailTask.audio_url && (
                <div
                  style={{
                    background: "#f5f3ff",
                    border: "1px solid #e0e7ff",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: "#7c3aed",
                      marginBottom: 10,
                    }}
                  >
                    Audio Instruction
                  </div>
                  <audio
                    controls
                    src={detailTask.audio_url}
                    style={{ width: "100%", borderRadius: 8, outline: "none" }}
                  />
                </div>
              )}

              {detailTask.document_url && (
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: "#2563eb",
                      marginBottom: 10,
                    }}
                  >
                    Attached Document
                  </div>
                  <a
                    href={detailTask.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#2563eb",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "9px 16px",
                      borderRadius: 8,
                      textDecoration: "none",
                    }}
                  >
                    Open / Download Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {verificationDetail && (
  <div
    style={{
      position: "fixed", inset: 0, zIndex: 10030,
      background: "rgba(15,23,42,.45)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}
    onClick={(e) => { if (e.target === e.currentTarget) setVerificationDetail(null); }}
  >
    <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
      {(() => {
        const { v, task } = verificationDetail;
        const statusStyle = {
          pending: { bg: "#fffbeb", color: "#d97706", label: "Pending" },
          completed: { bg: "#f0fdf4", color: "#16a34a", label: "Completed" },
          correction_sent: { bg: "#fef2f2", color: "#dc2626", label: "Correction Sent" },
        };
        const sc = statusStyle[v.status] || statusStyle.pending;
        return (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 1, borderRadius: "16px 16px 0 0" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{task?.title || v.task_title}</div>
                {(task?.site_name || v.site_name) && (
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>{task?.site_name || v.site_name}</div>
                )}
              </div>
              <button onClick={() => setVerificationDetail(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: sc.bg, color: sc.color, width: "fit-content" }}>
                {sc.label}
              </span>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "Sent By", value: v.sent_by_name || v.sent_by },
                  { label: "Assigned To", value: task ? nameFor(userMap, task.assigned_to) : "—" },
                  { label: "Priority", value: task?.priority || "—" },
                  { label: "Sent On", value: v.created_at ? new Date(v.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "#f8fafc", border: "1px solid #e8edf3", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{value}</div>
                  </div>
                ))}
              </div>

              {task?.description && (
                <div style={{ background: "#f8fafc", border: "1px solid #e8edf3", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8 }}>Task Description</div>
                  <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6, margin: 0 }}>{task.description}</p>
                </div>
              )}

              <div style={{ background: "#f8fafc", border: "1px solid #e8edf3", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 8 }}>Files Submitted for Verification</div>
                {v.document_urls?.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {v.document_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, fontWeight: 600, color: "#475569", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 7, padding: "6px 12px", textDecoration: "none" }}>
                        📎 File {i + 1}
                      </a>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 12.5, color: "#94a3b8", fontStyle: "italic" }}>No files attached</span>
                )}
              </div>

              {(task?.audio_url || task?.document_url) && (
                <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#2563eb", marginBottom: 10 }}>Original Task Attachments</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {task.audio_url && <a href={task.audio_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, fontWeight: 600, color: "#7c3aed" }}>🎵 Audio</a>}
                    {task.document_url && <a href={task.document_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, fontWeight: 600, color: "#0369a1" }}>📄 Document</a>}
                  </div>
                </div>
              )}

              {v.status === "correction_sent" && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#dc2626", marginBottom: 8 }}>Correction Sent</div>
                  {v.correction_note && <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6, margin: "0 0 10px" }}>{v.correction_note}</p>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {v.correction_audio_url && <a href={v.correction_audio_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, fontWeight: 600, color: "#7c3aed" }}>🎵 Correction Audio</a>}
                    {v.correction_document_urls?.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, fontWeight: 600, color: "#0369a1" }}>📄 Doc {i + 1}</a>
                    ))}
                  </div>
                  {v.resolved_by && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>by {v.resolved_by}</div>}
                </div>
              )}

              {v.status === "completed" && v.resolved_by && (
                <div style={{ fontSize: 12.5, color: "#16a34a", fontWeight: 600 }}>✓ Verified by {v.resolved_by}</div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  </div>
)}
      {rejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10040,
            background: "rgba(15,23,42,.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setRejectModal(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 460,
              boxShadow: "0 24px 64px rgba(0,0,0,.22)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 22px 14px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: "#fef2f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}
                >
                  Reject Reschedule Request
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {rejectModal.req.tasks?.title ||
                    `Task #${rejectModal.req.task_id}`}
                  {" · "}Requested by{" "}
                  <strong style={{ color: "#64748b" }}>
                    {rejectModal.req.requested_by}
                  </strong>
                </div>
              </div>
              <button
                onClick={() => setRejectModal(null)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Request summary */}
            <div style={{ padding: "16px 22px 0" }}>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e8edf3",
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Current due:
                  <strong style={{ color: "#1e293b", marginLeft: 5 }}>
                    {rejectModal.req.current_due
                      ? new Date(
                          rejectModal.req.current_due + "T00:00:00",
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </strong>
                </div>
                <div style={{ fontSize: 12, color: "#7c3aed" }}>
                  Requested:
                  <strong style={{ marginLeft: 5 }}>
                    {new Date(
                      rejectModal.req.requested_date + "T00:00:00",
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </div>
                {rejectModal.req.reason && (
                  <div
                    style={{
                      width: "100%",
                      fontSize: 12,
                      color: "#64748b",
                      fontStyle: "italic",
                    }}
                  >
                    "{rejectModal.req.reason}"
                  </div>
                )}
              </div>
            </div>

            {/* Reason textarea */}
            <div
              style={{
                padding: "16px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}
              >
                Reason for Rejection <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Explain why this reschedule request is being rejected…"
                autoFocus
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13.5,
                  color: "#1e293b",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "9px 12px",
                  outline: "none",
                  width: "100%",
                  resize: "vertical",
                  minHeight: 90,
                  transition: "border .15s",
                }}
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal((p) => ({ ...p, reason: e.target.value }))
                }
                onFocus={(e) => {
                  e.target.style.borderColor = "#dc2626";
                  e.target.style.boxShadow = "0 0 0 3px rgba(220,38,38,.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                This message will be shown to the employee.
              </span>
            </div>

            {/* Footer buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                padding: "12px 22px 18px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={() => setRejectModal(null)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#f1f5f9",
                  color: "#475569",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectModal.reason.trim()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  background: rejectModal.reason.trim() ? "#dc2626" : "#f1f5f9",
                  color: rejectModal.reason.trim() ? "#fff" : "#94a3b8",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  cursor: rejectModal.reason.trim() ? "pointer" : "not-allowed",
                  transition: "background .15s, color .15s",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
      {ticketSolveModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10040,
            background: "rgba(15,23,42,.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setTicketSolveModal(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 24px 64px rgba(0,0,0,.22)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 22px 14px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                Mark Ticket as Solved
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                {ticketSolveModal.ticket.task_title}
              </div>
            </div>
            <div
              style={{
                padding: "16px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}
              >
                Resolution Note
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#94a3b8",
                    background: "#f1f5f9",
                    borderRadius: 4,
                    padding: "1px 6px",
                    marginLeft: 6,
                  }}
                >
                  optional
                </span>
              </label>
              <textarea
                rows={3}
                placeholder="How was this resolved?"
                style={{
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13.5,
                  color: "#1e293b",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "9px 12px",
                  outline: "none",
                  width: "100%",
                  resize: "vertical",
                  minHeight: 80,
                }}
                value={ticketSolveModal.note}
                onChange={(e) =>
                  setTicketSolveModal((p) => ({ ...p, note: e.target.value }))
                }
              />
              <label
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#475569",
                  marginTop: 8,
                }}
              >
                Attach Resolution Document
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#94a3b8",
                    background: "#f1f5f9",
                    borderRadius: 4,
                    padding: "1px 6px",
                    marginLeft: 6,
                  }}
                >
                  optional
                </span>
              </label>
              <input
                type="file"
                onChange={(e) =>
                  setTicketSolveModal((p) => ({
                    ...p,
                    file: e.target.files?.[0] || null,
                  }))
                }
                style={{ fontSize: 12.5 }}
              />
              {ticketSolveModal.file && (
                <span style={{ fontSize: 11.5, color: "#64748b" }}>
                  {ticketSolveModal.file.name}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                padding: "12px 22px 18px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={() => setTicketSolveModal(null)}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkTicketSolved}
                disabled={updatingTicketId === ticketSolveModal.ticket.id}
                style={{
                  background: "#16a34a",
                  color: "#fff",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Confirm Solved
              </button>
            </div>
          </div>
        </div>
      )}
      {correctionModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10040,
            background: "rgba(15,23,42,.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setCorrectionModal(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 480,
              boxShadow: "0 24px 64px rgba(0,0,0,.22)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 22px 14px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                Send Correction
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                To{" "}
                {correctionModal.verification.sent_by_name ||
                  correctionModal.verification.sent_by}
                {" · "}
                {correctionModal.verification.task_title}
              </div>
            </div>

            <div
              style={{
                padding: "16px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}
                >
                  Correction Note <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  rows={4}
                  autoFocus
                  placeholder="Explain what needs to be corrected…"
                  style={{
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 13.5,
                    color: "#1e293b",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: "9px 12px",
                    outline: "none",
                    width: "100%",
                    resize: "vertical",
                    minHeight: 90,
                  }}
                  value={correctionModal.note}
                  onChange={(e) =>
                    setCorrectionModal((p) => ({ ...p, note: e.target.value }))
                  }
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>
                  Audio Note
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8", background: "#f1f5f9", borderRadius: 4, padding: "1px 6px", marginLeft: 6 }}>
                    optional
                  </span>
                </label>
                <AudioRecorder
                  onRecorded={(file) => setCorrectionModal((p) => ({ ...p, audioFile: file }))}
                />
                <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Record a voice note explaining the correction.</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}
                >
                  Attach Documents
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#94a3b8",
                      background: "#f1f5f9",
                      borderRadius: 4,
                      padding: "1px 6px",
                      marginLeft: 6,
                    }}
                  >
                    optional, multiple allowed
                  </span>
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    setCorrectionModal((p) => ({
                      ...p,
                      docFiles: [...p.docFiles, ...newFiles],
                    }));
                    e.target.value = "";
                  }}
                  style={{ fontSize: 12.5 }}
                />
                {correctionModal.docFiles.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                      marginTop: 4,
                    }}
                  >
                    {correctionModal.docFiles.map((f, i) => (
                      <div
                        key={`${f.name}-${i}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: 12,
                          color: "#475569",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 6,
                          padding: "5px 10px",
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {f.name}
                        </span>
                        <button
                          onClick={() =>
                            setCorrectionModal((p) => ({
                              ...p,
                              docFiles: p.docFiles.filter(
                                (_, idx) => idx !== i,
                              ),
                            }))
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#dc2626",
                            fontWeight: 700,
                            padding: "0 2px",
                            flexShrink: 0,
                            marginLeft: 8,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                padding: "12px 22px 18px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={() => setCorrectionModal(null)}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCorrectionSubmit}
                disabled={correctionModal.submitting}
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  fontFamily: "'DM Sans',sans-serif",
                  fontSize: 13.5,
                  fontWeight: 600,
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  opacity: correctionModal.submitting ? 0.6 : 1,
                }}
              >
                {correctionModal.submitting ? "Sending…" : "Send Correction"}
              </button>
            </div>
          </div>
        </div>
      )}
      {overdueRescheduleModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 10040,
      background: "rgba(15,23,42,.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) setOverdueRescheduleModal(null);
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        width: "100%",
        maxWidth: 420,
        boxShadow: "0 24px 64px rgba(0,0,0,.22)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
          Reschedule Overdue Task
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
          {overdueRescheduleModal.task.title}
        </div>
      </div>

      <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>
          New Due Date <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <input
          type="date"
          style={{
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13.5,
            color: "#1e293b",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "9px 12px",
            outline: "none",
            width: "100%",
          }}
          value={overdueRescheduleModal.newDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            setOverdueRescheduleModal((p) => ({ ...p, newDate: e.target.value }))
          }
        />
        <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
          Current due date:{" "}
          {new Date(overdueRescheduleModal.task.due_date).toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "short", year: "numeric" },
          )}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          padding: "12px 22px 18px",
          borderTop: "1px solid #f1f5f9",
        }}
      >
        <button
          onClick={() => setOverdueRescheduleModal(null)}
          style={{
            background: "#f1f5f9",
            color: "#475569",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13.5,
            fontWeight: 600,
            padding: "9px 18px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleOverdueRescheduleSubmit}
          disabled={updatingOverdueId === overdueRescheduleModal.task.id}
          style={{
            background: "#2563eb",
            color: "#fff",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13.5,
            fontWeight: 600,
            padding: "9px 20px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            opacity: updatingOverdueId === overdueRescheduleModal.task.id ? 0.6 : 1,
          }}
        >
          {updatingOverdueId === overdueRescheduleModal.task.id
            ? "Saving…"
            : "Update Due Date"}
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}
