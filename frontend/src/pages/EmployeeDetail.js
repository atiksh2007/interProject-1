import { useEffect, useState } from "react";
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
  width: "100%", border: "1px solid #e2e8f0", borderRadius: 8,
  fontSize: 14, boxSizing: "border-box", background: "#f8fafc",
};

const COLORS = {
  present: "#16a34a",
  absent:  "#dc2626",
  leave:   "#2563eb",
  approved:"#16a34a",
  pending: "#d97706",
  rejected:"#dc2626",
  cancelled:"#94a3b8",
};

const SectionTitle = ({ icon, title }) => (
  <h3 style={{ margin: "0 0 16px", color: "#1e293b", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
    <span>{icon}</span> {title}
  </h3>
);

const MetricCard = ({ label, value, color }) => (
  <div style={{
    background: "#f8fafc", borderRadius: 8, padding: "14px 18px",
    borderLeft: `4px solid ${color}`, flex: "1 1 100px",
  }}>
    <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
    <p style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color }}>{value ?? "-"}</p>
  </div>
);

const Panel = ({ children, style = {} }) => (
  <div style={{
    background: "#fff", borderRadius: 10, padding: 24,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)", ...style,
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

  const fetchAll = async () => {
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

      // Fetch this employee's asset allocations
      const allocRes = await api.get(`/assets/allocations`, {
        params: { employee_id: id }
      }).catch(() => ({ data: [] }));
      setAssets(allocRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchAll();
    if (isAdmin) api.get("/departments").then((r) => setDepts(r.data));
  }, [id]);

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

  if (!data) return <Layout><p style={{ color: "#64748b", padding: 32 }}>Loading…</p></Layout>;

  const { employee, skills, images } = data;

  // ── Attendance chart data ──────────────────────────────────────────
  const attCounts = attendance.reduce((acc, r) => {
    let s = r.status || "Unknown";
    s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const attPieData = Object.entries(attCounts).map(([name, value]) => ({ name, value }));

  // Monthly attendance bar
  const monthlyAtt = attendance.reduce((acc, r) => {
    const m = r.date ? r.date.slice(0, 7) : "N/A";
    if (!acc[m]) acc[m] = { month: m, Present: 0, Absent: 0 };
    let s = r.status || "Unknown";
    s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    acc[m][s] = (acc[m][s] || 0) + 1;
    return acc;
  }, {});
  const monthlyAttArr = Object.values(monthlyAtt).slice(-6);

  // ── Leave chart data ───────────────────────────────────────────────
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

  // ── Summary metrics ────────────────────────────────────────────────
  const totalPresent  = attCounts.Present || 0;
  const totalAbsent   = attCounts.Absent  || 0;
  const totalApproved = leaveCounts.approved || 0;
  const totalDaysTaken = leaveHistory
    .filter(l => l.status === "approved")
    .reduce((s, l) => s + (Number(l.total_days) || 0), 0);
  const activeAssets = assets.filter(a => a.status === "allocated").length;

  const row = (label, value) => (
    <div style={{ display: "flex", padding: "11px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ width: 150, color: "#64748b", fontSize: 14, fontWeight: 600 }}>{label}</span>
      <span style={{ color: "#1e293b", fontSize: 14 }}>{value || "-"}</span>
    </div>
  );

  const CHART_COLORS = ["#16a34a", "#dc2626", "#2563eb", "#d97706", "#7c3aed", "#0891b2"];

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: "#1e293b" }}>👤 {employee.name}</h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
          {employee.designation || "Employee"} · {employee.department_name || "—"}
        </p>
      </div>

      {/* ── Top summary metrics ── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <MetricCard label="Days Present"  value={totalPresent}  color="#16a34a" />
        <MetricCard label="Days Absent"   value={totalAbsent}   color="#dc2626" />
        <MetricCard label="Leaves Approved" value={totalApproved} color="#2563eb" />
        <MetricCard label="Leave Days Used" value={totalDaysTaken} color="#d97706" />
        <MetricCard label="Active Assets" value={activeAssets}  color="#7c3aed" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* ── Profile / Edit ── */}
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <SectionTitle icon="📋" title="Profile" />
            {isAdmin && !editMode && <Button variant="warning" onClick={() => setEditMode(true)}>Edit</Button>}
          </div>

          {!editMode ? (
            <>
              {row("Name",        employee.name)}
              {row("Email",       employee.email)}
              {row("Department",  employee.department_name)}
              {row("Designation", employee.designation)}
              {row("Phone",       employee.phone)}
              {row("Address",     employee.address)}
              {row("Salary",      employee.salary ? `₹${Number(employee.salary).toLocaleString()}` : null)}
              {row("Manager",     employee.manager_name)}
            </>
          ) : (
            <form onSubmit={saveEdit}>
              <select value={editForm.department_id} onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })} style={inp}>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
              </select>
              <input placeholder="Designation" value={editForm.designation} onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} style={inp} />
              <input placeholder="Phone"       value={editForm.phone}       onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}       style={inp} />
              <input placeholder="Address"     value={editForm.address}     onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}     style={inp} />
              <input placeholder="Salary"      value={editForm.salary}      onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}      style={inp} type="number" />
              <div style={{ display: "flex", gap: 8 }}>
                <Button type="submit" variant="success">Save</Button>
                <Button variant="secondary" onClick={() => setEditMode(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </Panel>

        {/* ── Department & Skills & Assets ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Dept info */}
          <Panel>
            <SectionTitle icon="🏢" title="Department" />
            <div style={{
              background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8,
              padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 28 }}>🏢</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: "#1e40af", fontSize: 16 }}>
                  {employee.department_name || "Not assigned"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: "#3b82f6" }}>
                  {employee.designation || "—"}
                </p>
              </div>
            </div>
          </Panel>

          {/* Skills */}
          <Panel>
            <SectionTitle icon="🎯" title={`Skills (${skills.length})`} />
            {skills.length === 0 ? (
              <p style={{ color: "#94a3b8", margin: 0 }}>No skills assigned</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.map((s) => (
                  <span key={s.id} style={{
                    background: "#eff6ff", color: "#2563eb",
                    padding: "5px 12px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                    border: "1px solid #bfdbfe",
                  }}>{s.skill_name}</span>
                ))}
              </div>
            )}
          </Panel>

          {/* Assets */}
          <Panel>
            <SectionTitle icon="💼" title={`Assets (${assets.length})`} />
            {assets.length === 0 ? (
              <p style={{ color: "#94a3b8", margin: 0 }}>No assets allocated</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {assets.map((a, i) => {
                  const isActive = a.status === "allocated";
                  return (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "#f8fafc", borderRadius: 8, padding: "10px 14px",
                      border: "1px solid #e2e8f0",
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{a.asset_name}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{a.asset_code} · {a.asset_type}</p>
                      </div>
                      <span style={{
                        background: isActive ? "#dcfce7" : "#f1f5f9",
                        color: isActive ? "#166534" : "#475569",
                        padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
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
          <SectionTitle icon="📅" title="Attendance Overview" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
            {/* Pie */}
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>Status Breakdown</p>
              {attPieData.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No attendance records</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={attPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {attPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.name === "Present" ? COLORS.present : entry.name === "Absent" ? COLORS.absent : CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Monthly bar */}
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>Monthly (last 6 months)</p>
              {monthlyAttArr.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyAttArr} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Present" fill={COLORS.present} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Absent"  fill={COLORS.absent}  radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Panel>

        {/* ── Leave Charts ── */}
        <Panel style={{ gridColumn: "1 / -1" }}>
          <SectionTitle icon="🌴" title="Leave History" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
            {/* Leave status pie */}
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>By Status</p>
              {leavePieData.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No leave records</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={leavePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${value}`} >
                      {leavePieData.map((entry, i) => (
                        <Cell key={i} fill={
                          entry.name === "Approved"  ? COLORS.approved :
                          entry.name === "Pending"   ? COLORS.pending :
                          entry.name === "Rejected"  ? COLORS.rejected :
                          COLORS.cancelled
                        } />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Days by leave type */}
            <div>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#64748b", fontWeight: 600 }}>Days used by type (approved)</p>
              {leaveByTypeArr.length === 0 ? (
                <p style={{ color: "#94a3b8" }}>No approved leave data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={leaveByTypeArr} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="days" name="Days" fill="#2563eb" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Panel>

        {/* ── Images ── */}
        <Panel style={{ gridColumn: "1 / -1" }}>
          <SectionTitle icon="🖼️" title="Photos" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            {images.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No images uploaded</p>
            ) : (
              images.map((img) => (
                <div key={img.id} style={{ position: "relative" }}>
                  <img
                    src={`http://localhost:5000${img.image_url}`}
                    alt="employee"
                    style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, display: "block" }}
                  />
                  <button
                    onClick={() => deleteImage(img.id)}
                    style={{
                      position: "absolute", top: 4, right: 4,
                      background: "#dc2626", color: "#fff", border: "none",
                      borderRadius: "50%", width: 22, height: 22,
                      cursor: "pointer", fontSize: 12,
                    }}
                  >×</button>
                </div>
              ))
            )}
          </div>
          <form onSubmit={uploadImages} style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="file" multiple accept="image/jpeg,image/png" onChange={(e) => setFiles([...e.target.files])} style={{ fontSize: 13 }} />
            <Button type="submit" variant="primary">Upload</Button>
          </form>
        </Panel>
      </div>
    </Layout>
  );
};

export default EmployeeDetail;