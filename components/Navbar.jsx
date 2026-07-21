import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar({ onMenuToggle, menuOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const portalName = user?.role ? `${user.role} Portal` : "Employee Portal";

  const confirmLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("portalName");
    navigate("/");
  };

  return (
    <>
      <style>{`
        .app-navbar {
          height: 75px;
          overflow: visible;
          background: linear-gradient(135deg, #3d1200 0%, #7a2e00 50%, #c96a10 100%);
          border-bottom: none;
          box-shadow: 0 2px 16px rgba(61,18,0,.35);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 9999;
          gap: 16px;
          flex-wrap: nowrap;
          overflow: hidden;
        }
        .navbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .navbar-logo {
          height: 60px;
          width: 60px;
          object-fit: contain;
          flex-shrink: 0;
          background: #ffffff;
          padding: 4px;
          border-radius: 30px;
        }
        .navbar-brand-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .navbar-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          letter-spacing: .01em;
        }
        .navbar-tagline {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: #ffc97a;
          letter-spacing: .07em;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .navbar-divider {
          width: 1px;
          height: 28px;
          background: rgba(255,255,255,.2);
          flex-shrink: 0;
        }
        .navbar-user {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .navbar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,.2);
          border: 1.5px solid rgba(255,255,255,.4);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .navbar-user-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .navbar-user-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
        }
        .navbar-user-role {
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px;
          color: #ffc97a;
          font-weight: 500;
          white-space: nowrap;
        }
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          margin-left: auto;
        }
        .navbar-logout {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #3d1200;
          background: #fff;
          border: none;
          border-radius: 8px;
          padding: 7px 16px;
          cursor: pointer;
          transition: opacity .15s, transform .1s;
          white-space: nowrap;
        }
        .navbar-logout:hover { opacity: .9; background: #ffe8cc; }
        .navbar-logout:active { transform: scale(.97); }

        /* ── Logout Modal ── */
        .logout-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(15,10,5,0.65);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: nbFadeIn .18s ease;
        }
        @keyframes nbFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .logout-modal {
          background: #fff;
          border: 1.5px solid #c96a10;
          padding: 32px 28px 24px;
          max-width: 360px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
          box-shadow: 0 16px 48px rgba(61,18,0,0.25);
          animation: nbSlideUp .2s ease;
        }
        @keyframes nbSlideUp {
          from { transform: translateY(18px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .logout-modal-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg,#3d1200,#7a2e00,#c96a10);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
          flex-shrink: 0;
        }
        .logout-modal-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #1c1917;
          margin: 0;
        }
        .logout-modal-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: #57534e;
          line-height: 1.6;
          margin: 0;
        }
        .logout-modal-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: linear-gradient(135deg,rgba(61,18,0,0.06),rgba(201,106,16,0.08));
          border: 1px solid #c96a10;
          width: 100%;
          margin: 4px 0;
        }
        .logout-modal-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg,#3d1200,#7a2e00,#c96a10);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .logout-modal-uname {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          color: #1c1917;
          text-align: left;
        }
        .logout-modal-urole {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: #7a2e00;
          font-weight: 500;
          text-align: left;
        }
        .logout-modal-btns {
          display: flex;
          gap: 10px;
          width: 100%;
          margin-top: 6px;
        }
        .logout-btn-cancel {
          flex: 1;
          height: 44px;
          border: 1.5px solid #c96a10;
          background: #fff;
          color: #7a2e00;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .logout-btn-cancel:hover { background: rgba(201,106,16,0.07); }
        .logout-btn-confirm {
          flex: 1;
          height: 44px;
          border: none;
          background: linear-gradient(135deg,#3d1200,#7a2e00,#c96a10);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all .15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 3px 12px rgba(61,18,0,0.3);
        }
        .logout-btn-confirm:hover { opacity: .9; transform: translateY(-1px); }
        .logout-btn-confirm:active { transform: scale(.97); }

        @media (max-width: 600px) {
          .app-navbar {
            padding: 0 12px;
            height: 56px;
            gap: 8px;
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
          }
          .navbar-tagline { display: none; }
          .navbar-user-info { display: none; }
          .navbar-divider { display: none; }
          .navbar-logo { height: 40px; width: 40px; }
          .navbar-title { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .navbar-left { flex: 1; min-width: 0; overflow: hidden; display: flex; align-items: center; gap: 8px; }
          .navbar-right { flex-shrink: 0; display: flex; align-items: center; gap: 6px; }
          .navbar-right { position: absolute; right: 20px; top: 10px; }
          .navbar-left { position: absolute; left: 8px; top: 10px; }
          .navbar-avatar { width: 30px; height: 30px; font-size: 12px;margin-top: 4px; }
          .navbar-logout {
            width: 30px; height: 30px;
            padding: 0;
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
          margin-top: 4px;
          }
          .navbar-logout span { display: none; }
        }
        .navbar-ham {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          border: none;
          background: rgba(255, 255, 255, 0);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background .15s;
          margin-left: 6px;
        }
        .navbar-ham:hover { background: rgba(255,255,255,.2); }
        .navbar-ham:active { background: rgba(255,255,255,.28); }
        @media (max-width: 600px) {
          .navbar-ham { width: 34px; height: 34px; }
          .navbar-ham:hover { background: rgba(255, 255, 255, 0); }
          .navbar-ham:active { background: rgba(255, 255, 255, 0); }
        }
          
        @media (min-width: 901px) {
          .navbar-ham { display: none; }
        }
      `}</style>
  
      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="logout-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>

            <div className="logout-modal-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>

            <div className="logout-modal-title">Sign Out?</div>
            <div className="logout-modal-sub">
              You'll be returned to the login screen. Any unsaved changes will be lost.
            </div>

            {user && (
              <div className="logout-modal-user">
                <div className="logout-modal-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="logout-modal-uname">{user.name}</div>
                  <div className="logout-modal-urole">{user.role || user.designation || ""}</div>
                </div>
              </div>
            )}

            <div className="logout-modal-btns">
              <button className="logout-btn-cancel" onClick={() => setShowLogoutModal(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Cancel
              </button>
              <button className="logout-btn-confirm" onClick={confirmLogout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Yes, Sign Out
              </button>
            </div>

          </div>
        </div>
      )}

      <nav className="app-navbar">
        <div className="navbar-left">
          {onMenuToggle && (
            <button className="navbar-ham" onClick={onMenuToggle} aria-label="Toggle sidebar">
              {menuOpen
                ? <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          )}
          <img src={logo} alt="Logo" className="navbar-logo" />
          <div className="navbar-brand-text">
            <div className="navbar-title">{portalName}</div>
            <div className="navbar-tagline">Quality + Quantity · On Time · Every Time</div>
          </div>
        </div>

        <div className="navbar-right">
          {user && (
            <>
              <div className="navbar-divider"/>
              <div className="navbar-user">
                <div className="navbar-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="navbar-user-info">
                  <div className="navbar-user-name">{user.name}</div>
                  <div className="navbar-user-role">{user.role || user.designation || ""}</div>
                </div>
              </div>
              <div className="navbar-divider"/>
            </>
          )}
          <button className="navbar-logout" onClick={() => setShowLogoutModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
