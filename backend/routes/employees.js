const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, adminOnly } = require("../middleware/auth");

router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const r = await pool.query(`
        SELECT ep.*, u.name, u.email, d.department_name,
               m_ep.id AS mgr_id, m_u.name AS manager_name
        FROM employee_profiles ep
        JOIN users u ON ep.user_id = u.id
        LEFT JOIN departments d ON ep.department_id = d.id
        LEFT JOIN employee_profiles m_ep ON ep.manager_id = m_ep.id
        LEFT JOIN users m_u ON m_ep.user_id = m_u.id
        ORDER BY ep.id`);
      return res.json(r.rows);
    }
    const r = await pool.query(`
      SELECT ep.*, u.name, u.email, d.department_name
        FROM employee_profiles ep
        JOIN users u ON ep.user_id = u.id
        LEFT JOIN departments d ON ep.department_id = d.id
       WHERE ep.user_id=$1`, [req.user.id]);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT ep.*, u.name, u.email, d.department_name,
             m_ep.id AS mgr_id, m_u.name AS manager_name
        FROM employee_profiles ep
        JOIN users u ON ep.user_id = u.id
        LEFT JOIN departments d ON ep.department_id = d.id
        LEFT JOIN employee_profiles m_ep ON ep.manager_id = m_ep.id
        LEFT JOIN users m_u ON m_ep.user_id = m_u.id
       WHERE ep.id=$1`, [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ message: "Not found" });
    if (req.user.role !== "admin" && r.rows[0].user_id !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });
    const skills = await pool.query(`
      SELECT s.id, s.skill_name FROM employee_skills es
      JOIN skills s ON es.skill_id = s.id WHERE es.employee_id=$1`, [req.params.id]);
    const images = await pool.query(`SELECT * FROM employee_images WHERE employee_id=$1`, [req.params.id]);
    res.json({ employee: r.rows[0], skills: skills.rows, images: images.rows });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const { user_id, department_id, phone, address, designation, salary, manager_id } = req.body;
    const r = await pool.query(
      `INSERT INTO employee_profiles(user_id, department_id, phone, address, designation, salary, manager_id)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [user_id, department_id, phone, address, designation, salary, manager_id || null]
    );
    const types = await pool.query(`SELECT id, total_days FROM leave_types`);
    for (const t of types.rows) {
      await pool.query(
        `INSERT INTO leave_balance(employee_id, leave_type_id, available_days)
         VALUES($1,$2,$3) ON CONFLICT DO NOTHING`,
        [r.rows[0].id, t.id, t.total_days]
      );
    }
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { department_id, phone, address, designation, salary, manager_id } = req.body;
    const r = await pool.query(
      `UPDATE employee_profiles
         SET department_id=$1, phone=$2, address=$3, designation=$4, salary=$5, manager_id=$6
       WHERE id=$7 RETURNING *`,
      [department_id, phone, address, designation, salary, manager_id || null, req.params.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ message: "Not found" });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    await pool.query(`DELETE FROM employee_skills WHERE employee_id=$1`, [req.params.id]);
    await pool.query(`DELETE FROM employee_images WHERE employee_id=$1`, [req.params.id]);
    await pool.query(`DELETE FROM leave_balance WHERE employee_id=$1`, [req.params.id]);
    await pool.query(`DELETE FROM leave_applications WHERE employee_id=$1`, [req.params.id]);
    await pool.query(`DELETE FROM employee_profiles WHERE id=$1`, [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/me", verifyToken, async (req, res) => {
  try {
    const { department_id, phone, address, designation, salary } = req.body;
    const exists = await pool.query(`SELECT id FROM employee_profiles WHERE user_id=$1`, [req.user.id]);
    if (exists.rows.length > 0) return res.status(400).json({ message: "Profile exists" });
    const r = await pool.query(
      `INSERT INTO employee_profiles(user_id, department_id, phone, address, designation, salary)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, department_id, phone, address, designation, salary]
    );
    const types = await pool.query(`SELECT id, total_days FROM leave_types`);
    for (const t of types.rows) {
      await pool.query(
        `INSERT INTO leave_balance(employee_id, leave_type_id, available_days)
         VALUES($1,$2,$3) ON CONFLICT DO NOTHING`,
        [r.rows[0].id, t.id, t.total_days]
      );
    }
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put("/me", verifyToken, async (req, res) => {
  try {
    const { department_id, phone, address, designation, salary } = req.body;
    const r = await pool.query(
      `UPDATE employee_profiles
          SET department_id=$1, phone=$2, address=$3, designation=$4, salary=$5
        WHERE user_id=$6 RETURNING *`,
      [department_id, phone, address, designation, salary, req.user.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/me/skills", verifyToken, async (req, res) => {
  try {
    const p = await pool.query(`SELECT id FROM employee_profiles WHERE user_id=$1`, [req.user.id]);
    if (p.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
    const r = await pool.query(`
      SELECT s.id, s.skill_name,
        CASE WHEN es.skill_id IS NOT NULL THEN true ELSE false END AS assigned
      FROM skills s
      LEFT JOIN employee_skills es ON s.id = es.skill_id AND es.employee_id = $1
      ORDER BY s.id`, [p.rows[0].id]);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/me/skills", verifyToken, async (req, res) => {
  try {
    const p = await pool.query(`SELECT id FROM employee_profiles WHERE user_id=$1`, [req.user.id]);
    if (p.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
    await pool.query(
      `INSERT INTO employee_skills(employee_id, skill_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,
      [p.rows[0].id, req.body.skill_id]
    );
    res.json({ message: "Skill added" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete("/me/skills/:skillId", verifyToken, async (req, res) => {
  try {
    const p = await pool.query(`SELECT id FROM employee_profiles WHERE user_id=$1`, [req.user.id]);
    if (p.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
    await pool.query(
      `DELETE FROM employee_skills WHERE employee_id=$1 AND skill_id=$2`,
      [p.rows[0].id, req.params.skillId]
    );
    res.json({ message: "Removed" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/skills", verifyToken, adminOnly, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO employee_skills(employee_id, skill_id) VALUES($1,$2) ON CONFLICT DO NOTHING`,
      [req.body.employee_id, req.body.skill_id]
    );
    res.json({ message: "Skill assigned" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
