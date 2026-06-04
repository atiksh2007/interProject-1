const pool = require("../config/db");

module.exports = {
  async create(employeeId, typeId, from, to, days, reason, approverId) {
    const r = await pool.query(
      `INSERT INTO leave_applications
        (employee_id, leave_type_id, from_date, to_date, total_days, reason, status, current_approver_id)
       VALUES ($1,$2,$3,$4,$5,$6,'pending_manager',$7) RETURNING *`,
      [employeeId, typeId, from, to, days, reason, approverId]
    );
    return r.rows[0];
  },


  
  async findByEmployee(empId) {
    const r = await pool.query(
      `SELECT la.*, lt.leave_name FROM leave_applications la
       JOIN leave_types lt ON la.leave_type_id=lt.id
       WHERE employee_id=$1 ORDER BY created_at DESC`, [empId]);
    return r.rows;
  },

async leaveTypes() {
  const r = await pool.query(`
    SELECT id, leave_name, total_days, description
    FROM leave_types
    ORDER BY leave_name
  `);
  return r.rows;
},

  async getDetails(id) {
    const leave = await pool.query(`
      SELECT la.*, lt.leave_name, u.name AS employee_name, u.email,
             d.department_name, e.manager_id
        FROM leave_applications la
        JOIN employee_profiles e ON la.employee_id=e.id
        JOIN users u ON e.user_id=u.id
        LEFT JOIN departments d ON e.department_id=d.id
        JOIN leave_types lt ON la.leave_type_id=lt.id
       WHERE la.id=$1`, [id]);
    const history = await pool.query(`
      SELECT ah.*, u.name AS approver_name FROM approval_history ah
        JOIN users u ON ah.approved_by=u.id
       WHERE ah.leave_id=$1 ORDER BY ah.created_at`, [id]);
    return { leave: leave.rows[0], history: history.rows };
  },

  async pendingForManager(mgrEmpId) {
    const r = await pool.query(`
      SELECT la.*, u.name AS employee_name, lt.leave_name
        FROM leave_applications la
        JOIN employee_profiles e ON la.employee_id=e.id
        JOIN users u ON e.user_id=u.id
        JOIN leave_types lt ON la.leave_type_id=lt.id
       WHERE la.status='pending_manager' AND e.manager_id=$1
       ORDER BY la.created_at`, [mgrEmpId]);
    return r.rows;
  },

  async pendingForHR() {
    const r = await pool.query(`
      SELECT la.*, u.name AS employee_name, lt.leave_name, d.department_name
        FROM leave_applications la
        JOIN employee_profiles e ON la.employee_id=e.id
        JOIN users u ON e.user_id=u.id
        LEFT JOIN departments d ON e.department_id=d.id
        JOIN leave_types lt ON la.leave_type_id=lt.id
       WHERE la.status='pending_hr' ORDER BY la.created_at`);
    return r.rows;
  },

  // Transactional final approval
  async approveFinal(leaveId, approverId, role, remarks) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const lr = await client.query(
        `SELECT * FROM leave_applications WHERE id=$1 FOR UPDATE`, [leaveId]);
      if (lr.rows.length === 0) throw new Error("Leave not found");
      if (lr.rows[0].status !== "pending_hr") throw new Error("Not at HR stage");

      const br = await client.query(
        `SELECT available_days FROM leave_balance
          WHERE employee_id=$1 AND leave_type_id=$2 FOR UPDATE`,
        [lr.rows[0].employee_id, lr.rows[0].leave_type_id]);
      if (!br.rows[0] || br.rows[0].available_days < lr.rows[0].total_days)
        throw new Error("Insufficient leave balance");

      await client.query(
        `UPDATE leave_applications SET status='approved', updated_at=NOW() WHERE id=$1`, [leaveId]);
      await client.query(
        `UPDATE leave_balance SET available_days = available_days - $1, updated_at=NOW()
          WHERE employee_id=$2 AND leave_type_id=$3`,
        [lr.rows[0].total_days, lr.rows[0].employee_id, lr.rows[0].leave_type_id]);
      await client.query(
        `INSERT INTO approval_history(leave_id, approved_by, approver_role, action, remarks)
         VALUES($1,$2,$3,'approved',$4)`, [leaveId, approverId, role, remarks]);
      const ur = await client.query(
        `SELECT user_id FROM employee_profiles WHERE id=$1`, [lr.rows[0].employee_id]);
      await client.query(
        `INSERT INTO notifications(user_id, title, message, type, link)
         VALUES($1,'Leave Approved','Your leave has been finally approved','success','/my-leaves')`,
        [ur.rows[0].user_id]);
      await client.query("COMMIT");
      return true;
    } catch (e) { await client.query("ROLLBACK"); throw e; }
    finally { client.release(); }
  },

  async approveAtManager(leaveId, approverId, remarks) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const lr = await client.query(
        `SELECT * FROM leave_applications WHERE id=$1 FOR UPDATE`, [leaveId]);
      if (lr.rows[0].status !== "pending_manager") throw new Error("Not at manager stage");
      await client.query(
        `UPDATE leave_applications SET status='pending_hr', updated_at=NOW() WHERE id=$1`, [leaveId]);
      await client.query(
        `INSERT INTO approval_history(leave_id, approved_by, approver_role, action, remarks)
         VALUES($1,$2,'manager','approved',$3)`, [leaveId, approverId, remarks]);
      const ur = await client.query(
        `SELECT user_id FROM employee_profiles WHERE id=$1`, [lr.rows[0].employee_id]);
      await client.query(
        `INSERT INTO notifications(user_id, title, message, type, link)
         VALUES($1,'Manager Approved','Your leave is pending HR approval','info','/my-leaves')`,
        [ur.rows[0].user_id]);
      await client.query("COMMIT");
      return true;
    } catch (e) { await client.query("ROLLBACK"); throw e; }
    finally { client.release(); }
  },

  async reject(leaveId, approverId, role, remarks) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE leave_applications SET status='rejected', updated_at=NOW() WHERE id=$1`, [leaveId]);
      await client.query(
        `INSERT INTO approval_history(leave_id, approved_by, approver_role, action, remarks)
         VALUES($1,$2,$3,'rejected',$4)`, [leaveId, approverId, role, remarks]);
      const ur = await client.query(
        `SELECT ep.user_id FROM employee_profiles ep
           JOIN leave_applications la ON la.employee_id=ep.id
          WHERE la.id=$1`, [leaveId]);
      await client.query(
        `INSERT INTO notifications(user_id, title, message, type, link)
         VALUES($1,'Leave Rejected','Your leave has been rejected','warning','/my-leaves')`,
        [ur.rows[0].user_id]);
      await client.query("COMMIT");
    } catch (e) { await client.query("ROLLBACK"); throw e; }
    finally { client.release(); }
  },

  async cancel(leaveId, userId) {
    const r = await pool.query(
      `UPDATE leave_applications SET status='cancelled', updated_at=NOW()
        WHERE id=$1 AND employee_id IN
          (SELECT id FROM employee_profiles WHERE user_id=$2)
        AND status IN ('pending_manager','pending_hr')
        RETURNING *`, [leaveId, userId]);
    if (r.rows.length === 0) throw new Error("Cannot cancel");
    await pool.query(
      `INSERT INTO approval_history(leave_id, approved_by, approver_role, action, remarks)
       VALUES($1,$2,'employee','cancelled','Cancelled by employee')`, [leaveId, userId]);
    return r.rows[0];
  },
};
