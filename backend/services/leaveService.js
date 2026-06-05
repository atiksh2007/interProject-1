const pool = require("../config/db");
const repo = require("../repositories/leaveRepository");
const { calculateDays } = require("../utils/leaveCalculator");

module.exports = {
  async applyLeave(userId, { leave_type_id, from_date, to_date, reason }) {
    const p = await pool.query(`SELECT id, manager_id FROM employee_profiles WHERE user_id=$1`, [userId]);
    if (p.rows.length === 0) throw new Error("Complete your profile first");

    const days = calculateDays(from_date, to_date);
    if (days <= 0) throw new Error("Invalid date range");

    const bal = await pool.query(
      `SELECT available_days FROM leave_balance
        WHERE employee_id=$1 AND leave_type_id=$2`,
      [p.rows[0].id, leave_type_id]);
    if (!bal.rows[0] || bal.rows[0].available_days < days) throw new Error("Insufficient leave balance");

    let approverUserId = null;
    if (p.rows[0].manager_id) {
      const m = await pool.query(`SELECT user_id FROM employee_profiles WHERE id=$1`, [p.rows[0].manager_id]);
      approverUserId = m.rows[0]?.user_id;
    }
    const status = approverUserId ? 'pending_manager' : 'pending_hr';
    const leave = await repo.create(p.rows[0].id, leave_type_id, from_date, to_date, days, reason, status, approverUserId);

    if (approverUserId) {
      await pool.query(
        `INSERT INTO notifications(user_id,title,message,type,link)
         VALUES($1,'New Leave Request','An employee applied for leave','info','/leave-approvals')`,
        [approverUserId]);
    } else {
      const hrs = await pool.query(`SELECT id FROM users WHERE role='hr'`);
      for (const h of hrs.rows)
        await pool.query(
          `INSERT INTO notifications(user_id,title,message,type,link)
           VALUES($1,'New Leave Request','An employee applied for leave','info','/leave-approvals')`, [h.id]);
    }
    return leave;
  },

  myLeaves: async (uid) => {
    const p = await pool.query(`SELECT id FROM employee_profiles WHERE user_id=$1`, [uid]);
    return p.rows[0] ? repo.findByEmployee(p.rows[0].id) : [];
  },

  balance: async (uid) => {
    const p = await pool.query(`SELECT id FROM employee_profiles WHERE user_id=$1`, [uid]);
    if (p.rows.length === 0) throw new Error("Profile not found");
    return (await pool.query(`
      SELECT lt.id, lt.id AS leave_type_id, lt.leave_name, lt.total_days, lb.available_days
        FROM leave_types lt
        LEFT JOIN leave_balance lb ON lb.leave_type_id=lt.id AND lb.employee_id=$1
        ORDER BY lt.id`, [p.rows[0].id])).rows;
  },

  pendingManager: async (uid) => {
    const p = await pool.query(`SELECT id FROM employee_profiles WHERE user_id=$1`, [uid]);
    return p.rows[0] ? repo.pendingForManager(p.rows[0].id) : [];
  },

  details: (id) => repo.getDetails(id),
  approveByManager: (id, uid) => repo.approveAtManager(id, uid, "Manager approved"),
  approveByHR:      (id, uid, role) => repo.approveFinal(id, uid, role, "HR final approval"),
  reject:           (id, uid, role, remarks) => repo.reject(id, uid, role, remarks),
  cancel:           (id, uid) => repo.cancel(id, uid),
};
