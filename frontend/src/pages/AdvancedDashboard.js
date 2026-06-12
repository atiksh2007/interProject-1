import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
  CartesianGrid,
} from "recharts";
import api from "../api";

const PALETTE = ["#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#059669"];

const ChartCard = ({ title, children, style = {}, span = 1 }) => (
  <div style={{
    background: "#fff", borderRadius: 10, padding: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    gridColumn: span === 2 ? "1 / -1" : undefined,
    ...style,
  }}>
    <h3 style={{ margin: "0 0 20px", color: "#1e293b", fontSize: 15 }}>{title}</h3>
    {children}
  </div>
);

// const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "" }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
//       <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#1e293b" }}>{label}</p>
//       {payload.map((p, i) => (
//         <p key={i} style={{ margin: "2px 0", color: p.color }}>
//           {p.name}: <b>{prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{suffix}</b>
//         </p>
//       ))}
//     </div>
//   );
// };

export default function AdvancedDashboard() {
  const [stats,       setStats]      = useState({});
  const [summary,     setSummary]    = useState({});
  const [trend,       setTrend]      = useState([]);
  const [deptReport,  setDeptReport] = useState([]);
  const [mostAbsent,  setMostAbsent] = useState([]);
  const [salaryRank,  setSalaryRank] = useState([]);
  const [assetStatus, setAssetStatus]= useState([]);
  const [deptAssets,  setDeptAssets] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats").then(r => setStats(r.data)).catch(() => {});
    api.get("/reports/summary").then(r => setSummary(r.data)).catch(() => {});
    api.get("/reports/monthly-trend").then(r => setTrend(r.data)).catch(() => {});
    api.get("/reports/department-wise").then(r => setDeptReport(r.data)).catch(() => {});
    api.get("/reports/most-absent").then(r => setMostAbsent(r.data)).catch(() => {});
    api.get("/reports/salary-ranking").then(r => setSalaryRank(r.data)).catch(() => {});



    // Asset status breakdown
    api.get("/assets", { params: { limit: 500 } })
      .then(r => {
        const counts = {};
        r.data.data.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
        setAssetStatus(Object.entries(counts).map(([name, value]) => ({ name, value })));
      }).catch(() => {});

    // Assets per department — we'll build from allocations
    api.get("/assets/allocations")
      .then(r => {
        const byDept = {};
        r.data.forEach(a => {
          const d = a.department_name || "Unknown";
          byDept[d] = (byDept[d] || 0) + 1;
        });
        setDeptAssets(Object.entries(byDept).map(([dept, count]) => ({ dept, count })).sort((a, b) => b.count - a.count));
      }).catch(() => {});
  }, []);

  // Most absent — top 8
  const absentTop8 = mostAbsent.slice(0, 8).map(e => ({
    name: e.name?.split(" ")[0] || "—",
    fullName: e.name,
    days: Number(e.days_taken) || 0,
    dept: e.department_name || "—",
  }));

  // Salary top 10 for ranking chart
  const salaryTop10 = salaryRank.slice(0, 10).map(e => ({
    name: e.name?.split(" ")[0] || "—",
    fullName: e.name,
    salary: Number(e.salary) || 0,
    dept: e.department_name || "—",
    rank: e.overall_rank,
  }));



  const leaveStatusData = [
    { name: "Pending (Mgr)", value: parseInt(summary.pending_manager) || 0 },
    { name: "Pending (HR)",  value: parseInt(summary.pending_hr)      || 0 },
    { name: "Approved",      value: parseInt(summary.approved)        || 0 },
    { name: "Rejected",      value: parseInt(summary.rejected)        || 0 },
  ].filter(d => d.value > 0);

  // Highlight top earner
  const topEarner = salaryTop10[0];

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>📊 Analytics Dashboard</h2>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <Card title="Total Employees" value={stats.employees}   color="#2563eb" />
        <Card title="Departments"     value={stats.departments} color="#0891b2" />
        <Card title="Total Leaves"    value={summary.total}     color="#7c3aed" />
        <Card title="Approved Leaves" value={summary.approved}  color="#16a34a" />
        <Card title="Pending"         value={(parseInt(summary.pending_manager)||0)+(parseInt(summary.pending_hr)||0)} color="#d97706" />
        <Card title="Skills"          value={stats.skills}      color="#db2777" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>

        {/* ① Most absent employees ── */}
        <ChartCard title="🏆 Most Absent Employees (approved leave days)" span={2}>
          {absentTop8.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>No data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={absentTop8} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v, i) => absentTop8[i]?.name || v}
                  />
                  <YAxis tick={{ fontSize: 12 }} label={{ value: "Days", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 11, fill: "#94a3b8" } }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                          <p style={{ margin: "0 0 2px", fontWeight: 600, color: "#1e293b" }}>{d.fullName}</p>
                          <p style={{ margin: "2px 0", color: "#64748b" }}>{d.dept}</p>
                          <p style={{ margin: 0, color: "#dc2626", fontWeight: 700 }}>{d.days} days absent</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="days" name="Days Absent" radius={[6, 6, 0, 0]}>
                    {absentTop8.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "#dc2626" : i === 1 ? "#d97706" : "#2563eb"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap", marginBottom: 20 }}>
                {[["#dc2626", "Most absent"], ["#d97706", "2nd most"], ["#2563eb", "Others"]].map(([c, l]) => (
                  <span key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }} />
                    {l}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 24, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 500 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                      <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Rank</th>
                      <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Employee Name</th>
                      <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600 }}>Department</th>
                      <th style={{ padding: "10px 12px", color: "#475569", fontWeight: 600, textAlign: "right" }}>Days Absent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absentTop8.map((e, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#64748b" }}>#{index + 1}</td>
                        <td style={{ padding: "10px 12px", color: "#1e293b", fontWeight: 600 }}>{e.fullName}</td>
                        <td style={{ padding: "10px 12px", color: "#64748b" }}>{e.dept}</td>
                        <td style={{ padding: "10px 12px", color: "#dc2626", fontWeight: 700, textAlign: "right" }}>{e.days} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </ChartCard>

        {/* ② Dept assets distribution ── */}
        <ChartCard title="💻 Assets by Department">
          {deptAssets.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>No allocation data</p>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {deptAssets.map((d, i) => (
                  <span key={d.dept} style={{
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 12, color: "#64748b",
                  }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: PALETTE[i % PALETTE.length], display: "inline-block" }} />
                    {d.dept}
                  </span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={deptAssets} dataKey="count" nameKey="dept"
                    cx="50%" cy="50%" outerRadius={85} innerRadius={40}
                    label={({ dept, count }) => `${count}`}
                    labelLine={false}
                  >
                    {deptAssets.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} assets`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </ChartCard>

        {/* ③ Asset status pie ── */}
        <ChartCard title="📦 Asset Status Overview">
          {assetStatus.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>No assets found</p>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {assetStatus.map((d, i) => (
                  <span key={d.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: PALETTE[i % PALETTE.length], display: "inline-block" }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={assetStatus} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={85}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {assetStatus.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </ChartCard>

        {/* ④ Highest salary employees ── */}
        <ChartCard title="💰 Top 10 Highest Salaries" span={2}>
          {topEarner && (
            <div style={{
              background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
              borderRadius: 10, padding: "16px 20px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "#f59e0b", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff",
                flexShrink: 0,
              }}>
                {topEarner.fullName?.[0] || "?"}
              </div>
              <div>
                <p style={{ margin: 0, color: "#f59e0b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Highest Earner</p>
                <p style={{ margin: "2px 0", color: "#fff", fontWeight: 700, fontSize: 17 }}>{topEarner.fullName}</p>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>{topEarner.dept}</p>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <p style={{ margin: 0, color: "#f59e0b", fontWeight: 700, fontSize: 22 }}>
                  ₹{topEarner.salary.toLocaleString()}
                </p>
                <p style={{ margin: 0, color: "#64748b", fontSize: 12 }}>per month</p>
              </div>
            </div>
          )}
          {salaryTop10.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>No salary data</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salaryTop10} margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
                        <p style={{ margin: "0 0 2px", fontWeight: 600, color: "#1e293b" }}>{d.fullName}</p>
                        <p style={{ margin: "2px 0", color: "#64748b" }}>{d.dept}</p>
                        <p style={{ margin: 0, color: "#16a34a", fontWeight: 700 }}>₹{d.salary.toLocaleString()}</p>
                        <p style={{ margin: 0, color: "#2563eb" }}>Rank #{d.rank}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="salary" name="Salary" radius={[6, 6, 0, 0]}>
                  {salaryTop10.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c2f" : "#2563eb"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {salaryTop10.length > 0 && (
            <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
              {[["#f59e0b", "1st"], ["#94a3b8", "2nd"], ["#cd7c2f", "3rd"], ["#2563eb", "Top 10"]].map(([c, l]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }} />
                  {l}
                </span>
              ))}
            </div>
          )}
        </ChartCard>


        {/* ⑥ Monthly leave trend ── */}
        <ChartCard title="📅 Monthly Leave Trend" span={2}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="total_requests" stroke="#2563eb" fill="url(#totalGrad)" name="Total" />
              <Area type="monotone" dataKey="approved"       stroke="#16a34a" fill="none"            name="Approved" />
              <Area type="monotone" dataKey="rejected"       stroke="#dc2626" fill="none"            name="Rejected" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ⑦ Leave status pie ── */}
        <ChartCard title="🥧 Leave Status Breakdown">
          {leaveStatusData.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", paddingTop: 80 }}>No data yet</p>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {leaveStatusData.map((d, i) => (
                  <span key={d.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: PALETTE[i], display: "inline-block" }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={leaveStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ value }) => value}>
                    {leaveStatusData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </ChartCard>

        {/* ⑧ Dept leave days ── */}
        <ChartCard title="🏢 Leave Days by Department">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptReport} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="department_name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="days_taken" name="Days Taken"  fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approved"   name="# Approved"  fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </Layout>
  );
}