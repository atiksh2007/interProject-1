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
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, color: "#1e293b", fontSize: 24 }}>Welcome back, {user?.name} 👋</h2>
        <p style={{ color: "#64748b", margin: "4px 0 0 0", textTransform: "capitalize" }}>{user?.role} Dashboard</p>
      </div>

      <h3 style={{ color: "#475569", fontSize: 14, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Company Overview</h3>
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
    </Layout>
  );
};

export default Dashboard;