import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import api from "../api";

const inp = { display: "block", padding: "10px 14px", margin: "8px 0 16px", width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#f8fafc" };
const lbl = { fontSize: 13, fontWeight: 600, color: "#475569" };

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ department_id: "", phone: "", address: "", designation: "" });
  const [departments, setDepts] = useState([]);
  const nav = useNavigate();

  const fetchProfile = async () => {
    try {
      const r = await api.get("/employees/me");
      if (r.data.length > 0) {
        setProfile(r.data[0]);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    api.get("/departments").then((r) => setDepts(r.data)).catch(console.log);
  }, []);

  const startEdit = () => {
    setEditForm({
      department_id: profile.department_id || "",
      phone:         profile.phone || "",
      address:       profile.address || "",
      designation:   profile.designation || "",
    });
    setEditMode(true);
  };


  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/employees/me", editForm);
      setEditMode(false);
      fetchProfile();
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <Layout>
        <p style={{ color: "#64748b" }}>Loading profile...</p>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <h2 style={{ color: "#1e293b", marginBottom: 24 }}>👤 My Profile</h2>
        <div style={{ background: "#fff", borderRadius: 10, padding: 36, maxWidth: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <p style={{ color: "#64748b", marginBottom: 24, fontSize: 15 }}>No employee profile linked to your account yet.</p>
          <Button variant="success" onClick={() => nav("/complete-profile")} style={{ padding: "12px 28px", fontSize: 15 }}>
            + Complete My Profile
          </Button>
        </div>
      </Layout>
    );
  }

  const row = (label, value) => (
    <div style={{ display: "flex", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ width: 160, color: "#64748b", fontSize: 14, fontWeight: 600 }}>{label}</span>
      <span style={{ color: "#1e293b", fontSize: 14 }}>{value || "-"}</span>
    </div>
  );

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>👤 My Profile</h2>
      <div style={{ background: "#fff", borderRadius: 10, padding: 28, maxWidth: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "#1e293b" }}>Profile Information</h3>
          {!editMode && (
            <Button variant="warning" onClick={startEdit}>
              Edit Profile
            </Button>
          )}
        </div>

        {!editMode ? (
          <>
            {row("Name", profile.name)}
            {row("Email", profile.email)}
            {row("Department", profile.department_name)}
            {row("Designation", profile.designation)}
            {row("Phone", profile.phone)}
            {row("Address", profile.address)}
            {row("Salary", profile.salary ? `₹${Number(profile.salary).toLocaleString()}` : null)}
            <div style={{ marginTop: 24 }}>
              <Button onClick={() => nav(`/employees/${profile.id}`)} variant="primary" style={{ width: "100%", padding: "12px 0" }}>
                View Full Details / Upload Images
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={saveEdit}>
            <label style={lbl}>Department</label>
            <select
              value={editForm.department_id}
              onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
              style={inp}
              required
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </select>

            <label style={lbl}>Designation</label>
            <input
              placeholder="Designation"
              value={editForm.designation}
              onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
              style={inp}
            />

            <label style={lbl}>Phone</label>
            <input
              placeholder="Phone Number"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              style={inp}
            />

            <label style={lbl}>Address</label>
            <input
              placeholder="Address / Location"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              style={inp}
            />

            {profile.salary && (
              <>
                <label style={lbl}>Salary (Read-Only)</label>
                <input
                  type="text"
                  value={`₹${Number(profile.salary).toLocaleString()}`}
                  style={{ ...inp, color: "#94a3b8", cursor: "not-allowed" }}
                  disabled
                />
              </>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Button type="submit" variant="success">
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
