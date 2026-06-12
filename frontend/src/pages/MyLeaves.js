import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import api from "../api";

const statusColors = {
  Pending:{ bg: "#fef9c3", color: "#854d0e" },
  "Manager Approved":{ bg: "#dbeafe", color: "#1e40af" },
  Approved:{ bg: "#dcfce7", color: "#166534" },
  Rejected:{ bg: "#fee2e2", color: "#991b1b" },
  Cancelled:{ bg: "#f1f5f9", color: "#475569" },
};

const statusMap = {
  pending_manager: "Pending",
  pending_hr: "Manager Approved",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const Badge = ({ status }) => {
  const displayStatus = statusMap[status] || status;
  const s = statusColors[displayStatus] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {displayStatus}
    </span>
  );
};

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);

  const fetch = async () => {
    const r = await api.get("/leaves/my");
    setLeaves(r.data);
  };

  useEffect(() => { fetch(); }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this leave application?")) return;
    try {
      await api.put(`/leaves/${id}/cancel`);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || "Cancel failed");
    }
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#1e293b", margin: 0 }}>📋 My Leave History</h2>
        <Button variant="success" onClick={() => window.location.href = "/apply-leave"}>+ Apply Leave</Button>
      </div>
      <Table
        columns={[
          { key: "id",label: "#" },
          { key: "leave_name",label: "Type" },
          { key: "from_date",label: "From" },
          { key: "to_date",label: "To" },
          { key: "total_days",label: "Days" },
          { key: "reason",label: "Reason" },
          { key: "status",label: "Status", render: (r) => <Badge status={r.status} /> },
        ]}
        rows={leaves}
        actions={(r) =>
          r.status === "pending_manager" || r.status === "pending_hr"
            ? <Button variant="danger" onClick={() => cancel(r.id)}>Cancel</Button>
            : null
        }
      />
    </Layout>
  );
};

export default MyLeaves;