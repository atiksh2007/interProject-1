import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import api from "../api";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const inp = {
  display: "block", padding: "10px 14px", margin: "8px 0 16px",
  width: "100%", border: "1px solid #cbd5e1", borderRadius: 8,
  fontSize: 14, boxSizing: "border-box", background: "#f8fafc",
  outline: "none", transition: "all 0.15s ease-in-out"
};

const COLORS = {
  present: "#2563eb", // Shifted to aesthetic blue
  absent:   "#94a3b8", 
  leave:    "#60a5fa",
  approved: "#3b6cf8",
  pending:  "#93c5fd",
  rejected: "#cbd5e1",
  cancelled:"#e2e8f0",
};

const SectionTitle = ({ icon, title }) => (
  <h3 style={{ margin: "0 0 16px", color: "#0f172a", fontSize: 15, display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
    <span>{icon}</span> {title}
  </h3>
);

const MetricCard = ({ label, value, color }) => (
  <div style={{
    background: "#f8fafc", borderRadius: 10, padding: "14px 18px",
    borderLeft: `4px solid ${color}`, flex: "1 1 180px",
    borderTop: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9"
  }}>
    <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</p>
    <p style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 800, color }}>{value ?? "-"}</p>
  </div>
);

const Panel = ({ children, style = {} }) => (
  <div style={{
    background: "#fff", borderRadius: 12, padding: 24,
    border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.01)", ...style,
  }}>
    {children}
  </div>
);

