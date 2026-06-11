// backend/routes/audit.js
const router = require("express").Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const pool = require("../config/db");

router.use(verifyToken);
router.use(requireRole("admin", "hr"));

// GET /api/audit?table=&action=&user_id=&from=&to=&page=&limit=
router.get("/", async (req, res) => {
  try {
    const {
      table, action, user_id,
      from, to,
      page  = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];
    let pi = 1;

    if (table)   { conditions.push(`al.table_name  = $${pi++}`); params.push(table); }
    if (action)  { conditions.push(`al.action_type = $${pi++}`); params.push(action); }
    if (user_id) { conditions.push(`al.performed_by = $${pi++}`); params.push(parseInt(user_id)); }
    if (from)    { conditions.push(`al.created_at >= $${pi++}`); params.push(from); }
    if (to)      { conditions.push(`al.created_at <= $${pi++}`); params.push(to + " 23:59:59"); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countRes = await pool.query(`SELECT COUNT(*) FROM audit_logs al ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(parseInt(limit), offset);
    const rows = await pool.query(`
      SELECT al.*, u.name AS performed_by_name
      FROM audit_logs al
      LEFT JOIN users u ON al.performed_by = u.id
      ${where}
      ORDER BY al.created_at DESC
      LIMIT $${pi} OFFSET $${pi + 1}
    `, params);

    res.json({ data: rows.rows, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/audit/tables – distinct table names in logs
router.get("/tables", async (req, res) => {
  try {
    const r = await pool.query("SELECT DISTINCT table_name FROM audit_logs ORDER BY table_name");
    res.json(r.rows.map(r => r.table_name));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
