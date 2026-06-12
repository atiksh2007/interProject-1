// backend/routes/assets.js
const router  = require("express").Router();
const { verifyToken, adminOnly, requireRole } = require("../middleware/auth");
const c = require("../controllers/assetController");
const pool = require("../config/db");

router.use(verifyToken);

// Middleware to check if user has permission to view the requested allocations
const canViewAllocations = async (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "hr") {
    return next();
  }
  if (req.query.employee_id) {
    try {
      const ep = await pool.query("SELECT id FROM employee_profiles WHERE user_id=$1", [req.user.id]);
      if (ep.rows[0] && ep.rows[0].id === parseInt(req.query.employee_id)) {
        return next();
      }
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
  return res.status(403).json({ message: "Forbidden: insufficient role" });
};

// Employee: view their own allocations
router.get("/my",                 c.myAllocations);

// Admin/HR: manage assets
router.get("/types",              c.types);
router.get("/allocations",        canViewAllocations, c.allocations);
router.post("/allocate",          requireRole("admin","hr"), c.allocate);
router.put("/return/:allocationId", requireRole("admin","hr"), c.returnAsset);

router.get("/",                   c.list);
router.get("/:id",                c.findById);
router.post("/",                  adminOnly, c.create);
router.put("/:id",                adminOnly, c.update);
router.delete("/:id",             adminOnly, c.delete);

module.exports = router;
