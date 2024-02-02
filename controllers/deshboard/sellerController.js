const sellerModel = require("../../models/sellerModel");
const { responseReturn } = require("../../utils/response");
class sellerController {
  seller_get_request = async (req, res) => {
    const { page, searchValue, perPage } = req.query;
    const skipPage = parseInt(perPage) * (parseInt(page) - 1);
    try {
      if (searchValue) {
      } else {
        const sellers = await sellerModel
          .find({ status: "pending" })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalSeller = await sellerModel
          .find({ status: "pending" })
          .countDocuments();
        responseReturn(res, 201, { totalSeller, sellers });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  //Get  seller
  get_seller = async (req, res) => {
    const { sellerId } = req.params;
    try {
      const seller = await sellerModel.findById(sellerId);
      responseReturn(res, 201, { seller });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  //Get all sellers
  get_sellers = async (req, res) => {
    let { page, searchValue, perPage } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);
    const skipPage = perPage * (page - 1);
    try {
      if (searchValue) {
        const sellers = await sellerModel
          .find({
            $text: { $search: searchValue },
            status: "active",
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalSeller = await sellerModel
          .find({
            $text: { $search: searchValue },
            status: "active",
          })
          .countDocuments();
        responseReturn(res, 200, { sellers, totalSeller });
      } else {
        const sellers = await sellerModel.find({ status: "active" });
        const totalSeller = await sellerModel
          .find({
            status: "active",
          })
          .countDocuments();
        responseReturn(res, 200, { sellers, totalSeller });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  get_deactive_seller = async (req, res) => {
    let { page, searchValue, perPage } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);
    const skipPage = perPage * (page - 1);
    try {
      if (searchValue) {
        const sellers = await sellerModel
          .find({
            $text: { $search: searchValue },
            status: "deactive",
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalSeller = await sellerModel
          .find({
            $text: { $search: searchValue },
            status: "deactive",
          })
          .countDocuments();
        responseReturn(res, 200, { sellers, totalSeller });
      } else {
        const sellers = await sellerModel.find({ status: "deactive" });
        const totalSeller = await sellerModel
          .find({
            status: "deactive",
          })
          .countDocuments();
        responseReturn(res, 200, { sellers, totalSeller });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  // seller Status Update

  seller_status_update = async (req, res) => {
    console.log(req.body);
    const { sellerId, status } = req.body;
    try {
      await sellerModel.findByIdAndUpdate(sellerId, {
        status,
      });
      const seller = await sellerModel.findById(sellerId);
      responseReturn(res, 201, { seller, message: "Seller Status Update " });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
}
module.exports = new sellerController();
