const paymentController = require("../controllers/payment/paymentController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = require("express").Router();
router.get(
  "/payment/create-stipe-account",
  authMiddleware,
  paymentController.create_stripe_account
);
router.put(
  "/payment/active-stipe-account/:activeCode",
  authMiddleware,
  paymentController.active_stripe_account
);
router.get(
  "/payment/seller-payment-details/:sellerId",
  authMiddleware,
  paymentController.seller_payment_details
);
router.post(
  "/payment/send-widthraw-request",
  authMiddleware,
  paymentController.send_widthraw_request
);

router.get(
  "/payment/get-admin-payment-request",
  authMiddleware,
  paymentController.get_payment_request
);

router.post(
  "/payment/confirm_payment_request",
  authMiddleware,
  paymentController.confirm_payment_request
);
module.exports = router;
