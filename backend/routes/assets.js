// backend/routes/assets.js
const router  = require("express").Router();
const { verifyToken, adminOnly, requireRole } = require("../middleware/auth");
const c = require("../controllers/assetController");

router.use(verifyToken);

// Employee: view their own allocations
router.get("/my",                 c.myAllocations);

// Admin/HR: manage assets
router.get("/types",              c.types);
router.get("/allocations",        requireRole("admin","hr"), c.allocations);
router.post("/allocate",          requireRole("admin","hr"), c.allocate);
router.put("/return/:allocationId", requireRole("admin","hr"), c.returnAsset);

router.get("/",                   c.list);
router.get("/:id",                c.findById);
router.post("/",                  adminOnly, c.create);
router.put("/:id",                adminOnly, c.update);
router.delete("/:id",             adminOnly, c.delete);

module.exports = router;
