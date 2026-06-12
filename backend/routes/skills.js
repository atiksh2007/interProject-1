const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken, adminOnly } = require("../middleware/auth");

// GET /api/skills
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM skills ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/skills — admin only
router.post("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const { skill_name } = req.body;

    const result = await pool.query(
      "INSERT INTO skills (skill_name) VALUES ($1) RETURNING *",
      [skill_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/skills/:id — admin only
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    await pool.query("DELETE FROM skills WHERE id=$1", [req.params.id]);
    res.json({ message: "Skill deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;