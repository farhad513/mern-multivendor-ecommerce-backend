const cartController = require("../../controllers/home/cartController");

const router = require("express").Router();

router.post("/home/product/card/add", cartController.add_Card);
router.get(
  "/home/product/get/card/products/:userId",
  cartController.get_card_products
);
router.delete(
  "/home/product/delete/card/:card_id",
  cartController.delete_card_product
);
router.put(
  "/home/product/quantity-increment/:card_id",
  cartController.increment_quantity
);
router.put(
  "/home/product/quantity-decrement/:card_id",
  cartController.decrement_quantity
);

router.post("/home/product/wishlist/add", cartController.add_wishlist);
router.get(
  "/home/get-wishlist-products/:userId",
  cartController.get_wishlist_products
);
router.delete(
  "/home/product/delete/wishlist/:wishlistId",
  cartController.delete_wishlist_product
);
module.exports = router;
