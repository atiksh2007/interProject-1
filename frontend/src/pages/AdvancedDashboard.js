// frontend/src/pages/AdvancedDashboard.js
// Install: npm install recharts
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import api from "../api";

const COLORS = ["#2563eb","#16a34a","#dc2626","#d97706","#7c3aed","#0891b2","#db2777"];

const ChartCard = ({ title, children, style = {} }) => (
  <div style={{
    background: "#fff", borderRadius: 10, padding: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)", ...style,
  }}>
    <h3 style={{ margin: "0 0 20px", color: "#1e293b", fontSize: 15 }}>{title}</h3>
    {children}
  </div>
);

export default function AdvancedDashboard() {
  const [stats,        setStats]      = useState({});
  const [summary,      setSummary]    = useState({});
  const [trend,        setTrend]      = useState([]);
  const [deptReport,   setDeptReport] = useState([]);
  const [deptStats,    setDeptStats]  = useState([]);
  const [assetStatus,  setAssetStatus]= useState([]);

  useEffect(() => {
    api.get("/dashboard/stats").then(r => setStats(r.data)).catch(() => {});
    api.get("/reports/summary").then(r => setSummary(r.data)).catch(() => {});
    api.get("/reports/monthly-trend").then(r => setTrend(r.data)).catch(() => {});
    api.get("/reports/department-wise").then(r => setDeptReport(r.data)).catch(() => {});
    api.get("/reports/department-stats").then(r => setDeptStats(r.data)).catch(() => {});
    api.get("/assets", { params: { limit: 200 } })
       .then(r => {
         const counts = {};
         r.data.data.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
         setAssetStatus(Object.entries(counts).map(([name, value]) => ({ name, value })));
       }).catch(() => {});
  }, []);

  const leaveStatusData = [
    { name: "Pending (Manager)", value: parseInt(summary.pending_manager) || 0 },
    { name: "Pending (HR)",      value: parseInt(summary.pending_hr)      || 0 },
    { name: "Approved",          value: parseInt(summary.approved)        || 0 },
    { name: "Rejected",          value: parseInt(summary.rejected)        || 0 },
  ].filter(d => d.value > 0);

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>📊 Advanced Analytics Dashboard</h2>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <Card title="Total Employees" value={stats.employees}   color="#2563eb" />
        <Card title="Departments"     value={stats.departments} color="#0891b2" />
        <Card title="Total Leaves"    value={summary.total}     color="#7c3aed" />
        <Card title="Approved Leaves" value={summary.approved}  color="#16a34a" />
        <Card title="Pending Leaves"  value={(parseInt(summary.pending_manager)||0) + (parseInt(summary.pending_hr)||0)} color="#d97706" />
        <Card title="Skills"          value={stats.skills}      color="#db2777" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

        {/* Monthly Leave Trend - Line */}
        <ChartCard title="📅 Monthly Leave Trend" style={{ gridColumn: "1 / -1" }}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="total_requests" stroke="#2563eb" fill="url(#totalGrad)" name="Total" />
              <Area type="monotone" dataKey="approved"       stroke="#16a34a" fill="none" name="Approved" />
              <Area type="monotone" dataKey="rejected"       stroke="#dc2626" fill="none" name="Rejected" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Leave Status Pie */}
        <ChartCard title="🥧 Leave Status Breakdown">
          {leaveStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={leaveStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {leaveStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: "#94a3b8", textAlign: "center", paddingTop: 80 }}>No data yet</p>}
        </ChartCard>

        {/* Asset Status Pie */}
        <ChartCard title="💻 Asset Status">
          {assetStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={assetStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {assetStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: "#94a3b8", textAlign: "center", paddingTop: 80 }}>No assets found</p>}
        </ChartCard>

        {/* Department Leave Bar */}
        <ChartCard title="🏢 Department-wise Leave Days" style={{ gridColumn: "1 / -1" }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptReport}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="department_name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="days_taken" name="Days Taken"    fill="#2563eb" radius={[4,4,0,0]} />
              <Bar dataKey="approved"   name="Requests"      fill="#16a34a" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Department Stats - avg salary */}
        {deptStats.length > 0 && (
          <ChartCard title="💰 Average Salary by Department" style={{ gridColumn: "1 / -1" }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deptStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department_name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => `₹${Number(v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="avg_salary"      name="Avg Salary"   fill="#7c3aed" radius={[4,4,0,0]} />
                <Bar dataKey="total_employees" name="Employees"     fill="#0891b2" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </Layout>
  );
}
