import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api";

const inp = { display: "block", padding: "10px 14px", margin: "10px 0", width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#f8fafc" };

const Reset = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const nav = useNavigate();
  const token = searchParams.get("token") || "";

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post("/auth/reset-password", { token, newPassword });
      alert(r.data.message);
      nav("/");
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 36, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <h2 style={{ margin: "0 0 24px", color: "#1e293b", textAlign: "center" }}>Reset Password</h2>
        <form onSubmit={submit}>
          <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inp} required />
          <button type="submit" style={{ width: "100%", padding: "12px 0", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
            Reset Password
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}><Link to="/" style={{ color: "#2563eb" }}>Back to Login</Link></p>
      </div>
    </div>
  );
};

export default Reset;