import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import api from "../api";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const { isAdmin } = useAuth();

  const fetch = async () => {
    try { setEmployees((await api.get("/employees")).data); }
    catch (err) { console.log(err); }
  };

  useEffect(() => { fetch(); }, []);

  const del = async (id) => {
    if (!window.confirm("Delete this employee? This cannot be undone.")) return;
    try { await api.delete(`/employees/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>👥 Employees</h2>
        {isAdmin && (
          <Link to="/employees/create" style={{ textDecoration: "none" }}>
            <Button 
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
                fontWeight: 700, padding: "10px 20px", background: "#3b6cf8", color: "#fff", border: "1px solid transparent"
              }}
            >
              + Create Employee
            </Button>
          </Link>
        )}
      </div>
      
      <Table
        columns={[
          { key: "serial_no", label: "#" },
          { key: "name", label: "Name" },
          { key: "department_name", label: "Department" },
          { key: "designation", label: "Designation" },
          { key: "phone", label: "Phone" },
          { key: "salary", label: "Salary", render: (r) => r.salary ? `₹${Number(r.salary).toLocaleString('en-IN')}` : "-" },
        ]}
        rows={employees.map((employee, index) => ({ ...employee, serial_no: index + 1 }))}
        actions={(r) => (
          <div style={{ display: "flex", gap: 8 }}>
            
            {/* ── VIEW BUTTON (BLUE) ── */}
            <Link to={`/employees/${r.id}`} style={{ textDecoration: "none" }}>
              <Button
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.background = "#eff6ff";
                  e.currentTarget.style.color = "#2563eb";
                  e.currentTarget.style.borderColor = "#bfdbfe";
                  e.currentTarget.style.boxShadow = "0 0 12px rgba(59, 108, 248, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.background = "#f8fafc";
                  e.currentTarget.style.color = "#3b6cf8";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={{
                  transition: "all 0.2s ease-in-out", borderRadius: 6, fontWeight: 700,
                  fontSize: 13, padding: "6px 14px", background: "#f8fafc", color: "#3b6cf8", border: "1px solid #cbd5e1"
                }}
              >
                View
              </Button>
            </Link>

            {isAdmin && (
              <>
                {/* ── EDIT BUTTON (ORANGE) ── */}
                <Link to={`/employees/${r.id}`} state={{ edit: true }} style={{ textDecoration: "none" }}>
                  <Button 
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.03)";
                      e.currentTarget.style.background = "#fff7ed";
                      e.currentTarget.style.color = "#ea580c";
                      e.currentTarget.style.borderColor = "#fed7aa";
                      e.currentTarget.style.boxShadow = "0 0 12px rgba(234, 88, 12, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.background = "#f1f5f9";
                      e.currentTarget.style.color = "#f97316";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    style={{
                      transition: "all 0.2s ease-in-out", borderRadius: 6, fontWeight: 700,
                      fontSize: 13, padding: "6px 14px", background: "#f1f5f9", color: "#f97316", border: "1px solid #cbd5e1"
                    }}
                  >
                    Edit
                  </Button>
                </Link>

                {/* ── DELETE BUTTON (LIGHT RED) ── */}
                <Button 
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.background = "#fee2e2";
                    e.currentTarget.style.color = "#dc2626";
                    e.currentTarget.style.borderColor = "#fca5a5";
                    e.currentTarget.style.boxShadow = "0 0 12px rgba(220, 38, 38, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.background = "#fef2f2";
                    e.currentTarget.style.color = "#ef4444";
                    e.currentTarget.style.borderColor = "#fee2e2";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={() => del(r.id)}
                  style={{
                    transition: "all 0.2s ease-in-out", borderRadius: 6, fontWeight: 700,
                    fontSize: 13, padding: "6px 14px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2"
                  }}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        )}
      />
    </Layout>
  );
};

export default EmployeeList;