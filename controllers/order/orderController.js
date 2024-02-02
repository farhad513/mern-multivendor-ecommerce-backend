const adminOrder = require("../../models/adminOrder");
const customerOrder = require("../../models/customerOrder");
const cardModel = require("../../models/cardModel");
const sellerWallet = require("../../models/sellerWallet");
const myShopWallet = require("../../models/myShopWallet");
const moment = require("moment");
const stripe = require("stripe")(
  "sk_test_51JQxiOBeUmTFUfodK6zgh8Lh5rwnbilJObcmEw6otfOVZoX6TJPocF3O0mx5MVPv9hd19Ca57vkS7eI2SFMrceb4000bbhxyP3"
);
const {
  mongo: { ObjectId },
} = require("mongoose");
const { responseReturn } = require("../../utils/response");
class orderController {
  payment_check = async (id) => {
    try {
      const order = await customerOrder.findById(id);
      if (order.payment_status === "unpaid") {
        await customerOrder.findByIdAndUpdate(id, {
          delivery_status: "cancelled",
        });
        await adminOrder.updateMany(
          {
            orderId: id,
          },
          {
            delivery_status: "cancelled",
          }
        );
      }
      return true;
    } catch (error) {
      console.log(error);
    }
  };

  place_order = async (req, res) => {
    const { price, products, shipping_fee, shippingInfo, userId } = req.body;
    let adminOrderData = [];
    let cardId = [];
    const tempDate = moment(Date.now()).format("LLL");
    // console.log(tempDate);
    let customerOrderProduct = [];
    for (let i = 0; i < products.length; i++) {
      const pro = products[i].products;
      for (let j = 0; j < pro.length; j++) {
        let tempCustomerProduct = pro[j].productInfo;
        tempCustomerProduct.quantity = pro[j].quantity;
        customerOrderProduct.push(tempCustomerProduct);
        if (pro[j]._id) {
          cardId.push(pro[j]._id);
        }
      }
    }
    // console.log(cardId);
    try {
      const order = await customerOrder.create({
        userId,
        shippingInfo,
        price: price + shipping_fee,
        products: customerOrderProduct,
        delivery_status: "pending",
        payment_status: "unpaid",
        date: tempDate,
      });
      for (let i = 0; i < products.length; i++) {
        const product = products[i].products;
        const pri = products[i].price;
        const sellerId = products[i].sellerId;
        let storeProduct = [];
        for (let j = 0; j < product.length; j++) {
          let tempro = product[j].productInfo;
          tempro.quantity = product[j].quantity;
          storeProduct.push(tempro);
        }
        adminOrderData.push({
          orderId: order.id,
          sellerId,
          products: storeProduct,
          price: pri,
          payment_status: "unpaid",
          shippingInfo: "Chatkhil Noakhali",
          delivery_status: "pending",
          date: tempDate,
        });
      }
      //   console.log(adminOrderData);
      await adminOrder.insertMany(adminOrderData);
      for (let k = 0; k < cardId.length; k++) {
        await cardModel.findByIdAndDelete(cardId[k]);
      }
      setTimeout(() => {
        this.payment_check(order.id);
      }, 15000);
      responseReturn(res, 200, {
        message: "Order completed successfully",
        order,
        orderId: order.id,
      });
    } catch (error) {
      console.log(error);
    }
    // console.log(customerOrderProduct)
  };
  get_order = async (req, res) => {
    const { userId, status } = req.params;
    try {
      let orders = [];
      if (status !== "all") {
        orders = await customerOrder.find({
          userId: new ObjectId(userId),
          delivery_status: status,
        });
      } else {
        orders = await customerOrder.find({
          userId: new ObjectId(userId),
        });
      }
      responseReturn(res, 200, { orders });
    } catch (error) {
      console.log(error.message);
    }
    // console.log();
  };
  get_order_details = async (req, res) => {
    const { orderId } = req.params;
    try {
      const order = await customerOrder.findById(orderId);
      responseReturn(res, 200, { order });
    } catch (error) {
      console.log(error.message);
    }
  };
  // all admin orders

