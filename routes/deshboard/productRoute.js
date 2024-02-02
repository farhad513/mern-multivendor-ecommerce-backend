const productController = require("../../controllers/deshboard/productController");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const router = require("express").Router();
router.post("/product/add", authMiddleware, productController.add_Product);
router.post("/product/update", authMiddleware, productController.updateProduct);
router.post(
  "/product/image/update",
  authMiddleware,
  productController.product_image_update
);
router.get("/products/get", authMiddleware, productController.get_products);
router.get(
  "/product/get/:productId",
  authMiddleware,
  productController.get_product
);
module.exports = router;
