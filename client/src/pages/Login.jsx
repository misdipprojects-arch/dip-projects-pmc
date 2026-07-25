import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LOGO_URL from "../assets/logo.png";
import "./Login.css";

// TaskFlow's Express backend — set REACT_APP_API_URL in client/.env
// e.g. REACT_APP_API_URL=http://localhost:4000  (or your deployed backend URL)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) return;
    const user = JSON.parse(storedUser);
    redirectUser(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Where a user lands after login. TaskFlow's `department` column holds
  // things like "Estimation", "Drawing", "Site Execution", "Accounts", or
  // "Admin". DIP's richer portals (hr / client / mdo / head) map off
  // `role` for now — adjust these two switches once the real department
  // dropdown values are finalised in the admin panel.
  const redirectUser = (user) => {
    const role = String(user.role || "").trim().toLowerCase();
    const department = String(user.department || "").trim().toLowerCase();

    if (role === "admin" || department === "admin") return navigate("/admin");
    if (role === "hr") return navigate("/hr");
    if (role === "client") return navigate("/client");
    if (role === "project head" || role === "mis head") return navigate("/head");
    if (role === "mdo office") return navigate("/mdo");

    // Everyone else: office vs site, based on their saved preference —
    // this is the switch requested ("office" = TaskFlow tools, "site" =
    // DIP's manpower/clock-in/attendance/site-report tools). Users who can
    // use both get a toggle inside the portal itself (see OfficePortal /
    // SitePortal nav) rather than being locked in at login.
    if (user.portal_default === "site") return navigate("/site");
    return navigate("/office");
  };

  const clearAlerts = () => { setError(""); setMessage(""); };

  const login = async () => {
    clearAlerts();
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid username or password. Please try again.");
        return;
      }

      // TaskFlow's /auth/login returns { token, user: { id, username,
      // full_name, role, department, department_id, can_verify,
      // is_mis_executive, can_add_site, can_add_employee } }.
      // Re-shape to the field names DIP's existing pages already read
      // (user.name, user.user_name, user.site_name, user.designation...)
      // so Navbar.jsx / access.js / the portal pages don't all need
      // rewriting on day one.
      const shapedUser = {
        id: data.user.id,
        user_name: data.user.username,
        name: data.user.full_name,
        role: data.user.role,
        department: data.user.department || "",
        designation: data.user.department || "",
        site_name: data.user.site_name || "",
        can_verify: data.user.can_verify,
        is_mis_executive: data.user.is_mis_executive,
        can_add_site: data.user.can_add_site,
        can_add_employee: data.user.can_add_employee,
        portal_default: data.user.portal_default || "office",
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(shapedUser));
      redirectUser(shapedUser);
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-page">
      {/* Left decorative panel */}
      <div className="lp-panel">
        <div className="lp-panel-inner">
          <img src={LOGO_URL} alt="DIP Projects" className="lp-panel-logo" />
          <div className="lp-panel-name">DIP Projects</div>
          <div className="lp-panel-tagline">Civil Project Management Consultants</div>
          <div className="lp-panel-divider" />
          <div className="lp-panel-quote">
            "Quality + Quantity to be dilevered on time."
          </div>
          <div className="lp-panel-dots" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="lp-form-side">
        <div className="lp-card">
          <div className="lp-mobile-brand">
            <img src={LOGO_URL} alt="DIP Projects" className="lp-mobile-logo" />
            <div>
              <div className="lp-mobile-name">DIP Projects</div>
              <div className="lp-mobile-sub">Civil Project Management</div>
            </div>
          </div>

          <div className="lp-heading">DIP Projects Platform</div>
          <div className="lp-subheading">Sign in to access project intelligence, reporting, and collaboration tools.</div>

          {message && (
            <div className="lp-alert lp-alert-success">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
              {message}
            </div>
          )}
          {error && (
            <div className="lp-alert lp-alert-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <div className="lp-field">
            <label className="lp-label">Username</label>
            <div className="lp-input-wrap">
              <svg className="lp-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input
                className="lp-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                onKeyDown={e => e.key === "Enter" && login()}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="lp-field">
            <label className="lp-label">Password</label>
            <div className="lp-input-wrap">
              <svg className="lp-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                className="lp-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                onKeyDown={e => e.key === "Enter" && login()}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="lp-eye-btn"
                onClick={() => setShowPassword(p => !p)}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <button className="lp-btn-primary" onClick={login} disabled={loading}>
            {loading ? (
              <><span className="lp-spinner" /> Signing in…</>
            ) : (
              <>
                Sign In
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              </>
            )}
          </button>

          <div className="lp-footer">© {new Date().getFullYear()} DIP Projects · All rights reserved</div>
        </div>
      </div>
    </div>
  );
}
