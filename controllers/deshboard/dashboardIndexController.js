const adminOrder = require("../../models/adminOrder");
const customerOrder = require("../../models/customerOrder");
const myShopWallet = require("../../models/myShopWallet");
const sellerWallet = require("../../models/sellerWallet");
const sellerModel = require("../../models/sellerModel");
const adminSellerMessage = require("../../models/chat/adminSellerMessage");
const sellerCustomerMessage = require("../../models/chat/sellerCustomerMessage");
const productModel = require("../../models/productModel");
const { responseReturn } = require("../../utils/response");
const {
  mongo: { ObjectId },
} = require("mongoose");

class dashboardIndexContoler {
  get_seller_dashboard = async (req, res) => {
    const { id } = req;

    try {
      const totalSale = await sellerWallet.aggregate([
        {
          $match: {
            sellerId: {
              $eq: id,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);
      const totalProudct = await productModel
        .find({
          sellerId: new ObjectId(id),
        })
        .countDocuments();
      const totalOrder = await adminOrder
        .find({
          sellerId: new ObjectId(id),
        })
        .countDocuments();
      const totalPendingOrder = await adminOrder
        .find({
          $and: [
            {
              sellerId: {
                $eq: new ObjectId(id),
              },
            },
            {
              delivery_status: {
                $eq: "pending",
              },
            },
          ],
        })
        .countDocuments();
      const messages = await sellerCustomerMessage
        .find({
          $or: [
            {
              senderId: {
                $eq: id,
              },
            },
            {
              receverId: {
                $eq: id,
              },
            },
          ],
        })
        .limit(3);
      const recentOrders = await adminOrder.find({
        sellerId: new ObjectId(id),
      });
      responseReturn(res, 200, {
        totalOrder,
        totalSale: totalSale.length > 0 ? totalSale[0].totalAmount : 0,
        messages,
        recentOrders,
        totalPendingOrder,
        totalProudct,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  get_admin_dashboard = async (req, res) => {
    const { id } = req;
    try {
      const totalSale = await myShopWallet.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
          },
        },
      ]);
      const totalProudct = await productModel.find({}).countDocuments();
      const totalOrder = await customerOrder.find({}).countDocuments();
      const totalSeller = await sellerModel.find({}).countDocuments();
      const messages = await adminSellerMessage.find({}).limit(3);
      const recentOrders = await customerOrder.find({});

      responseReturn(res, 200, {
        totalOrder,
        totalSale: totalSale.length > 0 ? totalSale[0].totalAmount : 0,
        messages,
        recentOrders,
        totalSeller,
        totalProudct,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
}

module.exports = new dashboardIndexContoler();
