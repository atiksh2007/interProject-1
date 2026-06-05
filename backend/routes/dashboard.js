const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { verifyToken } = require("../middleware/auth");

router.get("/stats", verifyToken, async (req, res) => {
  try {
    const [emp, dep, skl, img, lt, la] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM employee_profiles`),
      pool.query(`SELECT COUNT(*) FROM departments`),
      pool.query(`SELECT COUNT(*) FROM skills`),
      pool.query(`SELECT COUNT(*) FROM employee_images`),
      pool.query(`SELECT COUNT(*) FROM leave_types`),
      pool.query(`SELECT COUNT(*) FROM leave_applications`),
    ]);
    res.json({
      employees:   parseInt(emp.rows[0].count),
      departments: parseInt(dep.rows[0].count),
      skills:      parseInt(skl.rows[0].count),
      images:      parseInt(img.rows[0].count),
      leaveTypes:  parseInt(lt.rows[0].count),
      totalLeaves: parseInt(la.rows[0].count),
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
