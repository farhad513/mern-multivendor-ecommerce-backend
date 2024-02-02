const dashboardController = require("../../../controllers/home/dashboardController");
const router = require("express").Router();
router.get(
  "/dashboard/get-dashboard-data/:userId",
  dashboardController.get_dasboard_data
);
module.exports = router;
