const router = require("express").Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");
const schemas = require("../utils/validators");
const c = require("../controllers/leaveController");

router.use(verifyToken);

// Leave types
router.get("/types", c.types);

// Employee routes
router.post("/apply", validate(schemas.applyLeave), c.apply);
router.get("/my", c.myLeaves);
router.get("/balance", c.balance);

// Manager / HR routes
router.get("/pending/manager", requireRole("manager", "admin"), c.pendingManager);
router.get("/pending/hr", requireRole("hr", "admin"), c.pendingHR);

// Leave actions
router.put("/:id/approve",
  requireRole("manager", "hr", "admin"),
  validate(schemas.approveLeave),
  c.approve
);

router.put("/:id/reject",
  requireRole("manager", "hr", "admin"),
  validate(schemas.approveLeave),
  c.reject
);

router.put("/:id/cancel", c.cancel);

// Keep this LAST so it doesn't catch routes like /types
router.get("/:id", c.details);

module.exports = router;