const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.get("/stats", async (req, res) => {
  try {
    const employees = await pool.query(
      "SELECT COUNT(*) FROM employee_profiles"
    );

    const departments = await pool.query(
      "SELECT COUNT(*) FROM departments"
    );

    const skills = await pool.query(
      "SELECT COUNT(*) FROM skills"
    );

    const images = await pool.query(
      "SELECT COUNT(*) FROM employee_images"
    );

    res.json({
      employees: parseInt(employees.rows[0].count),
      departments: parseInt(departments.rows[0].count),
      skills: parseInt(skills.rows[0].count),
      images: parseInt(images.rows[0].count)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;