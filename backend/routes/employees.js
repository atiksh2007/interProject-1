const express = require("express");
const router = express.Router();
const pool = require("../config/db");


router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      department_id,
      phone,
      address,
      designation,
      salary
    } = req.body;

    const result = await pool.query(
      `INSERT INTO employee_profiles
       (user_id, department_id, phone, address, designation, salary)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [user_id, department_id, phone, address, designation, salary]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ep.*, u.name, d.department_name
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      JOIN departments d ON ep.department_id = d.id
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/skills", async (req, res) => {
  try {
    const { employee_id, skill_id } = req.body;

    await pool.query(
      `INSERT INTO employee_skills (employee_id, skill_id)
       VALUES ($1,$2)`,
      [employee_id, skill_id]
    );

    res.json({ message: "Skill added successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;


    const employee = await pool.query(
      `SELECT * FROM employee_profiles WHERE id=$1`,
      [id]
    );

    // skills
    const skills = await pool.query(`
      SELECT s.skill_name
      FROM employee_skills es
      JOIN skills s ON es.skill_id = s.id
      WHERE es.employee_id = $1
    `, [id]);

    // images
    const images = await pool.query(
      `SELECT * FROM employee_images WHERE employee_id=$1`,
      [id]
    );

    res.json({
      employee: employee.rows[0],
      skills: skills.rows,
      images: images.rows
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;