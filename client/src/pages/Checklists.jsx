import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

// ── Preset checklist templates ──────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "safety",
    label: "Safety Inspection",
    icon: "🦺",
    items: [
      "All workers wearing PPE (helmet, vest, boots)",
      "Fire extinguishers in place and accessible",
      "First aid kit available and stocked",
      "Emergency exit routes clear and marked",
      "Hazardous areas properly barricaded",
      "Scaffolding secured and inspected",
      "Electrical panels shut and labelled",
      "No unauthorized personnel on site",
    ],
  },
  {
    id: "quality",
    label: "Quality Control",
    icon: "🔬",
    items: [
      "Line and level checked before pour",
      "Material test certificates available",
      "Concrete mix design approved",
      "Rebar cover maintained as per drawing",
      "Formwork inspected before concreting",
      "Curing in progress as specified",
      "Dimension tolerances within limits",
      "As-built drawings updated",
    ],
  },
  {
    id: "daily",
    label: "Daily Site Check",
    icon: "📋",
    items: [
      "Site diary updated",
      "Manpower count recorded",
      "Material delivery noted",
      "Equipment functional check done",
      "Photographs taken for records",
      "Housekeeping satisfactory",
      "Work orders / drawings available at site",
      "Progress measured and recorded",
    ],
  },
  {
    id: "handover",
    label: "Site Handover",
    icon: "🔑",
    items: [
      "All work items completed as per scope",
      "Site clearance and cleanup done",
      "Snag list items resolved",
      "As-built drawings handed over",
      "Testing & commissioning completed",
      "Warranties and guarantees collected",
      "Keys / access handed to client",
      "Final photographs taken",
    ],
  },
];

