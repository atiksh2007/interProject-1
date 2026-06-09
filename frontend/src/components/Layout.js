import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isHR, isManager, isEmployee } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); nav("/"); };

  const NavLink = ({ to, icon, label }) => {
    const active = pathname === to;
    return (
      <Link to={to} style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px", borderRadius: 8,
        background: active ? "#2563eb" : "transparent",
        color: active ? "#fff" : "#94a3b8",
        textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
        transition: "all 0.2s",
      }}>
        <span>{icon}</span> {label}
      </Link>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: 240, background: "#0f172a",
        display: "flex", flexDirection: "column",
        padding: "24px 16px", position: "fixed",
        top: 0, left: 0, bottom: 0, overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#fff", margin: 0, fontSize: 20, fontWeight: 700 }}>i-SOFTZONE</h2>
          <p style={{ color: "#475569", margin: "4px 0 0 0", fontSize: 12 }}>HRMS Portal</p>
        </div>

        {/* User info */}
        <div style={{
          background: "#1e293b", borderRadius: 8, padding: "12px 14px",
          marginBottom: 24,
        }}>
          <p style={{ color: "#fff", margin: 0, fontWeight: 600, fontSize: 14 }}>{user?.name}</p>
          <p style={{ color: "#64748b", margin: "2px 0 0 0", fontSize: 12, textTransform: "capitalize" }}>{user?.role}</p>
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          <NavLink to="/dashboard"      icon="📊" label="Dashboard" />
          <NavLink to="/profile"        icon="👤" label="My Profile" />
          <NavLink to="/notifications"  icon="🔔" label="Notifications" />

          {/* Employee only */}
          {isEmployee && <>
            <div style={{ color: "#334155", fontSize: 11, padding: "12px 14px 4px", textTransform: "uppercase", letterSpacing: 1 }}>Leave</div>
            <NavLink to="/apply-leave"    icon="📝" label="Apply Leave" />
            <NavLink to="/my-leaves"      icon="📋" label="My Leaves" />
            <NavLink to="/leave-balance"  icon="💰" label="Leave Balance" />
            <NavLink to="/my-skills"      icon="🎯" label="My Skills" />
             <NavLink to="/my-assets" icon="💼" label="My Assets" />
          </>}

          {/* Manager */}
          {isManager && <>
            <div style={{ color: "#334155", fontSize: 11, padding: "12px 14px 4px", textTransform: "uppercase", letterSpacing: 1 }}>Manager</div>
            <NavLink to="/leave-approvals" icon="✅" label="Approvals" />
          </>}

          {/* HR */}
          {isHR && <>
            <div style={{ color: "#334155", fontSize: 11, padding: "12px 14px 4px", textTransform: "uppercase", letterSpacing: 1 }}>HR</div>
            <NavLink to="/leave-approvals" icon="✅" label="Final Approvals" />
            <NavLink to="/leave-types"     icon="⚙️" label="Leave Types" />
            <NavLink to="/hr-reports"      icon="📈" label="Reports" />
            <NavLink to="/assets"icon="💻" label="Asset Management" />
            <NavLink to="/advanced-reports"icon="📋" label="Advanced Reports" />
             <NavLink to="/analytics"icon="📊" label="Analytics" />
          </>}

          {/* Admin */}
          {isAdmin && <>
            <div style={{ color: "#334155", fontSize: 11, padding: "12px 14px 4px", textTransform: "uppercase", letterSpacing: 1 }}>Admin</div>
            <NavLink to="/employees"icon="👥" label="Employees" />
            <NavLink to="/employees/create"icon="➕" label="Create Employee" />
            <NavLink to="/departments"icon="🏢" label="Departments" />
            <NavLink to="/skills"icon="🎯" label="Skills" />
            <NavLink to="/leave-approvals"icon="✅" label="All Approvals" />
            <NavLink to="/leave-types"icon="⚙️" label="Leave Types" />
            <NavLink to="/hr-reports"icon="📈" label="Reports" />
            <NavLink to="/assets"icon="💻" label="Assets" />
            <NavLink to="/audit"icon="🔍" label="Audit Trail" />
            <NavLink to="/advanced-reports"icon="📋" label="Adv. Reports" />
            <NavLink to="/analytics"icon="📊" label="Analytics" />
          </>}
        </nav>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          marginTop: 20, padding: "10px 14px",
          background: "#7f1d1d", color: "#fff",
          border: "none", borderRadius: 8,
          cursor: "pointer", textAlign: "left",
          fontSize: 14, fontWeight: 500,
        }}>
          🚪 Logout
        </button>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: 240, flex: 1,
        padding: 32, background: "#f1f5f9",
        minHeight: "100vh",
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;