const bannerController = require("../controllers/bannerController");
const chatController = require("../controllers/chatController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = require("express").Router();

router.post("/banner/add", bannerController.addBanner);

router.get("/banner/get/:productId", bannerController.getbanner);

router.get("/banners", bannerController.getbanners);

router.put("/banner/update/:bannerId", bannerController.updateBanner);

module.exports = router;
