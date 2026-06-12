const pool = require("../config/db");
module.exports = {
  summary: async () => (await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM leave_applications WHERE status='pending_manager') AS pending_manager,
      (SELECT COUNT(*) FROM leave_applications WHERE status='pending_hr') AS pending_hr,
      (SELECT COUNT(*) FROM leave_applications WHERE status='approved') AS approved,
      (SELECT COUNT(*) FROM leave_applications WHERE status='rejected') AS rejected,
      (SELECT COUNT(*) FROM leave_applications) AS total
  `)).rows[0],

  employeeWise: async () => (await pool.query(`
    SELECT u.name AS employee_name, d.department_name,
           COUNT(la.id) FILTER (WHERE la.status='approved') AS approved,
           COUNT(la.id) FILTER (WHERE la.status='rejected') AS rejected,
           COALESCE(SUM(la.total_days) FILTER (WHERE la.status='approved'),0) AS total_days
    FROM employee_profiles e
    JOIN users u ON e.user_id=u.id
    LEFT JOIN departments d ON e.department_id=d.id
    LEFT JOIN leave_applications la ON la.employee_id=e.id
    GROUP BY u.name, d.department_name ORDER BY total_days DESC
  `)).rows,

  departmentWise: async () => (await pool.query(`
    SELECT d.department_name,
           COUNT(la.id) AS total_requests,
           COUNT(la.id) FILTER (WHERE la.status='approved') AS approved,
           COALESCE(SUM(la.total_days) FILTER (WHERE la.status='approved'),0) AS days_taken
    FROM departments d
    LEFT JOIN employee_profiles e ON e.department_id=d.id
    LEFT JOIN leave_applications la ON la.employee_id=e.id
    GROUP BY d.department_name
  `)).rows,

  monthlyTrend: async () => (await pool.query(`
    SELECT TO_CHAR(created_at, 'YYYY-MM') AS month,
           COUNT(*) AS total_requests,
           COUNT(*) FILTER (WHERE status='approved') AS approved,
           COUNT(*) FILTER (WHERE status='rejected') AS rejected
    FROM leave_applications GROUP BY month ORDER BY month
  `)).rows,

  mostAbsent: async () => (await pool.query(`
    SELECT u.name, d.department_name,
           COALESCE(SUM(la.total_days) FILTER (WHERE la.status='approved'),0) AS days_taken
    FROM employee_profiles e
    JOIN users u ON e.user_id=u.id
    LEFT JOIN departments d ON e.department_id=d.id
    LEFT JOIN leave_applications la ON la.employee_id=e.id
    GROUP BY u.name, d.department_name
    ORDER BY days_taken DESC LIMIT 10
  `)).rows,

  balance: async () => (await pool.query(`
    SELECT u.name AS employee_name, lt.leave_name, lb.available_days, lt.total_days
    FROM leave_balance lb
    JOIN employee_profiles e ON lb.employee_id=e.id
    JOIN users u ON e.user_id=u.id
    JOIN leave_types lt ON lb.leave_type_id=lt.id
    ORDER BY u.name, lt.leave_name
  `)).rows,

  salaryRanking: async () => (await pool.query(`
    SELECT u.name, d.department_name, ep.salary,
           RANK() OVER (PARTITION BY d.department_name ORDER BY ep.salary DESC) AS dept_rank,
           DENSE_RANK() OVER (ORDER BY ep.salary DESC) AS overall_rank
    FROM employee_profiles ep
    JOIN users u ON ep.user_id=u.id
    LEFT JOIN departments d ON ep.department_id=d.id
    ORDER BY ep.salary DESC
  `)).rows,
};
