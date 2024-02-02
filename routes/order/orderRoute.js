const router = require("express").Router();
const orderController = require("../../controllers/order/orderController");
// User routes
router.post("/home/order/place-order", orderController.place_order);
router.get("/home/order/get-orders/:userId/:status", orderController.get_order);
router.get(
  "/home/order/get-order/details/:orderId",
  orderController.get_order_details
);
router.post("/order/create/payment", orderController.create_payment);
router.get("/order/confirm/:orderId", orderController.confirm_order);
// admin routes
router.get("/admin/get-orders", orderController.get_admin_orders);
router.get("/admin/order/:orderId", orderController.get_admin_order);
router.put(
  "/admin/order-status-update/:orderId",
  orderController.admin_order_status_update
);

// seller Routes

router.get("/seller/get-orders/:sellerId", orderController.get_seller_orders);
router.get("/seller/order/:orderId", orderController.get_seller_order);
router.put(
  "/seller/order-status-update/:orderId",
  orderController.seller_order_status_update
);
module.exports = router;
