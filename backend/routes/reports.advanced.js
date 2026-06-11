// backend/routes/reports.advanced.js
// Mount this alongside existing reports.js:
//   app.use("/api/reports", reportRoutes);          // existing
//   app.use("/api/reports", advancedReportRoutes);  // new (add after)

const router  = require("express").Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const pool    = require("../config/db");

router.use(verifyToken);
router.use(requireRole("admin", "hr"));

// ── Paginated employee list with search/filter/sort ──────────
// GET /api/reports/employees?search=&department_id=&page=&limit=&sortBy=salary&sortDir=desc
router.get("/employees", async (req, res) => {
  try {
    const {
      search = "", department_id = "",
      page   = 1,  limit = 10,
      sortBy = "ep.id", sortDir = "ASC",
    } = req.query;

    const allowed = ["ep.id","u.name","ep.salary","ep.designation","d.department_name"];
    const safeSort = allowed.includes(sortBy) ? sortBy : "ep.id";
    const safeDir  = sortDir.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const conditions = [];
    const params = [];
    let pi = 1;

    if (search) {
      conditions.push(`(u.name ILIKE $${pi} OR u.email ILIKE $${pi} OR ep.designation ILIKE $${pi})`);
      params.push(`%${search}%`); pi++;
    }
    if (department_id) { conditions.push(`ep.department_id = $${pi++}`); params.push(parseInt(department_id)); }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countRes = await pool.query(`
      SELECT COUNT(*) FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id
      ${where}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(parseInt(limit), offset);
    const rows = await pool.query(`
      SELECT ep.id, u.name, u.email, ep.designation, ep.salary,
             ep.phone, ep.address, d.department_name,
             COUNT(la.id) FILTER (WHERE la.status='approved') AS approved_leaves,
             COUNT(aa.id) FILTER (WHERE aa.status='active')   AS active_assets
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id
      LEFT JOIN leave_applications la ON la.employee_id = ep.id
      LEFT JOIN asset_allocations  aa ON aa.employee_id  = ep.id
      ${where}
      GROUP BY ep.id, u.name, u.email, ep.designation, ep.salary,
               ep.phone, ep.address, d.department_name
      ORDER BY ${safeSort} ${safeDir}
      LIMIT $${pi} OFFSET $${pi+1}
    `, params);

    res.json({ data: rows.rows, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Asset Report ─────────────────────────────────────────────
router.get("/assets", async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT a.*, COUNT(aa.id) FILTER (WHERE aa.status='active') AS current_allocations,
             COUNT(ah.id) AS history_count
      FROM assets a
      LEFT JOIN asset_allocations aa ON aa.asset_id = a.id
      LEFT JOIN asset_history     ah ON ah.asset_id = a.id
      GROUP BY a.id
      ORDER BY a.id
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Department Statistics (uses stored procedure) ────────────
router.get("/department-stats", async (req, res) => {
  try {
    const r = await pool.query("SELECT * FROM get_department_stats()");
    res.json(r.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── CSV Export  ───────────────────────────────────────────────
// GET /api/reports/export/employees?format=csv
router.get("/export/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { format = "csv" } = req.query;
    let rows = [];
    let filename = "report";

    if (type === "employees") {
      const r = await pool.query(`
        SELECT u.name, u.email, ep.designation, ep.salary, ep.phone,
               d.department_name, ep.address
        FROM employee_profiles ep
        JOIN users u ON ep.user_id = u.id
        LEFT JOIN departments d ON ep.department_id = d.id
        ORDER BY u.name
      `);
      rows = r.rows;
      filename = "employee_report";
    } else if (type === "leaves") {
      const r = await pool.query(`
        SELECT u.name AS employee, lt.leave_name, la.from_date, la.to_date,
               la.total_days, la.status, la.reason, la.created_at
        FROM leave_applications la
        JOIN employee_profiles ep ON la.employee_id = ep.id
        JOIN users u ON ep.user_id = u.id
        JOIN leave_types lt ON la.leave_type_id = lt.id
        ORDER BY la.created_at DESC
      `);
      rows = r.rows;
      filename = "leave_report";
    } else if (type === "assets") {
      const r = await pool.query(`
        SELECT a.asset_code, a.asset_name, a.asset_type, a.status,
               a.purchase_date, a.purchase_cost
        FROM assets a ORDER BY a.id
      `);
      rows = r.rows;
      filename = "asset_report";
    }

    if (format === "csv") {
      if (rows.length === 0) return res.send("");
      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(","),
        ...rows.map(row =>
          headers.map(h => {
            const val = row[h] ?? "";
            const str = String(val).replace(/"/g, '""');
            return str.includes(",") || str.includes('"') || str.includes("\n")
              ? `"${str}"` : str;
          }).join(",")
        ),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
      return res.send(csv);
    }

    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Global Search ─────────────────────────────────────────────
router.get("/search", async (req, res) => {
  try {
    const { q = "" } = req.query;
    if (!q || q.length < 2) return res.json({ employees: [], assets: [] });

    const term = `%${q}%`;
    const [emp, ast] = await Promise.all([
      pool.query(`
        SELECT ep.id, u.name, u.email, ep.designation, d.department_name
        FROM employee_profiles ep
        JOIN users u ON ep.user_id = u.id
        LEFT JOIN departments d ON ep.department_id = d.id
        WHERE u.name ILIKE $1 OR u.email ILIKE $1 OR ep.designation ILIKE $1
              OR d.department_name ILIKE $1
        LIMIT 10`, [term]),
      pool.query(
        "SELECT * FROM assets WHERE asset_name ILIKE $1 OR asset_code ILIKE $1 LIMIT 10",
        [term]
      ),
    ]);

    res.json({ employees: emp.rows, assets: ast.rows });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
