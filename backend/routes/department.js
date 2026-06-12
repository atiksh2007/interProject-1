const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, adminOnly } = require("../middleware/auth");

// GET /api/departments
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM departments ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/departments — admin only
router.post("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const { department_name } = req.body;

    const result = await pool.query(
      "INSERT INTO departments (department_name) VALUES ($1) RETURNING *",
      [department_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/departments/:id — admin only
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    await pool.query("DELETE FROM departments WHERE id=$1", [req.params.id]);
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
