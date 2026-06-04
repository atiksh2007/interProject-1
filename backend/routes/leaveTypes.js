const router = require("express").Router();
const { verifyToken, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const schemas = require("../utils/validators");
const c = require("../controllers/leaveTypeController");

router.use(verifyToken);
router.get("/",         c.list);
router.post("/",        adminOnly, validate(schemas.leaveType), c.create);
router.put("/:id",      adminOnly, validate(schemas.leaveType), c.update);
router.delete("/:id",   adminOnly, c.remove);

module.exports = router;
