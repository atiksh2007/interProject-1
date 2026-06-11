import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api";

const inp = { display: "block", padding: "10px 14px", margin: "10px 0", width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#f8fafc" };

const Reset = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const token = searchParams.get("token") || "";

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Reset token is missing. Please use the reset link from your email.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const r = await api.post("/auth/reset-password", { token, newPassword });
      alert(r.data.message);
      nav("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 36, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <h2 style={{ margin: "0 0 24px", color: "#1e293b", textAlign: "center" }}>Reset Password</h2>
        <form onSubmit={submit}>
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inp} required />
          <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inp} required />
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px 0", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#dc2626" }}>{message}</p>}
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}><Link to="/" style={{ color: "#2563eb" }}>Back to Login</Link></p>
      </div>
    </div>
  );
};

export default Reset;
