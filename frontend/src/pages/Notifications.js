import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import api from "../api";

const typeColors = {
  success: { border: "#16a34a", bg: "#f0fdf4" },
  warning: { border: "#d97706", bg: "#fffbeb" },
  danger:  { border: "#dc2626", bg: "#fef2f2" },
  info:    { border: "#2563eb", bg: "#eff6ff" },
};

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);

  const fetch = async () => {
    try {
      const r = await api.get("/notifications");
      setNotifs(r.data);
    } catch { setNotifs([]); }
  };

  useEffect(() => { fetch(); }, []);

  const markAll = async () => { await api.put("/notifications/read-all"); fetch(); };
  const markOne = async (id) => { await api.put(`/notifications/${id}/read`); fetch(); };

  const unread = notifs.filter((n) => !n.is_read).length;

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#1e293b", margin: 0 }}>
          🔔 Notifications {unread > 0 && <span style={{ background: "#dc2626", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 13, marginLeft: 8 }}>{unread}</span>}
        </h2>
        {unread > 0 && <Button variant="secondary" onClick={markAll}>Mark all as read</Button>}
      </div>

      {notifs.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 10, padding: 40, textAlign: "center", color: "#94a3b8" }}>
          <p style={{ fontSize: 40, margin: 0 }}>🔔</p>
          <p>No notifications yet</p>
        </div>
      ) : (
        notifs.map((n) => {
          const c = typeColors[n.type] || typeColors.info;
          return (
            <div key={n.id} style={{
              background: n.is_read ? "#fff" : c.bg,
              border: `1px solid ${n.is_read ? "#e2e8f0" : c.border}`,
              borderLeft: `4px solid ${c.border}`,
              borderRadius: 8, padding: "14px 18px",
              marginBottom: 10, display: "flex",
              justifyContent: "space-between", alignItems: "flex-start",
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: "#1e293b" }}>{n.title}</p>
                <p style={{ margin: "4px 0", color: "#475569", fontSize: 14 }}>{n.message}</p>
                <small style={{ color: "#94a3b8" }}>{new Date(n.created_at).toLocaleString()}</small>
              </div>
              {!n.is_read && (
                <Button variant="secondary" onClick={() => markOne(n.id)} style={{ fontSize: 12, padding: "4px 10px" }}>Mark read</Button>
              )}
            </div>
          );
        })
      )}
    </Layout>
  );
};

export default Notifications;