const EmployeeDetail = () => {
  const { id }      = useParams();
  const location    = useLocation();
  const { isAdmin } = useAuth();

  const [data, setData]         = useState(null);
  const [editMode, setEditMode] = useState(location.state?.edit || false);
  const [editForm, setEditForm] = useState({});
  const [departments, setDepts] = useState([]);
  const [files, setFiles]       = useState([]);
  const [attendance, setAttendance]     = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [assets, setAssets]             = useState([]);

  const fetchAll = useCallback(async () => {
    try {
      const [empRes, attRes, leaveRes] = await Promise.all([
        api.get(`/employees/${id}`),
        api.get(`/attendance/employee/${id}`),
        api.get(`/leaves/my`).catch(() => ({ data: [] })),
      ]);
      setData(empRes.data);
      setAttendance(attRes.data);
      setLeaveHistory(leaveRes.data);
      setEditForm({
        department_id: empRes.data.employee.department_id,
        phone:         empRes.data.employee.phone        || "",
        address:       empRes.data.employee.address      || "",
        designation:   empRes.data.employee.designation  || "",
        salary:        empRes.data.employee.salary       || "",
      });

      const allocRes = await api.get(`/assets/allocations`, {
        params: { employee_id: id }
      }).catch(() => ({ data: [] }));
      setAssets(allocRes.data);
    } catch (err) { console.error(err); }
  },[id]);

  useEffect(() => {
    fetchAll();

    if (isAdmin) {
      api.get("/departments").then((r) => setDepts(r.data));
    }
  }, [fetchAll, isAdmin]);

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/employees/${id}`, editForm);
      setEditMode(false);
      fetchAll();
      alert("Updated!");
    } catch (err) { alert(err.response?.data?.message || "Update failed"); }
  };

  const uploadImages = async (e) => {
    e.preventDefault();
    if (!files.length) return alert("Select images first");
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    fd.append("employee_id", id);
    try {
      await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setFiles([]);
      fetchAll();
      alert("Uploaded!");
    } catch (err) { alert(err.response?.data?.message || "Upload failed"); }
  };

  const deleteImage = async (imgId) => {
    if (!window.confirm("Delete this image?")) return;
    try { await api.delete(`/upload/${imgId}`); fetchAll(); }
    catch { alert("Delete failed"); }
  };

  if (!data) return <Layout><p style={{ color: "#64748b", padding: 32, fontFamily: "system-ui" }}>Loading…</p></Layout>;

  const { employee, skills, images } = data;

  // Attendance metrics transformation configuration 
  const attCounts = attendance.reduce((acc, r) => {
    let s = r.status || "Unknown";
    s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const attPieData = Object.entries(attCounts).map(([name, value]) => ({ name, value }));

  const monthlyAtt = attendance.reduce((acc, r) => {
    const m = r.date ? r.date.slice(0, 7) : "N/A";
    if (!acc[m]) acc[m] = { month: m, Present: 0, Absent: 0 };
    let s = r.status || "Unknown";
    s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    acc[m][s] = (acc[m][s] || 0) + 1;
    return acc;
  }, {});
  const monthlyAttArr = Object.values(monthlyAtt).slice(-6);

  const leaveCounts = leaveHistory.reduce((acc, r) => {
    const s = r.status || "unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const leavePieData = [
    { name: "Approved",  value: leaveCounts.approved  || 0 },
    { name: "Pending",   value: (leaveCounts.pending_manager || 0) + (leaveCounts.pending_hr || 0) },
    { name: "Rejected",  value: leaveCounts.rejected  || 0 },
    { name: "Cancelled", value: leaveCounts.cancelled || 0 },
  ].filter(d => d.value > 0);

  const leaveByType = leaveHistory.reduce((acc, r) => {
    const t = r.leave_name || "Other";
    if (!acc[t]) acc[t] = { type: t, days: 0, count: 0 };
    if (r.status === "approved") {
      acc[t].days  += Number(r.total_days) || 0;
      acc[t].count += 1;
    }
    return acc;
  }, {});
  const leaveByTypeArr = Object.values(leaveByType);

  const totalPresent  = attCounts.Present || 0;
  const totalAbsent   = attCounts.Absent  || 0;
  const totalApproved = leaveCounts.approved || 0;
  const totalDaysTaken = leaveHistory
    .filter(l => l.status === "approved")
    .reduce((s, l) => s + (Number(l.total_days) || 0), 0);
  const activeAssets = assets.filter(a => a.status === "allocated").length;

  const row = (label, value) => (
    <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
      <span style={{ width: 140, color: "#64748b", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</span>
      <span style={{ color: "#0f172a", fontSize: 14, fontWeight: 600 }}>{value || "—"}</span>
    </div>
  );

  const CHART_COLORS = ["#3b6cf8", "#60a5fa", "#2563eb", "#93c5fd", "#1d4ed8", "#38bdf8"];

  return (
    <Layout>
      <div style={{ marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ margin: 0, color: "#0f172a", fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>👤 {employee.name}</h2>
        <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14, fontWeight: 500 }}>
          {employee.designation || "Employee"} · <span style={{ color: "#3b6cf8", fontWeight: 600 }}>{employee.department_name || "—"}</span>
        </p>
      </div>

      {/* ── Top summary metrics ── */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <MetricCard label="Days Present"  value={totalPresent}  color="#3b6cf8" />
        <MetricCard label="Days Absent"   value={totalAbsent}   color="#94a3b8" />
        <MetricCard label="Leaves Approved" value={totalApproved} color="#60a5fa" />
        <MetricCard label="Leave Days Used" value={totalDaysTaken} color="#2563eb" />
        <MetricCard label="Active Assets" value={activeAssets}  color="#0284c7" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* ── Profile / Edit Panel ── */}
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <SectionTitle icon="📋" title="Profile Details" />
            {isAdmin && !editMode && (
              <Button 
                variant="primary" 
                onClick={() => setEditMode(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.background = "#e0f2fe";
                  e.currentTarget.style.color = "#2563eb";
                  e.currentTarget.style.borderColor = "#3b6cf8";
                  e.currentTarget.style.boxShadow = "0 0 15px rgba(59, 108, 248, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "#3b6cf8"; 
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={{ 
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)", 
                  borderRadius: 8, fontWeight: 700, background: "#3b6cf8", color: "#fff", 
                  border: "1px solid transparent", padding: "8px 18px" 
                }}
              >
                Edit Profile
              </Button>
            )}
          </div>

          {!editMode ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {row("Name",        employee.name)}
              {row("Email",       employee.email)}
              {row("Department",  employee.department_name)}
              {row("Designation", employee.designation)}
              {row("Phone",       employee.phone)}
              {row("Address",     employee.address)}
              {row("Salary",      employee.salary ? `₹${Number(employee.salary).toLocaleString('en-IN')}` : null)}
              {row("Manager",     employee.manager_name)}
            </div>
          ) : (
            <form onSubmit={saveEdit}>
              <select value={editForm.department_id} onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })} style={inp}>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
              </select>
              <input placeholder="Designation" value={editForm.designation} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} style={inp} />
              <input placeholder="Phone"       value={editForm.phone}        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}       style={inp} />
              <input placeholder="Address"     value={editForm.address}     onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}     style={inp} />
              <input placeholder="Salary"      value={editForm.salary}      onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}      style={inp} type="number" />
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Button 
                  type="submit" 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.background = "#e0f2fe";
                    e.currentTarget.style.color = "#2563eb";
                    e.currentTarget.style.borderColor = "#3b6cf8";
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(59, 108, 248, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "#16a34a";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "transparent";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  style={{ 
                    transition: "all 0.2s ease-in-out", borderRadius: 8, fontWeight: 700, 
                    padding: "10px 20px", background: "#16a34a", color: "#fff", border: "1px solid transparent" 
                  }}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setEditMode(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.background = "#f1f5f9";
                    e.currentTarget.style.borderColor = "#cbd5e1";
                    e.currentTarget.style.boxShadow = "0 0 10px rgba(148, 163, 184, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  style={{ 
                    transition: "all 0.2s ease-in-out", borderRadius: 8, fontWeight: 600, 
                    padding: "10px 20px", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" 
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Panel>

        {/* ── Department & Skills & Assets ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Panel>
            <SectionTitle icon="🏢" title="Department Assignment" />
            <div style={{
              background: "#f0f7ff", border: "1px solid #e0f2fe", borderRadius: 10,
              padding: "14px 18px", display: "flex", alignItems: "center", gap: 14,
            }}>
              <span style={{ fontSize: 26 }}>🏢</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "#1e40af", fontSize: 15 }}>
                  {employee.department_name || "Not assigned"}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: "#3b82f6", fontWeight: 500 }}>
                  {employee.designation || "—"}
                </p>
              </div>
            </div>
          </Panel>

          <Panel>
            <SectionTitle icon="🎯" title={`Skills Matrix (${skills.length})`} />
            {skills.length === 0 ? (
              <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>No skills assigned</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.map((s) => (
                  <span key={s.id} style={{
                    background: "#f0f7ff", color: "#2563eb",
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: "1px solid #e0f2fe", transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.background = "#e0f2fe";
                    e.currentTarget.style.boxShadow = "0 4px 10px rgba(59, 108, 248, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.background = "#f0f7ff";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  >{s.skill_name}</span>
                ))}
              </div>
            )}
          </Panel>

          <Panel>
            <SectionTitle icon="💼" title={`Hardware Allocations (${assets.length})`} />
            {assets.length === 0 ? (
              <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>No assets allocated</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {assets.map((a, i) => {
                  const isActive = a.status === "allocated";
                  return (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "#f8fafc", borderRadius: 10, padding: "12px 16px",
                      border: "1px solid #e2e8f0",
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{a.asset_name}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 12, color: "#64748b", fontWeight: 500 }}>{a.asset_code} · {a.asset_type}</p>
                      </div>
                      <span style={{
                        background: isActive ? "#e0f2fe" : "#f1f5f9",
                        color: isActive ? "#0369a1" : "#475569",
                        padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.5px"
                      }}>{a.status}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* ── Attendance Charts ── */}
        <Panel style={{ gridColumn: "1 / -1" }}>
          <SectionTitle icon="📅" title="Attendance Metrics & Trends" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Status Breakdown</p>
              {attPieData.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>No attendance records</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={attPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`} labelLine={false} style={{ outline: "none" }}>
                      {attPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.name === "Present" ? "#3b6cf8" : entry.name === "Absent" ? "#94a3b8" : CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Monthly Timeline (last 6 months)</p>
              {monthlyAttArr.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>No historical timeline data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyAttArr} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} stroke="#cbd5e1" />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} stroke="#cbd5e1" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="Present" fill="#3b6cf8" radius={[4, 4, 0, 0]} name="Days Present" />
                    <Bar dataKey="Absent"  fill="#94a3b8"  radius={[4, 4, 0, 0]} name="Days Absent" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Panel>

        {/* ── Leave Charts ── */}
        <Panel style={{ gridColumn: "1 / -1" }}>
          <SectionTitle icon="🌴" title="Leave Ledger Analysis" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>By Request Status</p>
              {leavePieData.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>No leave ledger instances</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={leavePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ value }) => `${value}`} style={{ outline: "none" }}>
                      {leavePieData.map((entry, i) => (
                        <Cell key={i} fill={
                          entry.name === "Approved"  ? "#2563eb" :
                          entry.name === "Pending"   ? "#60a5fa" :
                          entry.name === "Rejected"  ? "#93c5fd" :
                          "#cbd5e1"
                        } />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Approved Balances Used by Category</p>
              {leaveByTypeArr.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14 }}>No approved leave category data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={leaveByTypeArr} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} stroke="#cbd5e1" />
                    <YAxis type="category" dataKey="type" tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} width={90} stroke="#cbd5e1" />
                    <Tooltip />
                    <Bar dataKey="days" name="Days Allocated" fill="#3b6cf8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Panel>

        {/* ── Images Panel ── */}
        <Panel style={{ gridColumn: "1 / -1" }}>
          <SectionTitle icon="🖼️" title="Media & Identification Records" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
            {images.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>No identification records uploaded</p>
            ) : (
              images.map((img) => (
                <div key={img.id} style={{ position: "relative" }}>
                  <img
                    src={`http://localhost:5000${img.image_url}`}
                    alt="employee record"
                    style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 10, display: "block", border: "1px solid #e2e8f0" }}
                  />
                  <button
                    onClick={() => deleteImage(img.id)}
                    style={{
                      position: "absolute", top: -6, right: -6,
                      background: "#ef4444", color: "#fff", border: "2px solid #fff",
                      borderRadius: "50%", width: 24, height: 24,
                      cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontWeight: "bold", transition: "transform 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.2)";
                      e.currentTarget.style.background = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.background = "#ef4444";
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={uploadImages} style={{ 
            display: "flex", gap: 14, alignItems: "center", 
            background: "#f0f7ff", padding: "14px 18px", borderRadius: 10, border: "1px dashed #bfdbfe"
          }}>
            <input 
              type="file" 
              multiple 
              accept="image/jpeg,image/png" 
              onChange={(e) => setFiles([...e.target.files])} 
              style={{ fontSize: 13, color: "#475569", fontWeight: 600, cursor: "pointer" }} 
            />
            <Button 
              type="submit" 
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.background = "#e0f2fe";
                e.currentTarget.style.color = "#2563eb";
                e.currentTarget.style.borderColor = "#3b6cf8";
                e.currentTarget.style.boxShadow = "0 0 15px rgba(59, 108, 248, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = "#3b6cf8";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
              style={{ 
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)", borderRadius: 8, 
                fontWeight: 700, padding: "8px 22px", fontSize: 13, letterSpacing: "0.3px",
                background: "#3b6cf8", color: "#fff", border: "1px solid transparent"
              }}
            >
              Upload Files
            </Button>
          </form>
        </Panel>
      </div>
    </Layout>
  );
};

export default EmployeeDetail;