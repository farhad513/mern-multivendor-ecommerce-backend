const authControllers = require("../controllers/authControllers");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = require("express").Router();
router.post("/admin/login", authControllers.admin_login);
router.post("/seller/login", authControllers.seller_login);
router.post("/seller/register", authControllers.seller_register);
router.post(
  "/profile/info/add",
  authMiddleware,
  authControllers.profile_add_info
);
router.post(
  "/profile/image/upload",
  authMiddleware,
  authControllers.profile_image_upload
);
router.get("/get-user", authMiddleware, authControllers.getUser);

router.get("/logout", authControllers.logout);
module.exports = router;
