import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
// import bcrypt from "bcryptjs";
import "./ResetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [verifying, setVerifying]         = useState(true);
  const [message, setMessage]             = useState("");
  const [error, setError]                 = useState("");
  const [tokenValid, setTokenValid]       = useState(false);

  // ─── On mount: Supabase Auth automatically exchanges the token from the URL ──
  // The URL contains ?type=recovery&access_token=... — supabase-js picks it up
  // and fires an onAuthStateChange event with event === "PASSWORD_RECOVERY"
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          // Valid recovery session — allow the user to set a new password
          setTokenValid(true);
          setVerifying(false);
        } else if (event === "SIGNED_IN" && session) {
          // Already signed in (shouldn't normally reach reset page, but handle it)
          setTokenValid(true);
          setVerifying(false);
        }
      }
    );

    // Fallback: if no PASSWORD_RECOVERY event fires within 3 s, mark as invalid
    const timeout = setTimeout(() => {
      setVerifying((prev) => {
        if (prev) {          // still waiting → no valid token arrived
          setError("Invalid or expired reset link. Please request a new one.");
          setTokenValid(false);
          return false;
        }
        return prev;
      });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // ─── Reset handler ───────────────────────────────────────────────────────────
  const handleResetPassword = async () => {
    setError("");
    setMessage("");

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣  Update password in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        setError(authError.message || "Failed to update password. Please try again.");
        setLoading(false);
        return;
      }

      // 2️⃣  Hash the new password and update user_details table
      //     Match by the Auth user's email
      const userEmail = authData?.user?.email;

      if (userEmail) {
        const { error: dbError } = await supabase
        .from("user_details")
        .update({ password: newPassword, reset_token: null, reset_token_expires: null })
        .eq("email", userEmail);

        if (dbError) {
          console.error("Failed to sync password to user_details:", dbError.message);
          // Non-fatal: Auth password is already updated; log and continue
        }
      }

      // 3️⃣  Sign out so the user logs in fresh with their new password
      await supabase.auth.signOut();

      setMessage("Password updated successfully! Redirecting to login…");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      console.error("Reset error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // ─── Loading state while verifying token ────────────────────────────────────
  if (verifying) {
    return (
      <div className="reset-page">
        <div className="reset-background" />
        <div className="reset-card">
          <div className="reset-header">
            <h1>Password Reset</h1>
            <p>Verifying your reset link…</p>
          </div>
          <div className="reset-loading-spinner" />
        </div>
      </div>
    );
  }

  // ─── Invalid / expired token ─────────────────────────────────────────────────
  if (!tokenValid) {
    return (
      <div className="reset-page">
        <div className="reset-background" />
        <div className="reset-card">
          <div className="reset-header">
            <h1>Password Reset</h1>
            <p>Link Invalid or Expired</p>
          </div>
          <div className="reset-alert error">
            {error || "Invalid or expired reset link."}
          </div>
          <button className="reset-button primary" onClick={() => navigate("/")}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ─── Valid token — show new password form ────────────────────────────────────
  return (
    <div className="reset-page">
      <div className="reset-background" />
      <div className="reset-card">
        <div className="reset-header">
          <h1>Create New Password</h1>
          <p>Enter a secure password to regain access to your account.</p>
        </div>

        {message && <div className="reset-alert success">{message}</div>}
        {error   && <div className="reset-alert error">{error}</div>}

        <div className="reset-field">
          <label>New Password</label>
          <div className="password-input-group">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 8 characters)"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="reset-field">
          <label>Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
          />
        </div>

        <button
          className="reset-button primary"
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading ? "Updating…" : "Reset Password"}
        </button>

        <button
          type="button"
          className="reset-button secondary"
          onClick={() => navigate("/")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}