// Profile.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/employees")
      .then((r) => { if (r.data.length > 0) setProfile(r.data[0]); })
      .catch(console.log);
  }, []);

  if (!profile) return <Layout><p style={{ color: "#64748b" }}>No employee profile linked to your account.</p></Layout>;

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
        {row("Name",profile.name)}
        {row("Email",profile.email)}
        {row("Department", profile.department_name)}
        {row("Designation", profile.designation)}
        {row("Phone",profile.phone)}
        {row("Address",profile.address)}
        {row("Salary", profile.salary ? `₹${Number(profile.salary).toLocaleString()}` : null)}
        <div style={{ marginTop: 20 }}>
          <button onClick={() => nav(`/employees/${profile.id}`)} style={{ padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            View Full Details / Upload Images
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;