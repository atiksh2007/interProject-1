import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import api from "../api";

const statusColors = {
  Pending:             { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  "Manager Approved": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  Approved:           { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
  Rejected:           { bg: "#fff5f5", color: "#e11d48", border: "#fecdd3" },
  Cancelled:          { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
};

const statusMap = {
  pending_manager: "Pending",
  pending_hr: "Manager Approved",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const actionMap = {
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const Badge = ({ status }) => {
  const displayStatus = statusMap[status] || status;
  const s = statusColors[displayStatus] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  return (
    <span style={{ 
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.3px", display: "inline-block"
    }}>
      {displayStatus}
    </span>
  );
};

const LeaveApprovals = () => {
  const { isManager, isHR } = useAuth();
  const [pending, setPending]   = useState([]);
  const [detail, setDetail]     = useState(null);
  const [remarks, setRemarks]   = useState("");

  const fetchPending = async () => {
    try {
      const r = await api.get("/leaves/pending");
      setPending(r.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchPending(); }, []);

  const viewDetail = async (id) => {
    try {
      const [leaveRes, histRes] = await Promise.all([
        api.get(`/leaves/${id}`),
        api.get(`/leaves/${id}/history`),
      ]);
      setDetail({ leave: leaveRes.data, history: histRes.data });
    } catch (err) { alert("Error loading details"); }
  };

  const act = async (id, action) => {
    const endpoint = action === "Approved" ? `/leaves/${id}/approve` : `/leaves/${id}/reject`;
    try {
      await api.put(endpoint, { remarks });
      setRemarks("");
      setDetail(null);
      fetchPending();
      alert(`Leave ${action} successfully`);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const title = isManager ? "Manager Approvals" : isHR ? "HR Final Approvals" : "All Pending Approvals";

  return (
    <Layout>
      {/* Title Header Layout Block */}
      <div style={{ marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>✅ {title}</h2>
      </div>

      <Table
        columns={[
          { key: "serial_no",     label: "#" },
          { key: "employee_name", label: "Employee Name", render: (r) => <span style={{ fontWeight: 600, color: "#0f172a" }}>{r.employee_name}</span> },
          { key: "designation",   label: "Designation" },
          { key: "leave_name",    label: "Leave Type", render: (r) => <span style={{ fontWeight: 500, color: "#475569" }}>📁 {r.leave_name}</span> },
          { key: "from_date",     label: "From", render: (r) => formatDate(r.from_date) },
          { key: "to_date",       label: "To", render: (r) => formatDate(r.to_date) },
          { key: "total_days",    label: "Days", render: (r) => <span style={{ fontWeight: 700, color: "#0f172a" }}>{r.total_days} d</span> },
          { key: "status",        label: "Status State", render: (r) => <Badge status={r.status} /> },
        ]}
        rows={pending.map((item, index) => ({ ...item, serial_no: index + 1 }))}
        actions={(r) => (
          <div style={{ display: "flex", gap: 8 }}>
            
            {/* VIEW HISTORY BUTTON (BLUE TINT) */}
            <Button 
              onClick={() => viewDetail(r.id)}
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

            {/* QUICK APPROVE ACTION BUTTON (GREEN) */}
            <Button 
              onClick={() => { setDetail({ leave: r, history: [] }); }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.background = "#f0fdf4";
                e.currentTarget.style.color = "#16a34a";
                e.currentTarget.style.borderColor = "#bbf7d0";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(22, 163, 74, 0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.color = "#16a34a";
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.boxShadow = "none";
              }}
              style={{
                transition: "all 0.2s ease-in-out", borderRadius: 6, fontWeight: 700,
                fontSize: 13, padding: "6px 14px", background: "#f8fafc", color: "#16a34a", border: "1px solid #cbd5e1"
              }}
            >
              Approve
            </Button>

            {/* QUICK REJECT ACTION BUTTON (LIGHT RED) */}
            <Button 
              onClick={() => { setDetail({ leave: r, history: [] }); }}
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
              style={{
                transition: "all 0.2s ease-in-out", borderRadius: 6, fontWeight: 700,
                fontSize: 13, padding: "6px 14px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2"
              }}
            >
              Reject
            </Button>
          </div>
        )}
      />

      {/* Detail / Determination Modal Window Container */}
      <Modal
        open={!!detail}
        title="📋 Leave Application Dossier"
        onClose={() => { setDetail(null); setRemarks(""); }}
        footer={
          <div style={{ display: "flex", gap: 12, alignItems: "center", width: "100%", pt: 4 }}>
            <input
              placeholder="Provide operation evaluation remarks (optional)..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ 
                flex: 1, padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 8, 
                fontSize: 14, outline: "none", color: "#334155", background: "#f8fafc",
                transition: "all 0.15s ease-in-out" 
              }}
              onFocus={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = "#3b6cf8";
                e.target.style.boxShadow = "0 0 0 3px rgba(59, 108, 248, 0.15)";
              }}
              onBlur={(e) => {
                e.target.style.background = "#f8fafc";
                e.target.style.borderColor = "#cbd5e1";
                e.target.style.boxShadow = "none";
              }}
            />
            <Button 
              onClick={() => act(detail.leave.id, "Approved")}
              style={{ background: "#16a34a", color: "#fff", padding: "10px 20px", fontWeight: 700, borderRadius: 8 }}
            >
              Approve Leave
            </Button>
            <Button 
              onClick={() => act(detail.leave.id, "Rejected")}
              style={{ background: "#e11d48", color: "#fff", padding: "10px 20px", fontWeight: 700, borderRadius: 8 }}
            >
              Reject Leave
            </Button>
          </div>
        }
      >
        {detail && (
          <div style={{ paddingTop: 6 }}>
            {/* Context Metrics Grid Box */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                ["Employee", detail.leave.employee_name],
                ["Leave Type Category", detail.leave.leave_name],
                ["From Date", formatDate(detail.leave.from_date)],
                ["To Date", formatDate(detail.leave.to_date)],
                ["Total Duration", `${detail.leave.total_days} Days`],
                ["Current Lifecycle State", (statusMap[detail.leave.status] || detail.leave.status).toUpperCase()],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px" }}>{k}</p>
                  <p style={{ margin: "6px 0 0", color: "#0f172a", fontWeight: 600, fontSize: 14 }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Justification Explanation Area Block */}
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "14px", border: "1px solid #e2e8f0", marginBottom: 24 }}>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px" }}>Statement of Reason</p>
              <p style={{ margin: "6px 0 0", color: "#334155", fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>"{detail.leave.reason || "No written clarification statement submitted."}"</p>
            </div>

            {/* Log Trail Audit Graph Section */}
            {detail.history?.length > 0 && (
              <div style={{ paddingLeft: 4 }}>
                <h4 style={{ color: "#475569", margin: "0 0 16px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Workflow History Log
                </h4>
                {detail.history.map((h, i) => {
                  const displayAction = actionMap[h.action] || h.action;
                  const isApp = h.action === "approved";
                  const colorTheme = isApp ? "#10b981" : "#ef4444";
                  
                  return (
                    <div key={h.id} style={{ 
                      borderLeft: `2px solid ${colorTheme}`, 
                      paddingLeft: 18, 
                      paddingBottom: i === detail.history.length - 1 ? 0 : 18,
                      position: "relative" 
                    }}>
                      {/* Workflow state circle indicator graph node */}
                      <div style={{
                        position: "absolute", width: 10, height: 10, borderRadius: "50%",
                        background: colorTheme, left: -6, top: 4, border: "2px solid #fff"
                      }} />
                      
                      <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                        {h.approver_name} <span style={{ color: "#64748b", fontWeight: 600, fontSize: 12 }}>({h.approver_role})</span>
                      </p>
                      <p style={{ margin: "3px 0", fontSize: 13, color: colorTheme, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                        {displayAction}
                      </p>
                      {h.remarks && (
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#475569", background: "#f1f5f9", padding: "6px 10px", borderRadius: 6, display: "inline-block" }}>
                          <span style={{ fontWeight: 600, color: "#64748b" }}>Note:</span> {h.remarks}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default LeaveApprovals;