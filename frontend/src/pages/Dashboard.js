import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { useAuth } from "../hooks/useAuth";
import api from "../api";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [summary, setSummary] = useState({});

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data)).catch(() => {});
    api.get("/reports/summary").then((r) => setSummary(r.data)).catch(() => {});
  }, []);

return (
  <Layout>
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5ff",
        position: "relative",
        overflow: "hidden",
        padding: "28px",
      }}
    >
      {/* Top Right Circle */}
<div
  style={{
    position: "absolute",
    top: "-120px",
    right: "-120px",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(59,108,248,0.15) 0%, rgba(59,108,248,0.04) 60%, transparent 100%)",
    border: "2px solid rgba(59,108,248,0.18)",
    filter: "blur(2px)",
    zIndex: 0,
  }}
/>

      {/* Bottom Left Circle */}
<div
  style={{
    position: "absolute",
    bottom: "-150px",
    left: "-150px",
    width: "380px",
    height: "380px",
    borderRadius: "90%",
    background:
      "radial-gradient(circle, rgba(0, 115, 255, 0.58) 0%, rgba(0, 115, 255, 0.28) 60%, transparent 100%)",
    border: "5px solid rgba(96,165,250,0.2)",
    filter: "blur(2px)",
    zIndex: 0,
  }}
/>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #3b6cf8, #2563eb)",
            padding: "28px 32px",
            borderRadius: 16,
            color: "#fff",
            marginBottom: 28,
            boxShadow: "0 12px 30px rgba(59,108,248,0.25)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Welcome back, {user?.name} 👋
          </h2>

          <p
            style={{
              marginTop: 8,
              opacity: 0.9,
              textTransform: "capitalize",
            }}
          >
            {user?.role} Dashboard
          </p>
        </div>

        {/* Company Overview */}
        <h3
          style={{
            color: "#3b6cf8",
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: 14,
          }}
        >
          Company Overview
        </h3>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
          {/* Cards */}
        </div>

        {/* Leave Summary */}
        <h3
          style={{
            color: "#3b6cf8",
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            marginBottom: 14,
          }}
        >
          Leave Summary
        </h3>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {/* Cards */}
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <Card title="Total Employees" value={stats.employees}   color="#2563eb" />
        <Card title="Departments" value={stats.departments} color="#0891b2" />
        <Card title="Skills" value={stats.skills}      color="#7c3aed" />
        <Card title="Leave Types" value={stats.leaveTypes}  color="#d97706" />
      </div>

      <h3 style={{ color: "#475569", fontSize: 14, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Leave Summary</h3>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card title="Total Requests"value={summary.total}           color="#64748b" />
        <Card title="Pending Manager"value={summary.pending_manager} color="#d97706" />
        <Card title="Pending HR"value={summary.pending_hr}      color="#0891b2" />
        <Card title="Approved"value={summary.approved}        color="#16a34a" />
        <Card title="Rejected"value={summary.rejected}        color="#dc2626" />
      </div>
        </div>
      </div>
    </div>
  </Layout>
);
};

export default Dashboard;