const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, adminOnly } = require("../middleware/auth");

// GET /api/employees — admin sees all, employee sees own profile only
router.get("/", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const result = await pool.query(`
        SELECT ep.*, u.name, u.email, d.department_name
        FROM employee_profiles ep
        JOIN users u ON ep.user_id = u.id
        JOIN departments d ON ep.department_id = d.id
        ORDER BY ep.id
      `);
      return res.json(result.rows);
    }

    // Employee: return only their own profile
    const result = await pool.query(
      `SELECT ep.*, u.name, u.email, d.department_name
       FROM employee_profiles ep
       JOIN users u ON ep.user_id = u.id
       JOIN departments d ON ep.department_id = d.id
       WHERE ep.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employees/:id — admin or the employee themselves
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await pool.query(
      `SELECT ep.*, u.name, u.email, d.department_name
       FROM employee_profiles ep
       JOIN users u ON ep.user_id = u.id
       JOIN departments d ON ep.department_id = d.id
       WHERE ep.id = $1`,
      [id]
    );

    if (employee.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Non-admin can only view their own profile
    if (
      req.user.role !== "admin" &&
      employee.rows[0].user_id !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const skills = await pool.query(
      `SELECT s.id, s.skill_name
       FROM employee_skills es
       JOIN skills s ON es.skill_id = s.id
       WHERE es.employee_id = $1`,
      [id]
    );

    const images = await pool.query(
      "SELECT * FROM employee_images WHERE employee_id=$1",
      [id]
    );

    res.json({ employee: employee.rows[0], skills: skills.rows, images: images.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/employees — admin only: create employee profile
router.post("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const { user_id, department_id, phone, address, designation, salary } = req.body;

    const result = await pool.query(
      `INSERT INTO employee_profiles (user_id, department_id, phone, address, designation, salary)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [user_id, department_id, phone, address, designation, salary]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/employees/:id — admin only: edit employee
router.put("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, phone, address, designation, salary } = req.body;

    const result = await pool.query(
      `UPDATE employee_profiles
       SET department_id=$1, phone=$2, address=$3, designation=$4, salary=$5
       WHERE id=$6 RETURNING *`,
      [department_id, phone, address, designation, salary, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/employees/:id — admin only
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM employee_skills WHERE employee_id=$1", [id]);
    await pool.query("DELETE FROM employee_images WHERE employee_id=$1", [id]);
    await pool.query("DELETE FROM employee_profiles WHERE id=$1", [id]);

    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/employees/skills — assign skill to employee
router.post("/skills", verifyToken, adminOnly, async (req, res) => {
  try {
    const { employee_id, skill_id } = req.body;

    await pool.query(
      "INSERT INTO employee_skills (employee_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [employee_id, skill_id]
    );

    res.json({ message: "Skill assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/employees/me — employee creates their own profile
router.post("/me", verifyToken, async (req, res) => {
  try {
    const { department_id, phone, address, designation, salary } = req.body;

    // Check if profile already exists
    const existing = await pool.query(
      "SELECT id FROM employee_profiles WHERE user_id=$1",
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const result = await pool.query(
      `INSERT INTO employee_profiles (user_id, department_id, phone, address, designation, salary)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, department_id, phone, address, designation, salary]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employees/me/skills — get current employee's skills
router.get("/me/skills", verifyToken, async (req, res) => {
  try {
    // First get their employee profile id
    const profile = await pool.query(
      "SELECT id FROM employee_profiles WHERE user_id=$1",
      [req.user.id]
    );

    if (profile.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const employeeId = profile.rows[0].id;

    // Get all skills and mark which ones employee already has
    const result = await pool.query(`
      SELECT s.id, s.skill_name,
        CASE WHEN es.skill_id IS NOT NULL THEN true ELSE false END AS assigned
      FROM skills s
      LEFT JOIN employee_skills es 
        ON s.id = es.skill_id AND es.employee_id = $1
      ORDER BY s.id
    `, [employeeId]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/employees/me/skills — employee adds a skill to themselves
router.post("/me/skills", verifyToken, async (req, res) => {
  try {
    const { skill_id } = req.body;

    const profile = await pool.query(
      "SELECT id FROM employee_profiles WHERE user_id=$1",
      [req.user.id]
    );

    if (profile.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const employeeId = profile.rows[0].id;

    await pool.query(
      "INSERT INTO employee_skills (employee_id, skill_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
      [employeeId, skill_id]
    );

    res.json({ message: "Skill added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/employees/me/skills/:skillId — employee removes a skill
router.delete("/me/skills/:skillId", verifyToken, async (req, res) => {
  try {
    const { skillId } = req.params;

    const profile = await pool.query(
      "SELECT id FROM employee_profiles WHERE user_id=$1",
      [req.user.id]
    );

    if (profile.rows.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const employeeId = profile.rows[0].id;

    await pool.query(
      "DELETE FROM employee_skills WHERE employee_id=$1 AND skill_id=$2",
      [employeeId, skillId]
    );

    res.json({ message: "Skill removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;