const customerOrder = require("../../models/customerOrder");
const adminOrder = require("../../models/adminOrder");
const { responseReturn } = require("../../utils/response");
const {
  mongo: { ObjectId },
} = require("mongoose");
class dashboardController {
  get_dasboard_data = async (req, res) => {
    const { userId } = req.params;
    try {
      const recentOrders = await customerOrder
        .find({
          userId: new ObjectId(userId),
        })
        .limit(5);
      const pendingOrder = await customerOrder
        .find({
          userId: new ObjectId(userId),
          delivery_status: "pending",
        })
        .countDocuments();
      const totalOrder = await customerOrder
        .find({
          userId: new ObjectId(userId),
        })
        .countDocuments();
      const cancelledOrder = await customerOrder
        .find({
          userId: new ObjectId(userId),
          delivery_status: "cancelled",
        })
        .countDocuments();
      responseReturn(res, 200, {
        recentOrders,
        cancelledOrder,
        totalOrder,
        pendingOrder,
      });
    } catch (error) {
      console.log(error);
    }
  };
}
module.exports = new dashboardController();
