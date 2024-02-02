const dashboardIndexController = require("../../controllers/deshboard/dashboardIndexController");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const router = require("express").Router();
router.get(
  "/seller/get-seller-dasboard-data",
  authMiddleware,
  dashboardIndexController.get_seller_dashboard
);
router.get(
  "/admin/get-admin-dasboard-data",
  authMiddleware,
  dashboardIndexController.get_admin_dashboard
);
module.exports = router;
