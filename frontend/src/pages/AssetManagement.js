// frontend/src/pages/AssetManagement.js
import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import api from "../api";

const inpBaseStyle = {
  display: "block", padding: "10px 14px", margin: "8px 0 16px",
  width: "100%", border: "1px solid #cbd5e1", borderRadius: 8,
  fontSize: 14, boxSizing: "border-box", background: "#f8fafc",
  outline: "none", color: "#334155", fontWeight: 500,
  transition: "all 0.15s ease-in-out"
};

const lbl = { fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" };

// Reusable animated dynamic input/select element wrapper
const AnimatedInput = ({ element = "input", children, style, ...props }) => {
  const Element = element;
  return (
    <Element
      {...props}
      style={{ ...inpBaseStyle, ...style }}
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
    >
      {children}
    </Element>
  );
};

const STATUS_COLORS = {
  available: { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
  allocated: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  returned:  { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
  damaged:   { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  lost:      { bg: "#fff5f5", color: "#e11d48", border: "#fecdd3" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  return (
    <span style={{ 
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.3px", display: "inline-block"
    }}>
      {status}
    </span>
  );
};

const EMPTY_FORM = { asset_code: "", asset_name: "", asset_type: "", purchase_date: "", purchase_cost: "", status: "available" };

export default function AssetManagement() {
  const { isAdmin, isHR } = useAuth();
  const canManage = isAdmin || isHR;

  const [assets, setAssets]         = useState({ data: [], total: 0, totalPages: 1 });
  const [employees, setEmployees]   = useState([]);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [page, setPage]             = useState(1);

  const [formOpen, setFormOpen]     = useState(false);
  const [editAsset, setEditAsset]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);

  const [allocOpen, setAllocOpen]   = useState(false);
  const [allocAsset, setAllocAsset] = useState(null);
  const [allocEmp, setAllocEmp]     = useState("");
  const [allocNote, setAllocNote]   = useState("");

  const [detail, setDetail]         = useState(null);

  const fetchAssets = useCallback(async () => {
    try {
      const r = await api.get("/assets", { params: { page, limit: 10, search, status: statusFilter } });
      setAssets(r.data);
    } catch (e) { console.error(e); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);
  useEffect(() => {
    if (canManage) api.get("/employees").then(r => setEmployees(r.data)).catch(() => {});
  }, [canManage]);

  const openCreate = () => { setEditAsset(null); setForm(EMPTY_FORM); setFormOpen(true); };
  const openEdit   = (a)  => { setEditAsset(a);  setForm({ ...a, purchase_date: a.purchase_date?.slice(0,10) || "" }); setFormOpen(true); };

  const saveAsset = async () => {
    try {
      if (editAsset) await api.put(`/assets/${editAsset.id}`, form);
      else           await api.post("/assets", form);
      setFormOpen(false); fetchAssets();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const deleteAsset = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try { await api.delete(`/assets/${id}`); fetchAssets(); }
    catch (e) { alert(e.response?.data?.message || "Delete failed"); }
  };

  const openAlloc = (a) => { setAllocAsset(a); setAllocEmp(""); setAllocNote(""); setAllocOpen(true); };
  const doAllocate = async () => {
    if (!allocEmp) return alert("Select an employee");
    try {
      await api.post("/assets/allocate", { asset_id: allocAsset.id, employee_id: allocEmp, notes: allocNote });
      setAllocOpen(false); fetchAssets(); alert("Asset allocated!");
    } catch (e) { alert(e.response?.data?.message || "Error"); }
  };

  const viewDetail = async (id) => {
    try {
      const r = await api.get(`/assets/${id}`);
      setDetail(r.data);
    } catch (e) { alert("Error loading detail"); }
  };

  return (
    <Layout>
      {/* Header Panel */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>💻 Asset Management</h2>
        {isAdmin && (
          <Button 
            onClick={openCreate}
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
            + Add Asset
          </Button>
        )}
      </div>

      {/* Filter Component Layer */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", background: "#fff", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
        <AnimatedInput
          placeholder="🔍 Search asset name, code..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ margin: 0, width: 260 }}
        />
        <AnimatedInput 
          element="select" 
          value={statusFilter} 
          onChange={e => { setStatus(e.target.value); setPage(1); }} 
          style={{ margin: 0, width: 180 }}
        >
          <option value="">All Statuses</option>
          {["available","allocated","returned","damaged","lost"].map(s => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </AnimatedInput>
      </div>

      <Table
        columns={[
          { key: "asset_code",  label: "Code", render: r => <span style={{ fontWeight: 700, color: "#1e293b" }}>{r.asset_code}</span> },
          { key: "asset_name",  label: "Asset Name" },
          { key: "asset_type",  label: "Type" },
          { key: "purchase_cost", label: "Cost", render: r => r.purchase_cost ? `₹${Number(r.purchase_cost).toLocaleString('en-IN')}` : "-" },
          { key: "status",      label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={assets.data}
        actions={r => (
          <div style={{ display: "flex", gap: 8 }}>
            
            {/* VIEW HISTORY BUTTON (BLUE) */}
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
              History
            </Button>

            {/* ALLOCATE BUTTON (GREEN TINT) */}
            {canManage && r.status === "available" && (
              <Button 
                onClick={() => openAlloc(r)}
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
                Allocate
              </Button>
            )}

            {/* EDIT BUTTON (ORANGE) */}
            {isAdmin && (
              <Button 
                onClick={() => openEdit(r)}
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
            )}

            {/* DELETE BUTTON (LIGHT RED) */}
            {isAdmin && (
              <Button 
                onClick={() => deleteAsset(r.id)}
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
                Delete
              </Button>
            )}
          </div>
        )}
      />

      {/* Pagination Controls */}
      {assets.totalPages > 1 && (
        <div style={{ display: "flex", gap: 12, marginTop: 24, alignItems: "center", justifyContent: "flex-start" }}>
          <Button 
            disabled={page === 1} 
            onClick={() => setPage(p => p-1)}
            style={{ padding: "8px 16px", borderRadius: 8 }}
          >
            ← Previous
          </Button>
          <span style={{ color: "#475569", fontSize: 13, fontWeight: 600, background: "#f1f5f9", padding: "6px 14px", borderRadius: 20 }}>
            Page {page} of {assets.totalPages}
          </span>
          <Button 
            disabled={page === assets.totalPages} 
            onClick={() => setPage(p => p+1)}
            style={{ padding: "8px 16px", borderRadius: 8 }}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal 
        open={formOpen} 
        title={editAsset ? "📝 Edit System Asset" : "⚙️ Add Asset Entry"}
        onClose={() => setFormOpen(false)}
        footer={
          <Button 
            onClick={saveAsset} 
            style={{ background: "#3b6cf8", color: "#fff", padding: "10px 24px", fontWeight: 700, borderRadius: 8 }}
          >
            Save Asset Details
          </Button>
        }
      >
        <div style={{ paddingTop: 8 }}>
          <label style={lbl}>Asset Code</label>
          <AnimatedInput value={form.asset_code} onChange={e => setForm({...form, asset_code: e.target.value})} placeholder="e.g. LPT-001" />
          
          <label style={lbl}>Asset Name</label>
          <AnimatedInput value={form.asset_name} onChange={e => setForm({...form, asset_name: e.target.value})} placeholder="e.g. Dell Laptop XPS" />
          
          <label style={lbl}>Type Category</label>
          <AnimatedInput value={form.asset_type} onChange={e => setForm({...form, asset_type: e.target.value})} placeholder="e.g. Laptop, Monitor, Peripheral" />
          
          <label style={lbl}>Purchase Ledger Date</label>
          <AnimatedInput type="date" value={form.purchase_date} onChange={e => setForm({...form, purchase_date: e.target.value})} />
          
          <label style={lbl}>Purchase Valuation Cost (₹)</label>
          <AnimatedInput type="number" value={form.purchase_cost} onChange={e => setForm({...form, purchase_cost: e.target.value})} placeholder="e.g. 55000" />
          
          <label style={lbl}>Status Lifecycle State</label>
          <AnimatedInput element="select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            {["available","returned","damaged","lost"].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </AnimatedInput>
        </div>
      </Modal>

      {/* Allocate Modal */}
      <Modal 
        open={allocOpen} 
        title={`🤝 Assign Asset: ${allocAsset?.asset_name}`}
        onClose={() => setAllocOpen(false)}
        footer={
          <Button 
            onClick={doAllocate} 
            style={{ background: "#16a34a", color: "#fff", padding: "10px 24px", fontWeight: 700, borderRadius: 8 }}
          >
            Finalize Allocation
          </Button>
        }
      >
        <div style={{ paddingTop: 8 }}>
          <label style={lbl}>Select Beneficiary Employee</label>
          <AnimatedInput element="select" value={allocEmp} onChange={e => setAllocEmp(e.target.value)}>
            <option value="">-- Choose Operator Target --</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.department_name || "Unassigned Dept"})</option>)}
          </AnimatedInput>
          
          <label style={lbl}>Operational Remarks / Notes</label>
          <AnimatedInput value={allocNote} onChange={e => setAllocNote(e.target.value)} placeholder="State justification context details..." />
        </div>
      </Modal>

      {/* Detail / History Modal */}
      <Modal 
        open={!!detail} 
        title={`🔍 Trace Log: ${detail?.asset?.asset_name}`}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <div style={{ paddingTop: 8 }}>
            {/* Informational Cards Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                ["System Code", detail.asset.asset_code], 
                ["Type Classification", detail.asset.asset_type],
                ["Acquisition Cost", detail.asset.purchase_cost ? `₹${Number(detail.asset.purchase_cost).toLocaleString('en-IN')}` : "—"],
                ["Current State", detail.asset.status.toUpperCase()]
              ].map(([k, v]) => (
                <div key={k} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3px" }}>{k}</p>
                  <p style={{ margin: "6px 0 0", color: "#0f172a", fontWeight: 600, fontSize: 14 }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Timeline Matrix Graph */}
            <h4 style={{ color: "#475569", margin: "0 0 16px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Operational Lifecycle Timeline
            </h4>
            
            <div style={{ paddingLeft: 6 }}>
              {detail.history.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 14, margin: 0, fontStyle: "italic" }}>No history events recorded.</p>
              ) : (
                detail.history.map((h, i) => (
                  <div key={i} style={{ 
                    borderLeft: "2px solid #3b6cf8", 
                    paddingLeft: 18, 
                    paddingBottom: i === detail.history.length - 1 ? 0 : 20,
                    position: "relative" 
                  }}>
                    {/* Timeline structural dot indicator node */}
                    <div style={{
                      position: "absolute", width: 10, height: 10, borderRadius: "50%",
                      background: "#3b6cf8", left: -6, top: 4, border: "2px solid #fff"
                    }} />
                    
                    <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: 14, textTransform: "capitalize" }}>
                      {h.action}
                    </p>
                    <p style={{ margin: "4px 0", fontSize: 13, color: "#475569", fontWeight: 500 }}>
                      {h.remarks || "No descriptive note applied."}
                    </p>
                    <small style={{ color: "#94a3b8", fontWeight: 600, fontSize: 11 }}>
                      👤 {h.performed_by_name} • 📅 {new Date(h.created_at).toLocaleString()}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}