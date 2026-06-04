import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import api from "../api";

const statusColors = {
  Pending:            { bg: "#fef9c3", color: "#854d0e" },
  "Manager Approved": { bg: "#dbeafe", color: "#1e40af" },
  Approved:           { bg: "#dcfce7", color: "#166534" },
  Rejected:           { bg: "#fee2e2", color: "#991b1b" },
  Cancelled:          { bg: "#f1f5f9", color: "#475569" },
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
  const s = statusColors[displayStatus] || { bg: "#f1f5f9", color: "#475569" };
  return <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{displayStatus}</span>;
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

  const title = isManager ? "Manager Approvals" : isHR ? "HR Final Approvals" : "All Pending Approvals";

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>✅ {title}</h2>

      <Table
        columns={[
          { key: "id",            label: "#" },
          { key: "employee_name", label: "Employee" },
          { key: "designation",   label: "Designation" },
          { key: "leave_name",    label: "Leave Type" },
          { key: "from_date",     label: "From" },
          { key: "to_date",       label: "To" },
          { key: "total_days",    label: "Days" },
          { key: "status",        label: "Status", render: (r) => <Badge status={r.status} /> },
        ]}
        rows={pending}
        actions={(r) => (
          <div style={{ display: "flex", gap: 6 }}>
            <Button onClick={() => viewDetail(r.id)}>View</Button>
            <Button variant="success" onClick={() => { setDetail({ leave: r, history: [] }); }}>Approve</Button>
            <Button variant="danger"  onClick={() => { setDetail({ leave: r, history: [] }); }}>Reject</Button>
          </div>
        )}
      />

      {/* Detail Modal */}
      <Modal
        open={!!detail}
        title="Leave Application Detail"
        onClose={() => { setDetail(null); setRemarks(""); }}
        footer={
          <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%" }}>
            <input
              placeholder="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14 }}
            />
            <Button variant="success" onClick={() => act(detail.leave.id, "Approved")}>Approve</Button>
            <Button variant="danger"  onClick={() => act(detail.leave.id, "Rejected")}>Reject</Button>
          </div>
        }
      >
        {detail && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                ["Employee",detail.leave.employee_name],
                ["Leave Type",detail.leave.leave_name],
                ["From",detail.leave.from_date],
                ["To",detail.leave.to_date],
                ["Total Days",detail.leave.total_days],
                ["Status",statusMap[detail.leave.status] || detail.leave.status],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "#f8fafc", borderRadius: 6, padding: "10px 12px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{k}</p>
                  <p style={{ margin: "4px 0 0", color: "#1e293b", fontWeight: 500 }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 6, padding: "10px 12px", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Reason</p>
              <p style={{ margin: "4px 0 0", color: "#334155" }}>{detail.leave.reason}</p>
            </div>

            {detail.history?.length > 0 && (
              <>
                <h4 style={{ color: "#475569", margin: "0 0 8px" }}>Approval History</h4>
                {detail.history.map((h) => {
                  const displayAction = actionMap[h.action] || h.action;
                  const isApp = h.action === "approved";
                  return (
                    <div key={h.id} style={{ borderLeft: `3px solid ${isApp ? "#16a34a" : "#dc2626"}`, paddingLeft: 12, marginBottom: 10 }}>
                      <p style={{ margin: 0, fontWeight: 600, color: "#1e293b" }}>{h.approver_name} <span style={{ color: "#64748b", fontWeight: 400, fontSize: 13 }}>({h.approver_role})</span></p>
                      <p style={{ margin: "2px 0", fontSize: 13, color: isApp ? "#16a34a" : "#dc2626" }}>{displayAction}</p>
                      {h.remarks && <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{h.remarks}</p>}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default LeaveApprovals;