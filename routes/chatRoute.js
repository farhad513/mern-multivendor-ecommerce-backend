const chatController = require("../controllers/chatController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = require("express").Router();

router.post("/chat/user/add-user-friend", chatController.add_user_friend);
router.post("/chat/user/send_message_seller", chatController.send_message);
router.get(
  "/chat/seller/get_customers/:sellerId",
  chatController.get_customers
);
router.get(
  "/chat/seller/get_customer_message/:customerId",
  authMiddleware,
  chatController.get_customer_message
);
router.get(
  "/chat/admin/get_sellers",
  authMiddleware,
  chatController.get_sellers
);
router.post(
  "/chat/seller/send_message_to_customer",
  authMiddleware,
  chatController.seller_message_add
);

router.post(
  "/chat/send_message_seller_admin",
  authMiddleware,
  chatController.seller_admin_message
);

router.get(
  "/chat/get_admin_messages/:receverId",
  authMiddleware,
  chatController.get_admin_message
);
router.get(
  "/chat/get_seller_messages",
  authMiddleware,
  chatController.get_seller_message
);

module.exports = router;