const STATUS_CONFIG = {
  ok:      { label: "OK",      bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  issue:   { label: "Issue",   bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  na:      { label: "N/A",     bg: "#f8fafc", color: "#94a3b8", border: "#e2e8f0" },
  pending: { label: "Pending", bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
};

// ── Sub-components ──────────────────────────────────────────────────────────
function StatusPicker({ value, onChange }) {
  return (
    <div className="cl-status-row">
      {Object.entries(STATUS_CONFIG).map(([k, s]) => (
        <button
          key={k}
          className={`cl-status-btn${value === k ? " active" : ""}`}
          style={value === k ? { background: s.bg, color: s.color, borderColor: s.border } : {}}
          onClick={() => onChange(k)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function ChecklistItem({ item, index, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

  return (
    <div
      className="cl-item"
      style={{ borderLeftColor: cfg.border }}
    >
      <div className="cl-item-top" onClick={() => setExpanded((p) => !p)}>
        <div className="cl-item-num">{index + 1}</div>
        <div className="cl-item-text">{item.text}</div>
        <span
          className="cl-item-badge"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          {cfg.label}
        </span>
        <svg
          className={`cl-item-chevron${expanded ? " open" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {expanded && (
        <div className="cl-item-expand">
          <StatusPicker value={item.status} onChange={(v) => onChange({ ...item, status: v })} />
          <textarea
            className="cl-item-note"
            placeholder="Add a note or observation…"
            value={item.note}
            rows={2}
            onChange={(e) => onChange({ ...item, note: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function Checklists({ user }) {
  const [tab, setTab] = useState("new"); // "new" | "history"
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState({
    site_name: "",
    visit_date: new Date().toISOString().split("T")[0],
    checklist_name: "",
    remarks: "",
  });
  const [items, setItems] = useState([]);
  const [customItem, setCustomItem] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const applyTemplate = (tmpl) => {
    setSelectedTemplate(tmpl.id);
    setForm((p) => ({ ...p, checklist_name: tmpl.label }));
    setItems(tmpl.items.map((text) => ({ text, status: "pending", note: "" })));
  };

  const updateItem = (i, updated) =>
    setItems((p) => p.map((it, idx) => (idx === i ? updated : it)));

  const addCustomItem = () => {
    if (!customItem.trim()) return;
    setItems((p) => [...p, { text: customItem.trim(), status: "pending", note: "" }]);
    setCustomItem("");
  };

  const removeItem = (i) =>
    setItems((p) => p.filter((_, idx) => idx !== i));

  const stats = {
    ok:      items.filter((i) => i.status === "ok").length,
    issue:   items.filter((i) => i.status === "issue").length,
    na:      items.filter((i) => i.status === "na").length,
    pending: items.filter((i) => i.status === "pending").length,
  };

  const handleSubmit = async () => {
    if (!form.site_name.trim()) return showToast("error", "Site Name is required.");
    if (!form.checklist_name.trim()) return showToast("error", "Checklist name is required.");
    if (items.length === 0) return showToast("error", "Add at least one checklist item.");

    setSubmitting(true);
    try {
      const payload = {
        site_name: form.site_name.trim(),
        visit_date: form.visit_date,
        checklist_name: form.checklist_name.trim(),
        remarks: form.remarks.trim() || null,
        submitted_by: user?.user_name || null,
        submitted_by_name: user?.name || null,
        items_ok: stats.ok,
        items_issue: stats.issue,
        items_na: stats.na,
        items_pending: stats.pending,
        total_items: items.length,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from("checklists")
        .insert([payload])
        .select()
        .single();
      if (insertErr) throw insertErr;

      const itemPayloads = items.map((it, idx) => ({
        checklist_id: inserted.id,
        item_text: it.text,
        status: it.status,
        note: it.note || null,
        sort_order: idx,
      }));

      const { error: itemErr } = await supabase
        .from("checklist_items")
        .insert(itemPayloads);
      if (itemErr) throw itemErr;

      showToast("success", "Checklist submitted successfully!");
      setSelectedTemplate(null);
      setItems([]);
      setForm({ site_name: "", visit_date: new Date().toISOString().split("T")[0], checklist_name: "", remarks: "" });
    } catch (err) {
      showToast("error", "Failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    const { data } = await supabase
      .from("checklists")
      .select("*, checklist_items(*)")
      .eq("submitted_by", user?.user_name)
      .order("created_at", { ascending: false })
      .limit(30);
    setHistory(data || []);
    setLoadingHistory(false);
  }, [user]);

  useEffect(() => {
    if (tab === "history") fetchHistory();
  }, [tab, fetchHistory]);

  const pct = (n) => (items.length > 0 ? Math.round((n / items.length) * 100) : 0);

  return (
    <>
      <style>{`
        /* ── Tab Bar ── */
        .cl-tabs { display: flex; gap: 6px; margin-bottom: 18px; background: #f1f5f9; padding: 4px; border-radius: 10px; }
        .cl-tab { flex: 1; padding: 9px 14px; border: none; border-radius: 7px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: #64748b;
          background: transparent; transition: .15s; }
        .cl-tab.active { background: #fff; color: #1e293b; box-shadow: 0 1px 6px rgba(0,0,0,.08); }

        /* ── Template Grid ── */
        .cl-tmpl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); gap: 10px; margin-bottom: 18px; }
        .cl-tmpl-card { display: flex; flex-direction: column; align-items: center; gap: 7px;
          padding: 16px 10px; border: 2px solid #e2e8f0; border-radius: 10px; cursor: pointer;
          background: #fff; transition: .15s; font-family: 'DM Sans', sans-serif; text-align: center; }
        .cl-tmpl-card:hover { border-color: #94a3b8; background: #f8fafc; }
        .cl-tmpl-card.selected { border-color: #1e293b; background: #f1f5f9; }
        .cl-tmpl-emoji { font-size: 26px; }
        .cl-tmpl-label { font-size: 12.5px; font-weight: 700; color: #1e293b; }

        /* ── Form ── */
        .cl-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        @media (max-width: 560px) { .cl-form-row { grid-template-columns: 1fr; } }
        .cl-field { display: flex; flex-direction: column; gap: 5px; }
        .cl-label { font-size: 12.5px; font-weight: 600; color: #475569; }
        .cl-req { color: #dc2626; }
        .cl-input, .cl-select { font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #1e293b;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px;
          padding: 9px 12px; outline: none; transition: border .15s; width: 100%; }
        .cl-input:focus, .cl-select:focus { border-color: #1e293b; background: #fff; }

        /* ── Stats Bar ── */
        .cl-stats { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
        .cl-stat-pill { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700;
          padding: 5px 11px; border-radius: 20px; }

        /* ── Progress bar ── */
        .cl-progress-wrap { background: #f1f5f9; border-radius: 99px; height: 6px; margin-bottom: 14px; overflow: hidden; }
        .cl-progress-bar { height: 6px; border-radius: 99px; background: linear-gradient(90deg, #16a34a, #22c55e); transition: width .3s; }

        /* ── Items ── */
        .cl-items-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .cl-item { background: #fff; border: 1.5px solid #e2e8f0; border-left: 4px solid #e2e8f0;
          border-radius: 8px; overflow: hidden; transition: box-shadow .15s; }
        .cl-item:hover { box-shadow: 0 2px 10px rgba(0,0,0,.06); }
        .cl-item-top { display: flex; align-items: center; gap: 10px; padding: 12px 14px; cursor: pointer; }
        .cl-item-num { font-size: 11px; font-weight: 700; color: #94a3b8; width: 20px; flex-shrink: 0; }
        .cl-item-text { flex: 1; font-size: 13.5px; color: #1e293b; font-weight: 500; }
        .cl-item-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px; flex-shrink: 0; }
        .cl-item-chevron { flex-shrink: 0; transition: transform .2s; }
        .cl-item-chevron.open { transform: rotate(180deg); }
        .cl-item-expand { padding: 0 14px 14px; display: flex; flex-direction: column; gap: 8px; }
        .cl-status-row { display: flex; gap: 6px; flex-wrap: wrap; }
        .cl-status-btn { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
          padding: 5px 12px; border: 1.5px solid #e2e8f0; border-radius: 6px; cursor: pointer;
          background: #f8fafc; color: #64748b; transition: .15s; }
        .cl-status-btn:hover { background: #f1f5f9; }
        .cl-status-btn.active { font-weight: 700; }
        .cl-item-note { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #1e293b;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 7px;
          padding: 8px 11px; outline: none; resize: none; width: 100%; }
        .cl-item-note:focus { border-color: #1e293b; }

        /* ── Add item ── */
        .cl-add-row { display: flex; gap: 8px; margin-bottom: 16px; }
        .cl-add-input { flex: 1; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #1e293b;
          background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px;
          padding: 9px 12px; outline: none; transition: border .15s; }
        .cl-add-input:focus { border-color: #1e293b; background: #fff; }
        .cl-add-btn { background: #1e293b; color: #fff; border: none; border-radius: 8px;
          padding: 9px 16px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; white-space: nowrap; transition: .15s; }
        .cl-add-btn:hover { background: #334155; }

        /* ── Submit ── */
        .cl-submit { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #1e293b, #334155); color: #fff;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
          padding: 13px 24px; border-radius: 9px; border: none; cursor: pointer;
          width: 100%; box-shadow: 0 4px 14px rgba(30,41,59,.25); transition: .15s; }
        .cl-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .cl-submit:disabled { opacity: .6; cursor: not-allowed; }

        /* ── Toast ── */
        .cl-toast { display: flex; align-items: center; gap: 9px; padding: 11px 16px;
          border-radius: 9px; font-size: 13px; font-weight: 600; margin-bottom: 14px;
          animation: cl-up .2s ease; }
        .cl-toast-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .cl-toast-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        @keyframes cl-up { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

        /* ── History ── */
        .cl-hist-card { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 16px; margin-bottom: 10px; cursor: pointer; transition: box-shadow .15s; }
        .cl-hist-card:hover { box-shadow: 0 3px 12px rgba(0,0,0,.08); }
        .cl-hist-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
        .cl-hist-title { font-size: 14px; font-weight: 700; color: #1e293b; }
        .cl-hist-meta { font-size: 12px; color: #64748b; margin-top: 3px; }
        .cl-hist-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
        .cl-hist-items-list { margin-top: 12px; border-top: 1px solid #f1f5f9; padding-top: 12px;
          display: flex; flex-direction: column; gap: 6px; }
        .cl-hist-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px;
          background: #f8fafc; border-radius: 7px; font-size: 13px; }
        .cl-hist-item-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .cl-hist-item-text { flex: 1; color: #1e293b; }
        .cl-hist-item-note { font-size: 11.5px; color: #64748b; font-style: italic; }

        .cl-divider-label { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          color: #94a3b8; margin: 4px 0 10px; }
        .cl-empty { text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 13.5px; }
        .cl-section-title { font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px;
          display: flex; align-items: center; gap: 7px; }
        .cl-section-title svg { opacity: .6; }
      `}</style>

      <div>
        {toast && (
          <div className={`cl-toast cl-toast-${toast.type}`}>
            {toast.type === "success"
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            {toast.msg}
          </div>
        )}

        {/* Tab bar */}
        <div className="cl-tabs">
          <button className={`cl-tab${tab === "new" ? " active" : ""}`} onClick={() => setTab("new")}>
            New Checklist
          </button>
          <button className={`cl-tab${tab === "history" ? " active" : ""}`} onClick={() => setTab("history")}>
            My History
          </button>
        </div>

        {/* ── NEW CHECKLIST ── */}
        {tab === "new" && (
          <div>
            {/* Template picker */}
            <div className="cl-section-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="13" y2="13"/></svg>
              Start from a Template
            </div>
            <div className="cl-tmpl-grid">
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className={`cl-tmpl-card${selectedTemplate === t.id ? " selected" : ""}`}
                  onClick={() => applyTemplate(t)}
                >
                  <span className="cl-tmpl-emoji">{t.icon}</span>
                  <span className="cl-tmpl-label">{t.label}</span>
                </div>
              ))}
            </div>

            {/* Basic Info */}
            <div className="cl-divider-label">Checklist Details</div>
            <div className="cl-form-row">
              <div className="cl-field">
                <label className="cl-label">Site / Project Name <span className="cl-req">*</span></label>
                <input className="cl-input" placeholder="Enter site name…" value={form.site_name} onChange={e => setForm(p => ({ ...p, site_name: e.target.value }))} />
              </div>
              <div className="cl-field">
                <label className="cl-label">Visit Date</label>
                <input className="cl-input" type="date" value={form.visit_date} onChange={e => setForm(p => ({ ...p, visit_date: e.target.value }))} />
              </div>
              <div className="cl-field">
                <label className="cl-label">Checklist Name <span className="cl-req">*</span></label>
                <input className="cl-input" placeholder="e.g. Safety Inspection…" value={form.checklist_name} onChange={e => setForm(p => ({ ...p, checklist_name: e.target.value }))} />
              </div>
              <div className="cl-field">
                <label className="cl-label">General Remarks</label>
                <input className="cl-input" placeholder="Optional overall remarks…" value={form.remarks} onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} />
              </div>
            </div>

            {/* Items */}
            {items.length > 0 && (
              <>
                <div className="cl-divider-label">Checklist Items — {items.length} total</div>

                {/* Progress */}
                <div className="cl-progress-wrap">
                  <div className="cl-progress-bar" style={{ width: `${pct(stats.ok + stats.na)}%` }} />
                </div>

                {/* Stats pills */}
                <div className="cl-stats">
                  {Object.entries(STATUS_CONFIG).map(([k, s]) => (
                    stats[k] > 0 && (
                      <span key={k} className="cl-stat-pill" style={{ background: s.bg, color: s.color }}>
                        {s.label}: {stats[k]}
                      </span>
                    )
                  ))}
                </div>

                <div className="cl-items-list">
                  {items.map((it, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <ChecklistItem item={it} index={i} onChange={(updated) => updateItem(i, updated)} />
                      <button
                        onClick={() => removeItem(i)}
                        style={{ position:"absolute", top:8, right:42, background:"none", border:"none",
                          cursor:"pointer", color:"#cbd5e1", fontSize:16, padding:4, lineHeight:1 }}
                        title="Remove item"
                      >×</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Add custom item */}
            <div className="cl-divider-label" style={{ marginTop: items.length > 0 ? 0 : 4 }}>Add Custom Item</div>
            <div className="cl-add-row">
              <input
                className="cl-add-input"
                placeholder="Type a checklist item and press Add…"
                value={customItem}
                onChange={e => setCustomItem(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomItem(); } }}
              />
              <button className="cl-add-btn" onClick={addCustomItem}>Add</button>
            </div>

            {/* Submit */}
            <button className="cl-submit" onClick={handleSubmit} disabled={submitting || items.length === 0}>
              {submitting
                ? <><span className="op-mini-spinner" />&nbsp;Submitting…</>
                : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>&nbsp;Submit Checklist</>
              }
            </button>
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === "history" && (
          <div>
            {loadingHistory ? (
              <div className="cl-empty">
                <div className="op-spinner" style={{ margin: "0 auto 12px" }} />
                Loading history…
              </div>
            ) : history.length === 0 ? (
              <div className="cl-empty">No checklists submitted yet.</div>
            ) : (
              history.map((cl) => {
                const isOpen = expandedHistory === cl.id;
                return (
                  <div key={cl.id} className="cl-hist-card" onClick={() => setExpandedHistory(isOpen ? null : cl.id)}>
                    <div className="cl-hist-top">
                      <div>
                        <div className="cl-hist-title">{cl.checklist_name}</div>
                        <div className="cl-hist-meta">
                          📍 {cl.site_name} &nbsp;·&nbsp; 📅 {new Date(cl.visit_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                        style={{ transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "none", flexShrink: 0, marginTop: 4 }}
                      ><polyline points="6 9 12 15 18 9" /></svg>
                    </div>
                    <div className="cl-hist-pills">
                      {Object.entries(STATUS_CONFIG).map(([k, s]) =>
                        (cl[`items_${k}`] || 0) > 0 ? (
                          <span key={k} className="cl-stat-pill" style={{ background: s.bg, color: s.color, fontSize: 11, padding: "3px 9px", borderRadius: 20 }}>
                            {s.label}: {cl[`items_${k}`]}
                          </span>
                        ) : null
                      )}
                      <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
                        {cl.total_items} items
                      </span>
                    </div>
                    {isOpen && cl.checklist_items && cl.checklist_items.length > 0 && (
                      <div className="cl-hist-items-list">
                        {[...cl.checklist_items]
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((it) => {
                            const cfg = STATUS_CONFIG[it.status] || STATUS_CONFIG.pending;
                            return (
                              <div key={it.id} className="cl-hist-item">
                                <div className="cl-hist-item-dot" style={{ background: cfg.color }} />
                                <span className="cl-hist-item-text">{it.item_text}</span>
                                <span className="cl-item-badge" style={{ background: cfg.bg, color: cfg.color, fontSize: 10, padding: "2px 7px", borderRadius: 20 }}>
                                  {cfg.label}
                                </span>
                              </div>
                            );
                          })}
                        {cl.remarks && (
                          <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", padding: "6px 10px", background: "#f8fafc", borderRadius: 7 }}>
                            📝 {cl.remarks}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}