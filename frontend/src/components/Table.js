const Table = ({ columns, rows, actions }) => (
  <div style={{ overflowX: "auto", marginTop: 16 }}>
    <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <thead>
        <tr style={{ background: "#1e293b" }}>
          {columns.map((c) => (
            <th key={c.key} style={{ padding: "12px 14px", color: "#cbd5e1", fontWeight: 600, fontSize: 13, textAlign: "left", whiteSpace: "nowrap" }}>
              {c.label}
            </th>
          ))}
          {actions && <th style={{ padding: "12px 14px", color: "#cbd5e1", fontWeight: 600, fontSize: 13, textAlign: "left" }}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
              No data found
            </td>
          </tr>
        ) : (
          rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
              {columns.map((c) => (
                <td key={c.key} style={{ padding: "11px 14px", color: "#334155", fontSize: 14 }}>
                  {c.render ? c.render(r) : r[c.key] ?? "-"}
                </td>
              ))}
              {actions && (
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>{actions(r)}</div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default Table;