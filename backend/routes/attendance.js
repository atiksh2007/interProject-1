const express = require("express");
const router = express.Router();
const pool = require("../config/db");


router.get("/employee/:id", async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT 
        id,
        date,
        status,
        check_in,
        check_out
      FROM attendance
      WHERE employee_id = $1
      ORDER BY date ASC
      `,
      [req.params.id]
    );

    res.json(result.rows);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to get attendance"
    });

  }

});


module.exports = router;