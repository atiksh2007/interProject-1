import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isEmployee } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    nav("/");
  };

  const NavLink = ({ to, icon, label }) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "11px 16px",
          borderRadius: "10px",
          background: active 
            ? "linear-gradient(135deg, #3b6cf8 0%, #1e40af 100%)" 
            : "transparent",
          color: active ? "#ffffff" : "#94a3b8",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: active ? 600 : 500,
          letterSpacing: "0.2px",
          border: "1px solid transparent", // Prevents layout shifting when outline applies
          transition: "all 0.15s ease-in-out",
          boxShadow: active ? "0 4px 14px rgba(59, 108, 248, 0.3)" : "none",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = "rgba(59, 108, 248, 0.05)";
            e.currentTarget.style.borderColor = "rgba(59, 108, 248, 0.6)";
            e.currentTarget.style.color = "#f8fafc";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(59, 108, 248, 0.15)";
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        {active && (
          <div style={{
            position: "absolute", left: 0, top: "25%", bottom: "25%", 
            width: "4px", background: "#fff", borderRadius: "0 4px 4px 0"
          }} />
        )}
        <span style={{ fontSize: "16px", filter: active ? "none" : "grayscale(30%)" }}>{icon}</span> 
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 260, 
        background: "#0c1220", 
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex", 
        flexDirection: "column",
        padding: "32px 20px 24px 20px", 
        position: "fixed",
        top: 0, left: 0, bottom: 0, 
        overflowY: "auto",
        overflowX: "hidden", // Keeps the blurred decorative bubble self-contained
        zIndex: 10,
        boxShadow: "4px 0 24px rgba(0,0,0,0.15)"
      }}>
        
        {/* Tinted Dark Blue Blur Circle (Top Right Corner) */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-80px",
          width: "160px",
          height: "160px",
          borderRadius: "100%",
          background: "radial-gradient(circle, rgba(59, 108, 248, 0.22) 0%, rgba(12, 18, 32, 0) 70%)",
          filter: "blur(8px)",
          pointerEvents: "none",
          zIndex: 0
        }} />
        
        {/* Branding/Logo Container */}
        <div style={{ marginBottom: 36, paddingLeft: 8, position: "relative", zIndex: 1 }}>
          <h2 style={{ color: "#fff", margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: "-0.5px" }}>
            i-SOFTZONE
          </h2>
          <p style={{ color: "#3b6cf8", margin: "4px 0 0 0", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            HRMS Portal
          </p>
        </div>

        {/* User profile Widget */}
        <div style={{
          background: "rgba(255, 255, 255, 0.03)", 
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: 12, 
          padding: "14px 16px",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "relative",
          zIndex: 1
        }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #60a5fa, #3b6cf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <p style={{ color: "#f8fafc", margin: 0, fontWeight: 600, fontSize: 14, letterSpacing: "0.1px" }}>{user?.name}</p>
            <p style={{ color: "#64748b", margin: "2px 0 0 0", fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{user?.role}</p>
          </div>
        </div>

        {/* Navigation Elements */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, position: "relative", zIndex: 1 }}>
          <NavLink to="/dashboard" icon="📊" label="Dashboard" />
          <NavLink to="/profile" icon="👤" label="My Profile" />
          <NavLink to="/notifications" icon="🔔" label="Notifications" />

          {/* Employee Section */}
          {isEmployee && (
            <>
              <div style={{ color: "#475569", fontSize: 11, fontWeight: 700, padding: "20px 12px 6px", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                Workplace
              </div>
              {!isAdmin && <NavLink to="/apply-leave" icon="📝" label="Apply Leave" />}
              {!isAdmin && <NavLink to="/my-leaves" icon="📋" label="My Leaves" />}
              <NavLink to="/leave-balance" icon="💰" label="Leave Balance" />
              <NavLink to="/my-skills" icon="🎯" label="My Skills" />
              <NavLink to="/my-assets" icon="💼" label="My Assets" />
            </>
          )}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <div style={{ color: "#475569", fontSize: 11, fontWeight: 700, padding: "20px 12px 6px", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                Management
              </div>
              <NavLink to="/employees" icon="👥" label="Employees" />
              <NavLink to="/employees/create" icon="➕" label="Create Employee" />
              <NavLink to="/departments" icon="🏢" label="Departments" />
              <NavLink to="/skills" icon="🎯" label="Skills" />
              <NavLink to="/leave-approvals" icon="✅" label="All Approvals" />
              <NavLink to="/leave-types" icon="⚙️" label="Leave Types" />
              <NavLink to="/hr-reports" icon="📈" label="Reports" />
              <NavLink to="/assets" icon="💻" label="Assets" />
              <NavLink to="/audit" icon="🔍" label="Audit Trail" />
              <NavLink to="/advanced-reports" icon="📋" label="Adv. Reports" />
              <NavLink to="/analytics" icon="📊" label="Analytics" />
            </>
          )}
        </nav>

        {/* Logout Action */}
        <button 
          onClick={handleLogout} 
          style={{
            marginTop: 24, 
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.08)", 
            color: "#f87171",
            border: "1px solid rgba(239, 68, 68, 0.15)", 
            borderRadius: "10px",
            cursor: "pointer", 
            textAlign: "left",
            fontSize: "14px", 
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
            transition: "all 0.2s ease-in-out",
            position: "relative",
            zIndex: 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#ef4444";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* ── Canvas Workspace Container ── */}
      <main style={{
        marginLeft: 260, 
        flex: 1,
        padding: "40px", 
        background: "#f1f5ff", 
        minHeight: "100vh",
        boxSizing: "border-box"
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;