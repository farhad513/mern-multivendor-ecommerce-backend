const authController = require("../../controllers/home/authController");

const router = require("express").Router();
router.post("/user/register", authController.register_user);
router.post("/user/login", authController.login_user);
router.post("/user/logout", authController.user_logout);

module.exports = router;
