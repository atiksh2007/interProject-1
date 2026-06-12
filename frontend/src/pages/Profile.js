import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import api from "../api";

// ── BRAND THEMED DESIGN TOKENS ──
const lbl = {
  display: "block",
  fontSize: "11px",
  fontWeight: "700",
  color: "#475569",
  marginBottom: "6px",
  marginTop: "16px",
  letterSpacing: "0.8px",
  textTransform: "uppercase"
};

// Reusable sub-component for focused form states
const StyledInput = ({ ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={(e) => { setFocused(true); if (props.onFocus) props.onFocus(e); }}
      onBlur={(e) => { setFocused(false); if (props.onBlur) props.onBlur(e); }}
      style={{
        width: "100%",
        padding: "11px 14px",
        border: "1.5px solid",
        borderColor: props.disabled ? "#e2e8f0" : focused ? "#3b6cf8" : "#cbd5e1",
        borderRadius: "10px",
        fontSize: "14px",
        color: props.disabled ? "#94a3b8" : "#0f172a",
        background: props.disabled ? "#f1f5f9" : "#ffffff",
        outline: "none",
        boxSizing: "border-box",
        transition: "all 0.15s ease-in-out",
        boxShadow: focused ? "0 0 0 4px rgba(59, 108, 248, 0.12)" : "none",
        cursor: props.disabled ? "not-allowed" : "text",
        ...props.style
      }}
    />
  );
};

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [departments, setDepts] = useState([]);
  const [editForm, setEditForm] = useState({ 
    department_id: "", 
    phone: "", 
    address: "", 
    designation: "" 
  });
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
      phone:          profile.phone || "",
      address:        profile.address || "",
      designation:    profile.designation || "",
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

  // Modern Boxed Row Renderer Matrix
  const renderDataRow = (label, value) => (
    <div style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      padding: "14px 18px", 
      borderRadius: "12px",
      background: "#f8fafc", 
      marginBottom: "10px",
      fontSize: "14px",
      border: "1px solid #f1f5f9",
      transition: "transform 0.15s ease",
    }}>
      <span style={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
        {label}
      </span>
      
      <span style={{ color: value ? "#0f172a" : "#94a3b8", fontWeight: 600 }}>
        {value || "—"}
      </span>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <p style={{ color: "#64748b", fontFamily: "system-ui, sans-serif" }}>Loading profile...</p>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <h2 style={{ color: "#0f172a", marginBottom: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>👤 My Profile</h2>
        <div style={{ background: "#fff", borderRadius: 16, padding: 40, maxWidth: 600, boxShadow: "0 10px 25px rgba(0,0,0,0.03)", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <p style={{ color: "#64748b", marginBottom: 24, fontSize: 15, fontWeight: 500 }}>No employee profile linked to your account yet.</p>
          <Button 
            variant="success" 
            onClick={() => nav("/complete-profile")} 
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(22, 163, 74, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            style={{ padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 10, transition: "all 0.2s ease-in-out" }}
          >
            + Complete My Profile
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 style={{ color: "#0f172a", marginBottom: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
        👤 My Profile
      </h2>
      
      <div style={{ 
        background: "#ffffff", 
        borderRadius: 20, 
        padding: "36px", 
        maxWidth: 680, 
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.03)",
        border: "1px solid #e2e8f0",
        position: "relative"
      }}>
        
        {/* PREMIUM CARD PROFILE HEADER */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: 28, 
          borderBottom: "1px solid #f1f5f9", 
          paddingBottom: 24 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              position: "relative", width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, #3b6cf8 0%, #1e40af 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 20px rgba(59, 108, 248, 0.2)", border: "4px solid #fff",
              outline: "2px solid #3b6cf8"
            }}>
              <span style={{ fontSize: 22, color: "#fff", fontWeight: 700 }}>
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>

            <div>
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: 20, fontWeight: 700 }}>
                {profile.name}
              </h3>
              <p style={{ margin: "4px 0 0 0", fontSize: 13, color: "#64748b", fontWeight: 500 }}>
                {profile.designation} · <span style={{ color: "#3b6cf8", fontWeight: 600 }}>{profile.department_name}</span>
              </p>
            </div>
          </div>

          {!editMode && (
            <Button 
              variant="warning" 
              onClick={startEdit}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.04)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(217, 119, 6, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(217, 119, 6, 0.15)";
              }}
              style={{ 
                borderRadius: 10, padding: "10px 18px", fontWeight: 700, fontSize: 13,
                border: "none", transition: "all 0.2s ease-in-out",
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.15)"
              }}
            >
              ✏️ Edit Profile
            </Button>
          )}
        </div>

        {/* ── CARD BODY WORKSPACE AREA ── */}
        {!editMode ? (
          <>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {renderDataRow("Full Name", profile.name)}
              {renderDataRow("Email Address", profile.email)}
              {renderDataRow("Department Name", profile.department_name)}
              {renderDataRow("Designation Level", profile.designation)}
              {renderDataRow("Mobile Phone", profile.phone)}
              {renderDataRow("Residential Address", profile.address)}
              {renderDataRow("Compensation (Salary)", profile.salary ? `₹${Number(profile.salary).toLocaleString('en-IN')}` : null)}
            </div>
            
            <div style={{ marginTop: 28 }}>
              <Button 
                onClick={() => nav(`/employees/${profile.id}`)} 
                variant="primary" 
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(59, 108, 248, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 14px rgba(59, 108, 248, 0.3)";
                }}
                style={{ 
                  width: "100%", padding: "14px 0", borderRadius: 12, fontWeight: 700, fontSize: 14,
                  background: "linear-gradient(135deg, #3b6cf8 0%, #1e40af 100%)", border: "none",
                  boxShadow: "0 4px 14px rgba(59, 108, 248, 0.3)", transition: "all 0.2s ease-in-out"
                }}
              >
                💼 View Full Documentation Details / Upload Media Files
              </Button>
            </div>
          </>
        ) : (
          <form onSubmit={saveEdit} style={{ marginTop: -8 }}>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
              <div>
                <label style={lbl}>Department</label>
                <select
                  value={editForm.department_id}
                  onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
                  required
                  style={{
                    width: "100%", padding: "11px 14px", border: "1.5px solid #cbd5e1",
                    borderRadius: "10px", fontSize: "14px", color: "#0f172a", background: "#fff",
                    outline: "none", boxSizing: "border-box", height: "43px"
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.department_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={lbl}>Designation</label>
                <StyledInput
                  placeholder="e.g. Senior Software Engineer"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                />
              </div>

              <div>
                <label style={lbl}>Phone Number</label>
                <StyledInput
                  placeholder="+91 XXXXX XXXXX"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label style={lbl}>Address / Location</label>
                <StyledInput
                  placeholder="City, State, Country"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
            </div>

            {profile.salary && (
              <div style={{ maxWidth: "calc(50% - 9px)" }}>
                <label style={lbl}>Salary Ledger (Read-Only)</label>
                <StyledInput
                  type="text"
                  value={`₹${Number(profile.salary).toLocaleString('en-IN')}`}
                  style={{ color: "#94a3b8", background: "#f1f5f9", borderStyle: "dashed" }}
                  disabled
                />
              </div>
            )}

            {/* Action Group Block */}
            <div style={{ display: "flex", gap: 12, marginTop: 32, borderTop: "1px solid #f1f5f9", paddingTop: 24 }}>
              <Button 
                type="submit" 
                variant="success"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.04)";
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(22, 163, 74, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(22, 163, 74, 0.2)";
                }}
                style={{ 
                  borderRadius: 10, padding: "12px 24px", fontWeight: 700, border: "none",
                  boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)", transition: "all 0.2s ease-in-out"
                }}
              >
                ✅ Save Document Changes
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setEditMode(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.04)";
                  e.currentTarget.style.background = "#e2e8f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "#f1f5f9";
                }}
                style={{ 
                  borderRadius: 10, padding: "12px 24px", fontWeight: 700,
                  background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0",
                  transition: "all 0.2s ease-in-out"
                }}
              >
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