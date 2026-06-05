const r = require("../repositories/reportRepository");
module.exports = {
  summary:        () => r.summary(),
  employeeWise:   () => r.employeeWise(),
  departmentWise: () => r.departmentWise(),
  monthlyTrend:   () => r.monthlyTrend(),
  mostAbsent:     () => r.mostAbsent(),
  balance:        () => r.balance(),
  salaryRanking:  () => r.salaryRanking(),
};
