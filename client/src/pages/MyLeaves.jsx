

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";

const LEAVE_STATUS_STYLE = {
  "Pending": { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  "Approved": { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  "Rejected": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

export default function MyLeaves() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadLeaves();
    const interval = setInterval(loadLeaves, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("leaves")
      .select("*")
      .eq("user_name", user.user_name)
      .order("created_at", { ascending: false });
    setLeaves(data || []);
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    if (status === "Pending") {
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
    } else if (status === "Approved") {
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>;
    } else if (status === "Rejected") {
      return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
    }
  };

  const getDaysDiff = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;
    return Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1;
  };

  // A leave can be cancelled only if the head hasn't taken any action on it yet.
  const canCancel = (leave) => {
    if (leave.status !== "Pending") return false;
    if (leave.proxy_approved === true || leave.proxy_approved === false) return false;
    return true;
  };

  const handleCancel = async (leave) => {
    if (!window.confirm("Cancel this leave application? This cannot be undone.")) return;
    setCancellingId(leave.id);
    const { error } = await supabase.from("leaves").delete().eq("id", leave.id);
    setCancellingId(null);
    if (error) {
      alert("Failed to cancel leave: " + error.message);
      return;
    }
    setLeaves(prev => prev.filter(l => l.id !== leave.id));
  };

  return (
    <div className="ml-page" style={{ fontFamily: "'DM Sans', sans-serif", background: "#f4f6f9", minHeight: "100vh" }}>
      <Navbar />
      
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "600", color: "#1e293b", marginBottom: "24px" }}>My Leaves</h1>

        {loading && !leaves.length ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
            <div style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            <p style={{ marginTop: "16px", fontSize: "14px" }}>Loading leaves...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", background: "#fff", borderRadius: "12px", color: "#94a3b8" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ margin: "0 auto 12px", opacity: 0.3 }} >
              <path d="M4 7h16M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2m0 0v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7" />
            </svg>
            <p style={{ fontSize: "14px" }}>No leave requests yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {leaves.map((leave) => {
              const statusStyle = LEAVE_STATUS_STYLE[leave.status] || LEAVE_STATUS_STYLE["Pending"];
              const daysDiff = getDaysDiff(leave.from_date, leave.to_date);
              const showCancel = canCancel(leave);
              const isCancelling = cancellingId === leave.id;
              return (
                <div
                  key={leave.id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    borderLeft: "5px solid",
                    borderLeftColor: leave.status === "Approved" ? "#16a34a" : leave.status === "Rejected" ? "#dc2626" : "#f59e0b",
                    padding: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,.05)",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "16px",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b", margin: 0 }}>{leave.leave_type}</h3>
                      <span style={{ fontSize: "12px", fontWeight: "600", padding: "4px 8px", borderRadius: "4px", background: "#f1f5f9", color: "#64748b" }}>
                        {daysDiff} {daysDiff === 1 ? "day" : "days"}
                      </span>
                    </div>

                    <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {new Date(leave.from_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} → {new Date(leave.to_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>

                    {leave.reason && (
                      <p style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic", margin: "8px 0 0 0" }}>"{leave.reason}"</p>
                    )}

                    {leave.approved_by && (
                      <p style={{ fontSize: "12px", color: "#94a3b8", margin: "8px 0 0 0" }}>
                        Approved by <strong>{leave.approved_by}</strong>
                      </p>
                    )}

                    {showCancel && (
                      <button
                        onClick={() => handleCancel(leave)}
                        disabled={isCancelling}
                        style={{
                          marginTop: "14px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12.5px",
                          fontWeight: "700",
                          padding: "7px 14px",
                          borderRadius: "7px",
                          background: "#fef2f2",
                          color: "#dc2626",
                          border: "1.5px solid #fecaca",
                          cursor: isCancelling ? "not-allowed" : "pointer",
                          opacity: isCancelling ? 0.6 : 1,
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                        </svg>
                        {isCancelling ? "Cancelling…" : "Cancel Leave"}
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", borderRadius: "6px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`, whiteSpace: "nowrap" }}>
                    {getStatusIcon(leave.status)}
                    <span style={{ fontSize: "12px", fontWeight: "600" }}>{leave.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}