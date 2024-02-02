const categoryController = require("../../controllers/deshboard/categoryController");
const { authMiddleware } = require("../../middlewares/authMiddleware");
const router = require("express").Router();
router.post("/category/add", authMiddleware, categoryController.categoryAdd);
router.get("/category/get", authMiddleware, categoryController.get_category);
module.exports = router;
