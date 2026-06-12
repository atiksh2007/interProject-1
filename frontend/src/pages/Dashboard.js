import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { useAuth } from "../hooks/useAuth";
import api from "../api";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ employees: 0, departments: 0, skills: 0, leaveTypes: 0 });
  const [summary, setSummary] = useState({ total: 0, approved: 0, rejected: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "hr";

useEffect(() => {
  if (!user) return;

  // 1. ADMIN LOGIC
  if (isAdmin) {
    Promise.all([
      api.get("/reports/summary"),
      api.get("/dashboard/stats")
    ])
      .then(([summaryResponse, statsResponse]) => {
        setSummary(summaryResponse.data);
        setStats(statsResponse.data);
      })
      .catch((error) => console.error("Admin fetch error:", error))
      .finally(() => setLoading(false));
  } 
  
  // 2. EMPLOYEE LOGIC (Cleaned up - calling the exact working endpoint directly!)
  else {
    api.get("/leaves/my")
      .then((response) => {
        const dataPayload = response.data;
        
        // Ensure we gracefully handle if data is the array itself or nested inside an object
        const leaveList = Array.isArray(dataPayload) 
          ? dataPayload 
          : (Array.isArray(dataPayload?.leaves) ? dataPayload.leaves : []);

        // Calculate counts dynamically from your actual data rows
        const total = leaveList.length;
        const approved = leaveList.filter(l => l.status?.toLowerCase() === "approved").length;
        const rejected = leaveList.filter(l => l.status?.toLowerCase() === "rejected").length;
        const pending = leaveList.filter(l => l.status?.toLowerCase() === "pending").length;
        
        setSummary({ total, approved, rejected, pending });
      })
      .catch((error) => {
        console.error("Error loading employee leave summary data:", error);
      })
      .finally(() => setLoading(false));
  }
}, [user, isAdmin]);

  if (loading) {
    return (
      <Layout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <p>Loading Your Dashboard...</p>
        </div>
      </Layout>
    );
  }

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
        {/* Background Circles */}
        <div style={{ position: "absolute", top: "-120px", right: "-120px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,108,248,0.15) 0%, rgba(59,108,248,0.04) 60%, transparent 100%)", border: "2px solid rgba(59,108,248,0.18)", filter: "blur(2px)", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "-150px", left: "-150px", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0, 115, 255, 0.58) 0%, rgba(0, 115, 255, 0.28) 60%, transparent 100%)", border: "5px solid rgba(96,165,250,0.2)", filter: "blur(2px)", zIndex: 0 }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          
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
            <p style={{ marginTop: 8, opacity: 0.9, textTransform: "capitalize" }}>
              {user?.role} Dashboard
            </p>
          </div>

          {/* Company Overview (Only shows if Admin) */}
          {isAdmin && (
            <>
              <h3 style={{ color: "#3b6cf8", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 14 }}>
                Company Overview
              </h3>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
                <Card title="Total Employees" value={stats.employees} color="#2563eb" />
                <Card title="Departments" value={stats.departments} color="#0891b2" />
                <Card title="Skills" value={stats.skills} color="#7c3aed" />
                <Card title="Leave Types" value={stats.leaveTypes} color="#d97706" />
              </div>
            </>
          )}

          {/* Leave Summary Section */}
          <h3 style={{ color: "#3b6cf8", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 14 }}>
            {isAdmin ? "Company Leave Summary" : "My Leave Summary"}
          </h3>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Card title="Total Requests" value={summary.total || 0} color="#64748b" />
            <Card title="Approved" value={summary.approved || 0} color="#16a34a" />
            <Card title="Rejected" value={summary.rejected || 0} color="#dc2626" />
            {!isAdmin && <Card title="Pending" value={summary.pending || 0} color="#d97706" />}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;