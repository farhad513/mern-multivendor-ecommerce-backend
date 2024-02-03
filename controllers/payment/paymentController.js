const stripeModel = require("../../models/stripeModel");
const myShopWallet = require("../../models/myShopWallet");
const sellerWallet = require("../../models/sellerWallet");
const widthrawRequest = require("../../models/widthrawRequest");
const {
  mongo: { ObjectId },
} = require("mongoose");
const sellerModel = require("../../models/sellerModel");
const { responseReturn } = require("../../utils/response");
const { v4: uuidv4 } = require("uuid");

const stripe = require("stripe")(
  "sk_test_51JQxiOBeUmTFUfodK6zgh8Lh5rwnbilJObcmEw6otfOVZoX6TJPocF3O0mx5MVPv9hd19Ca57vkS7eI2SFMrceb4000bbhxyP3"
);
class paymentController {
  create_stripe_account = async (req, res) => {
    const { id } = req;
    const uid = uuidv4();
    try {
      const stripeInfo = await stripeModel.findOne({ sellerId: id });
      if (stripeInfo) {
        await stripeModel.deleteOne({ sellerId: id });
        const account = await stripe.accounts.create({ type: "express" });
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.client_admin_pro_url}/refresh`,
          return_url: `${process.env.client_admin_pro_url}/success?activeCode=${uid}`,
          type: "account_onboarding",
        });
        await stripeModel.create({
          sellerId: id,
          stripeId: account.id,
          code: uid,
        });
        responseReturn(res, 200, { url: accountLink.url });
      } else {
        const account = await stripe.accounts.create({ type: "express" });
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.client_admin_pro_url}/refresh`,
          return_url: `${process.env.client_admin_pro_url}/success?activeCode=${uid}`,
          type: "account_onboarding",
        });
        await stripeModel.create({
          sellerId: id,
          stripeId: account.id,
          code: uid,
        });
        responseReturn(res, 200, { url: accountLink.url });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  active_stripe_account = async (req, res) => {
    const { activeCode } = req.params;
    const { id } = req;
    try {
      const userStripeInfo = await stripeModel.findOne({
        code: activeCode,
      });
      if (userStripeInfo) {
        await sellerModel.findByIdAndUpdate(id, {
          payment: "active",
        });

        responseReturn(res, 200, { message: "Payment active success" });
      } else {
        responseReturn(res, 500, { error: "Payment active failed" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };
  sumAmount = (data) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum = sum + data[i].amount;
    }
    return sum;
  };
  seller_payment_details = async (req, res) => {
    const { sellerId } = req.params;
    try {
      const payments = await sellerWallet.find({ sellerId });
      const pendingWidthraw = await widthrawRequest.find({
        $and: [
          {
            sellerId: {
              $eq: sellerId,
            },
          },
          {
            status: {
              $eq: "pending",
            },
          },
        ],
      });
      const successWidthraw = await widthrawRequest.find({
        $and: [
          {
            sellerId: {
              $eq: sellerId,
            },
          },
          {
            status: {
              $eq: "success",
            },
          },
        ],
      });
      const pendingAmount = this.sumAmount(pendingWidthraw);
      const widthrawAmount = this.sumAmount(successWidthraw);
      const totalAmount = this.sumAmount(payments);
      let availableAmount = 0;
      if (totalAmount > 0) {
        availableAmount = totalAmount - (pendingAmount + widthrawAmount);
      }
      responseReturn(res, 200, {
        totalAmount,
        pendingAmount,
        widthrawAmount,
        availableAmount,
        successWidthraw,
        pendingWidthraw,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  send_widthraw_request = async (req, res) => {
    const { sellerId, amount } = req.body;
    try {
      const widthraw = await widthrawRequest.create({
        sellerId,
        amount: parseInt(amount),
      });
      // console.log(widthraw);
      responseReturn(res, 200, {
        message: "widthraw message success",
        widthraw,
      });
    } catch (error) {
      responseReturn(res, 500, { message: "Internal Server Error" });
    }
  };
  get_payment_request = async (req, res) => {
    try {
      const widthrawRe = await widthrawRequest.find({ status: "pending" });
      responseReturn(res, 200, { widthrawRequest: widthrawRe });
    } catch (error) {
      responseReturn(res, 500, { message: "Internal Server Error" });
    }
  };
  confirm_payment_request = async (req, res) => {
    const { paymentId } = req.body;
    try {
      const payment = await widthrawRequest.findById(paymentId);
      const { stripeId } = await stripeModel.findOne({
        sellerId: new ObjectId(payment.sellerId),
      });
      await stripe.transfers.create({
        amount: payment.amount * 100,
        currency: "usd",
        destination: stripeId,
      });
      await widthrawRequest.findByIdAndUpdate(paymentId, { status: "success" });
      responseReturn(res, 200, { payment, message: "request confirm success" });
    } catch (error) {
      console.log(error);
      responseReturn(res, 500, { message: "Internal Server Error" });
    }
  };
}

module.exports = new paymentController();