  get_admin_orders = async (req, res) => {
    let { page, searchValue, perPage } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);
    const skipPage = perPage * (page - 1);
    try {
      if (searchValue) {
      } else {
        const orders = await customerOrder
          .aggregate([
            {
              $lookup: {
                from: "authororders",
                localField: "_id",
                foreignField: "orderId",
                as: "subOrder",
              },
            },
          ])
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalOrder = await customerOrder.aggregate([
          {
            $lookup: {
              from: "authororders",
              localField: "_id",
              foreignField: "orderId",
              as: "subOrder",
            },
          },
        ]);

        responseReturn(res, 200, { orders, totalOrder: totalOrder.length });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  get_admin_order = async (req, res) => {
    const { orderId } = req.params;
    try {
      const order = await customerOrder.aggregate([
        {
          $match: { _id: new ObjectId(orderId) },
        },
        {
          $lookup: {
            from: "authororders",
            localField: "_id",
            foreignField: "orderId",
            as: "subOrder",
          },
        },
      ]);
      responseReturn(res, 200, { order: order[0] });
    } catch (error) {
      console.log(error.message);
    }
  };
  admin_order_status_update = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
      await customerOrder.findByIdAndUpdate(orderId, {
        delivery_status: status,
      });
      responseReturn(res, 200, { message: "Admin Order Status Update" });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal Server Error" });
      // console.log(error.message);
    }
  };
  get_seller_orders = async (req, res) => {
    const { sellerId } = req.params;
    let { page, searchValue, perPage } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);
    const skipPage = perPage * (page - 1);
    try {
      if (searchValue) {
      } else {
        const order = await adminOrder
          .find({
            sellerId,
          })
          .skip(skipPage)
          .limit(skipPage)
          .sort({ createdAt: -1 });
        const totalOrder = await adminOrder
          .find({
            sellerId,
          })
          .countDocuments();
        console.log(order);
        responseReturn(res, 200, { order, totalOrder });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  get_seller_order = async (req, res) => {
    const { orderId } = req.params;
    try {
      const order = await adminOrder.findById(orderId);
      responseReturn(res, 200, { order });
    } catch (error) {
      console.log(error.message);
    }
  };
  seller_order_status_update = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
      await adminOrder.findByIdAndUpdate(orderId, {
        delivery_status: status,
      });
      responseReturn(res, 200, { message: "Seller Order Status Update" });
    } catch (error) {
      responseReturn(res, 500, { error: "Internal Server Error" });
      // console.log(error.message);
    }
  };
  create_payment = async (req, res) => {
    const { price } = req.body;
    try {
      const payment = await stripe.paymentIntents.create({
        amount: price * 100,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      responseReturn(res, 200, { clientSecret: payment.client_secret });
    } catch (error) {
      console.log(error.message);
    }
  };
  confirm_order = async (req, res) => {
    const { orderId } = req.params;
    try {
      await customerOrder.findByIdAndUpdate(orderId, {
        payment_status: "paid",
        delivery_status: "pending",
      });
      await adminOrder.updateMany(
        { orderId: new ObjectId(orderId) },
        {
          payment_status: "paid",
          delivery_status: "pending",
        }
      );
      const cusOrder = await customerOrder.findById(orderId);
      const auOrder = await adminOrder.find({ orderId: new ObjectId(orderId) });
      const time = moment(Date.now()).format("l");
      const splitTime = time.split("/");
      await myShopWallet.create({
        amount: cusOrder.price,
        month: splitTime[0],
        year: splitTime[2],
      });
      // console.log(auOrder);
      for (let i = 0; i < auOrder.length; i++) {
        await sellerWallet.create({
          sellerId: auOrder[i].sellerId,
          amount: auOrder[i].price,
          month: splitTime[0],
          year: splitTime[2],
        });
        // console.log(auOrder);
      }
      responseReturn(res, 200, { message: "Success" });
    } catch (error) {
      console.log(error.message);
    }
  };
}

module.exports = new orderController();
