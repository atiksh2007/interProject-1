const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// GET /api/dashboard/stats
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const [employees, departments, skills, images] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM employee_profiles"),
      pool.query("SELECT COUNT(*) FROM departments"),
      pool.query("SELECT COUNT(*) FROM skills"),
      pool.query("SELECT COUNT(*) FROM employee_images"),
    ]);

    res.json({
      employees: parseInt(employees.rows[0].count),
      departments: parseInt(departments.rows[0].count),
      skills: parseInt(skills.rows[0].count),
      images: parseInt(images.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;