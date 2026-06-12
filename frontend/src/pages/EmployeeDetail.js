import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import api from "../api";
import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";
const inp = { display: "block", padding: "10px 14px", margin: "8px 0 16px", width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#f8fafc" };

const EmployeeDetail = () => {
  const { id }       = useParams();
  const location     = useLocation();
  const { isAdmin }  = useAuth();

  const [data, setData]         = useState(null);
  const [editMode, setEditMode] = useState(location.state?.edit || false);
  const [editForm, setEditForm] = useState({});
  const [departments, setDepts] = useState([]);
  const [files, setFiles]       = useState([]);
  const [attendance, setAttendance] = useState([]);
  const fetch = async () => {
    try {
      const r = await api.get(`/employees/${id}`);
      setData(r.data);

      const att = await api.get(`/attendance/employee/${id}`);
      setAttendance(att.data);


      setEditForm({
        department_id: r.data.employee.department_id,
        phone:         r.data.employee.phone        || "",
        address:       r.data.employee.address      || "",
        designation:   r.data.employee.designation  || "",
        salary:        r.data.employee.salary        || "",
      });
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    fetch();
    if (isAdmin) api.get("/departments").then((r) => setDepts(r.data));
  }, [id]);

  const saveEdit = async (e) => {
    e.preventDefault();
    try { await api.put(`/employees/${id}`, editForm); setEditMode(false); fetch(); alert("Updated!"); }
    catch (err) { alert(err.response?.data?.message || "Update failed"); }
  };

  const uploadImages = async (e) => {
    e.preventDefault();
    if (!files.length) return alert("Select images first");
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    fd.append("employee_id", id);
    try { await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } }); setFiles([]); fetch(); alert("Uploaded!"); }
    catch (err) { alert(err.response?.data?.message || "Upload failed"); }
  };

  const deleteImage = async (imgId) => {
    if (!window.confirm("Delete this image?")) return;
    try { await api.delete(`/upload/${imgId}`); fetch(); }
    catch { alert("Delete failed"); }
  };

  if (!data) return <Layout><p>Loading...</p></Layout>;

  const { employee, skills, images } = data;



  const attendanceChart = [
  {
    name: "Present",
    value: attendance.filter(
      a => a.status === "Present"
    ).length
  },
  {
    name: "Absent",
    value: attendance.filter(
      a => a.status === "Absent"
    ).length
  }
];




  const row = (label, value) => (
    <div style={{ display: "flex", padding: "11px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ width: 150, color: "#64748b", fontSize: 14, fontWeight: 600 }}>{label}</span>
      <span style={{ color: "#1e293b", fontSize: 14 }}>{value || "-"}</span>
    </div>
  );

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>Employee Detail</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Info / Edit */}
        <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: "#1e293b" }}>👤 Profile</h3>
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
        </div>

        {/* Skills + Images */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 12px", color: "#1e293b" }}>🎯 Skills</h3>
            {skills.length === 0 ? <p style={{ color: "#94a3b8" }}>No skills assigned</p> : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.map((s) => (
                  <span key={s.id} style={{ background: "#eff6ff", color: "#2563eb", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 500 }}>{s.skill_name}</span>
                ))}
              </div>
            )}
          </div>



            <div style={{background:"#fff", padding:24, borderRadius:10}}>

<h3>📊 Attendance</h3>

<PieChart width={300} height={250}>

<Pie
data={attendanceChart}
dataKey="value"
nameKey="name"
cx="50%"
cy="50%"
outerRadius={80}
label
>

{attendanceChart.map((x,i)=>
<Cell key={i}/>
)}

</Pie>

<Tooltip/>
<Legend/>

</PieChart>

</div>


          <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 12px", color: "#1e293b" }}>🖼️ Images</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              {images.length === 0 ? <p style={{ color: "#94a3b8" }}>No images uploaded</p> : images.map((img) => (
                <div key={img.id} style={{ position: "relative" }}>
                  <img src={`http://localhost:5000${img.image_url}`} alt="employee" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, display: "block" }} />
                  <button onClick={() => deleteImage(img.id)} style={{ position: "absolute", top: 4, right: 4, background: "#dc2626", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 12 }}>×</button>
                </div>
              ))}
            </div>
            <form onSubmit={uploadImages} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="file" multiple accept="image/jpeg,image/png" onChange={(e) => setFiles([...e.target.files])} style={{ fontSize: 13 }} />
              <Button type="submit" variant="primary">Upload</Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDetail;