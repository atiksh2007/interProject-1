// backend/middleware/auditLogger.js
// Attach this middleware AFTER verifyToken on any route that modifies data.
// Usage:  router.put("/:id", verifyToken, audit("employee_profiles"), controller.update)

const pool = require("../config/db");

/**
 * Creates audit middleware for a given table.
 * @param {string} tableName - Name of the table being modified
 * @param {Function} [getRecordId] - Extract record id from req; defaults to req.params.id
 * @param {Function} [getOldData]  - Async fn(req) → old row object; if omitted logs null
 */
function audit(tableName, getRecordId, getOldData) {
  return async (req, res, next) => {
    // Capture old data before handler runs
    let oldData = null;
    if (getOldData) {
      try { oldData = await getOldData(req); } catch (_) {}
    }

    // Intercept res.json to capture response data
    const originalJson = res.json.bind(res);
    res.json = async function (body) {
      // Log after successful 2xx response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const recordId = getRecordId ? getRecordId(req) : parseInt(req.params.id) || null;
        const action   = { POST: "INSERT", PUT: "UPDATE", PATCH: "UPDATE", DELETE: "DELETE" }[req.method] || req.method;
        const newData  = req.method === "DELETE" ? null : (body && typeof body === "object" ? body : null);
        const ip       = req.ip || req.connection?.remoteAddress;
        try {
          await pool.query(
            `INSERT INTO audit_logs (table_name, action_type, record_id, old_data, new_data, performed_by, ip_address)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [tableName, action, recordId, oldData ? JSON.stringify(oldData) : null,
             newData ? JSON.stringify(newData) : null, req.user?.id || null, ip]
          );
        } catch (e) { console.error("Audit log error:", e.message); }
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = audit;
