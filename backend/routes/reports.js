const router = require("express").Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const c = require("../controllers/reportController");

router.use(verifyToken);
router.get("/summary",requireRole("admin","hr","manager"), c.summary);
router.get("/employee-wise",requireRole("admin","hr"), c.employeeWise);
router.get("/department-wise",requireRole("admin","hr"), c.departmentWise);
router.get("/monthly-trend",requireRole("admin","hr"), c.monthlyTrend);
router.get("/most-absent",requireRole("admin","hr"), c.mostAbsent);
router.get("/balance",requireRole("admin","hr"), c.balance);
router.get("/salary-ranking",requireRole("admin","hr"), c.salaryRanking);

module.exports = router;
