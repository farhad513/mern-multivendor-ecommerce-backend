const sellerController = require("../../controllers/deshboard/sellerController");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const router = require("express").Router();
router.get(
  "/seller/get/request",
  authMiddleware,
  sellerController.seller_get_request
);
router.get(
  "/get/seller/:sellerId",
  authMiddleware,
  sellerController.get_seller
);

router.get("/get/sellers", authMiddleware, sellerController.get_sellers);

router.get(
  "/get/deactive-seller",
  authMiddleware,
  sellerController.get_deactive_seller
);
router.post(
  "/seller/status/update",
  authMiddleware,
  sellerController.seller_status_update
);

module.exports = router;
