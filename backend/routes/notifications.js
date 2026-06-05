const router = require("express").Router();
const { verifyToken } = require("../middleware/auth");
const c = require("../controllers/notificationController");

router.use(verifyToken);
router.get("/",         c.list);
router.get("/unread",   c.unread);
router.put("/:id/read", c.markOne);
router.put("/read-all", c.markAll);

module.exports = router;
