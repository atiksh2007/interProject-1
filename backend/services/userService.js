const bcrypt = require("bcrypt");
const pool = require("../config/db");
module.exports = {
  async createUser({ name, email, password, role }) {
    const exists = await pool.query(`SELECT id FROM users WHERE email=$1`, [email]);
    if (exists.rows.length > 0) throw new Error("Email already exists");
    const hashed = await bcrypt.hash(password, 10);
    const r = await pool.query(
      `INSERT INTO users(name,email,password,role,verified) VALUES($1,$2,$3,$4,true)
       RETURNING id,name,email,role`, [name, email, hashed, role]);
    if (role === "employee") {
      const p = await pool.query(
        `INSERT INTO employee_profiles(user_id) VALUES($1) RETURNING id`, [r.rows[0].id]);
      const types = await pool.query(`SELECT id, total_days FROM leave_types`);
      for (const t of types.rows)
        await pool.query(
          `INSERT INTO leave_balance(employee_id, leave_type_id, available_days)
           VALUES($1,$2,$3) ON CONFLICT DO NOTHING`, [p.rows[0].id, t.id, t.total_days]);
    }
    return r.rows[0];
  },
  listUsers: async () => (await pool.query(
    `SELECT id, name, email, role, verified, created_at FROM users ORDER BY id`)).rows,
};
