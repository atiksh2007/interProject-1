import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api";

const ROLES = [
  { id: "employee", label: "Employee", desc: "View leaves, assets & profile", icon: "👤", color: "#3b6cf8" },
  { id: "admin",    label: "Admin",    desc: "Full system control",            icon: "🛡️", color: "#7c3aed" },
];

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Login = () => {
  const [role, setRole]       = useState("employee");
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const nav        = useNavigate();
  const { login }  = useAuth();

  const activeRole = ROLES.find(r => r.id === role);
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post("/auth/login", form);
      const { token, role: ur, userId, name } = r.data;
      if (ur !== role) {
        alert(`This account is not registered as ${activeRole.label}`);
        return;
      }
      login({ token, role: ur, userId, name });
      if (ur === "employee") {
        const p = await api.get("/employees");
        nav(p.data.length === 0 ? "/complete-profile" : "/dashboard");
      } else {
        nav("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c1220",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      padding: "24px 16px",
    }}>
      <div style={{
        display: "flex",
        width: "100%",
        maxWidth: 780,
        minHeight: 520,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>

        {/* ── Left panel ── */}
        <div style={{
          width: 280,
          flexShrink: 0,
          background: "#0c1220",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          padding: "36px 26px",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 44 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "#3b6cf8",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, letterSpacing: "-0.2px" }}>i-SOFTZONE</div>
              <div style={{ color: "#374151", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase" }}>HRMS Portal</div>
            </div>
          </div>

          {/* Role selector */}
          <p style={{ color: "#374151", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>
            Sign in as
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ROLES.map((r) => {
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 12px", borderRadius: 10, border: "none",
                    cursor: "pointer", textAlign: "left", width: "100%",
                    background: active ? "rgba(59,108,248,0.14)" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? "rgba(59,108,248,0.14)" : "transparent"; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: active ? `${r.color}25` : "rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 17, flexShrink: 0,
                  }}>{r.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: active ? "#fff" : "#9ca3af" }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: active ? "#6b7aad" : "#374151", marginTop: 2 }}>{r.desc}</div>
                  </div>
                  {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b6cf8", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* Tagline */}
          {/* <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24 }}>
            <p style={{ color: "#374151", fontSize: 12, lineHeight: 1.7, margin: 0 }}>
              Manage your workforce with{" "}
              <span style={{ color: "#3b6cf8" }}>precision</span>.<br />
              Leave · Assets · Payroll · Analytics.
            </p>
          </div> */}
        </div>

        {/* ── Right panel ── */}
        <div style={{
          flex: 1,
          background: "#f4f5f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "36px 28px",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 14,
            padding: "36px 32px",
            width: "100%",
            maxWidth: 340,
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          }}>
            {/* Role badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: `${activeRole.color}18`,
              color: activeRole.color,
              fontSize: 12, fontWeight: 600,
              padding: "5px 12px", borderRadius: 20,
              marginBottom: 14,
            }}>
              <span>{activeRole.icon}</span>
              <span>{activeRole.label}</span>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 28 }}>
              Sign in to your {activeRole.label.toLowerCase()} account
            </p>

            <form onSubmit={submit}>
              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, letterSpacing: "0.3px" }}>
                  Email address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handle}
                  required
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: "1.5px solid #e2e8f0", borderRadius: 8,
                    fontSize: 14, color: "#0f172a", background: "#fafafa",
                    outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => e.target.style.borderColor = activeRole.color}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.3px" }}>
                    Password
                  </label>
                  <Link to="/forgot" style={{ fontSize: 12, color: activeRole.color, textDecoration: "none", fontWeight: 500 }}>
                    Forgot?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handle}
                    required
                    style={{
                      width: "100%", padding: "10px 42px 10px 14px",
                      border: "1.5px solid #e2e8f0", borderRadius: 8,
                      fontSize: 14, color: "#0f172a", background: "#fafafa",
                      outline: "none", boxSizing: "border-box",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={e => e.target.style.borderColor = activeRole.color}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    title={showPass ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: showPass ? activeRole.color : "#94a3b8",
                      padding: 0, display: "flex", alignItems: "center",
                      transition: "color 0.15s",
                    }}
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "12px",
                  background: loading ? "#94a3b8" : activeRole.color,
                  color: "#fff", border: "none", borderRadius: 9,
                  fontSize: 14, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.2px", transition: "background 0.2s",
                }}
              >
                {loading ? "Signing in…" : `Sign in as ${activeRole.label} →`}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              <span style={{ fontSize: 11, color: "#94a3b8" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>

            <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", margin: 0 }}>
              No account?{" "}
              <Link to="/signup" style={{ color: activeRole.color, textDecoration: "none", fontWeight: 600 }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;