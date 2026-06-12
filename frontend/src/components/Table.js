import { useState } from "react";

// Individual Row Component to handle its own aesthetic state safely
const TableRow = ({ row, rowIndex, columns, actions }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Zebra striping defaults combined with clean blue selection tint
  const getBackground = () => {
    if (isHovered) return "#f0f7ff"; 
    return rowIndex % 2 === 0 ? "#fff" : "#f8fafc";
  };

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderBottom: "1px solid #e2e8f0",
        background: getBackground(),
        transition: "background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {columns.map((c) => (
        <td
          key={c.key}
          style={{
            padding: "13px 16px",
            color: isHovered ? "#1e40af" : "#334155",
            fontSize: 14,
            fontWeight: isHovered ? 600 : 500,
            transition: "color 0.15s ease",
          }}
        >
          {c.render ? c.render(row) : row[c.key] ?? "—"}
        </td>
      ))}
      {actions && (
        <td style={{ padding: "13px 16px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {actions(row)}
          </div>
        </td>
      )}
    </tr>
  );
};

const Table = ({ columns, rows, actions }) => (
  <div
    style={{
      overflowX: "auto",
      marginTop: 20,
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      boxShadow: "0 4px 20px rgba(59, 108, 248, 0.02)",
    }}
  >
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <thead>
        <tr
          style={{
            background: "#f8fafc",
            borderBottom: "2px solid #cbd5e1",
          }}
        >
          {columns.map((c) => (
            <th
              key={c.key}
              style={{
                padding: "14px 16px",
                color: "#475569",
                fontWeight: 700,
                fontSize: 12,
                textAlign: "left",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {c.label}
            </th>
          ))}
          {actions && (
            <th
              style={{
                padding: "14px 16px",
                color: "#475569",
                fontWeight: 700,
                fontSize: 12,
                textAlign: "left",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length + (actions ? 1 : 0)}
              style={{
                textAlign: "center",
                padding: 40,
                color: "#94a3b8",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              No active dataset found.
            </td>
          </tr>
        ) : (
          rows.map((r, i) => (
            <TableRow
              key={i}
              row={r}
              rowIndex={i}
              columns={columns}
              actions={actions}
            />
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default Table;