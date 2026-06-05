const pool = require("../config/db");
module.exports = {
  getAll: async () => (await pool.query(`SELECT * FROM leave_types ORDER BY id`)).rows,
  create: async (d) => {
    const r = await pool.query(
      `INSERT INTO leave_types(leave_name,total_days,description) VALUES($1,$2,$3) RETURNING *`,
      [d.leave_name, d.total_days, d.description]);
    await pool.query(`
      INSERT INTO leave_balance(employee_id, leave_type_id, available_days)
      SELECT ep.id, $1, $2 FROM employee_profiles ep
      ON CONFLICT DO NOTHING`, [r.rows[0].id, d.total_days]);
    return r.rows[0];
  },
  update: async (id, d) => (await pool.query(
    `UPDATE leave_types SET leave_name=$1, total_days=$2, description=$3 WHERE id=$4 RETURNING *`,
    [d.leave_name, d.total_days, d.description, id])).rows[0],
  delete: async (id) => pool.query(`DELETE FROM leave_types WHERE id=$1`, [id]),
};
