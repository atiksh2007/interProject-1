const svc = require("../services/reportService");
const wrap = (fn) => async (req, res) => { try { res.json(await fn()); } catch (e) { res.status(500).json({ message: e.message }); } };
module.exports = {
  summary:        wrap(svc.summary),
  employeeWise:   wrap(svc.employeeWise),
  departmentWise: wrap(svc.departmentWise),
  monthlyTrend:   wrap(svc.monthlyTrend),
  mostAbsent:     wrap(svc.mostAbsent),
  balance:        wrap(svc.balance),
  salaryRanking:  wrap(svc.salaryRanking),
};
