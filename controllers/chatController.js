const sellerModel = require("../models/sellerModel");
const userModel = require("../models/userModel");
const sellerCustomerModel = require("../models/chat/sellerCustomerModel");
const { responseReturn } = require("../utils/response");
const sellerCustomerMessage = require("../models/chat/sellerCustomerMessage");
const adminSellerMessage = require("../models/chat/adminSellerMessage");
class chatController {
  add_user_friend = async (req, res) => {
    const { sellerId, userId } = req.body;
    try {
      if (sellerId !== "") {
        const seller = await sellerModel.findById(sellerId);
        const user = await userModel.findById(userId);
        const checkSeller = await sellerCustomerModel.findOne({
          $and: [
            {
              myId: {
                $eq: userId,
              },
            },
            {
              myFriends: {
                $elemMatch: {
                  fndId: sellerId,
                },
              },
            },
          ],
        });

        if (!checkSeller) {
          await sellerCustomerModel.updateOne(
            {
              myId: userId,
            },
            {
              $push: {
                myFriends: {
                  fndId: sellerId,
                  name: seller.shopInfo.shopName,
                  image: seller.image,
                },
              },
            }
          );
        }
        const checkUser = await sellerCustomerModel.findOne({
          $and: [
            {
              myId: {
                $eq: sellerId,
              },
            },
            {
              myFriends: {
                $elemMatch: {
                  fndId: userId,
                },
              },
            },
          ],
        });
        if (!checkUser) {
          await sellerCustomerModel.updateOne(
            {
              myId: sellerId,
            },
            {
              $push: {
                myFriends: {
                  fndId: userId,
                  name: user.name,
                  image: "",
                },
              },
            }
          );
        }
        const messages = await sellerCustomerMessage.find({
          $or: [
            {
              $and: [
                {
                  receverId: { $eq: sellerId },
                },
                {
                  senderId: { $eq: userId },
                },
              ],
            },
            {
              $and: [
                {
                  receverId: { $eq: userId },
                },
                {
                  senderId: { $eq: sellerId },
                },
              ],
            },
          ],
        });
        const MyFriends = await sellerCustomerModel.findOne({ myId: userId });
        const currentSeller = MyFriends.myFriends.find(
          (s) => s.fndId === sellerId
        );
        responseReturn(res, 200, {
          myFriends: MyFriends.myFriends,
          currentSeller,
          messages,
        });
      } else {
        const MyFriends = await sellerCustomerModel.findOne({ myId: userId });
        responseReturn(res, 200, { myFriends: MyFriends.myFriends });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  send_message = async (req, res) => {
    const { userId, sellerId, text, name } = req.body;
    try {
      const message = await sellerCustomerMessage.create({
        senderId: userId,
        senderName: name,
        receverId: sellerId,
        message: text,
      });
      const data = await sellerCustomerModel.findOne({ myId: userId });
      let myFriends = data.myFriends;
      let index = myFriends.findIndex((f) => f.fndId === sellerId);
      while (index > 0) {
        let temp = myFriends[index];
        myFriends[index] = myFriends[index - 1];
        myFriends[index - 1] = temp;
        index--;
      }
      await sellerCustomerModel.updateOne(
        {
          myId: userId,
        },
        {
          myFriends,
        }
      );
      const data1 = await sellerCustomerModel.findOne({ myId: sellerId });
      let myFriends1 = data1.myFriends;
      let index1 = myFriends1.findIndex((f) => f.fndId === userId);
      while (index1 > 0) {
        let temp = myFriends1[index1];
        myFriends1[index] = myFriends1[index1 - 1];
        myFriends1[index1 - 1] = temp;
        index1--;
      }
      await sellerCustomerModel.updateOne(
        {
          myId: sellerId,
        },
        {
          myFriends1,
        }
      );
      responseReturn(res, 200, { message });
    } catch (error) {
      console.log(error.message);
    }
  };
  get_customers = async (req, res) => {
    const { sellerId } = req.params;
    try {
      const data = await sellerCustomerModel.findOne({ myId: sellerId });
      responseReturn(res, 200, { customers: data.myFriends });
    } catch (error) {
      console.log(error.message);
    }
  };

  get_customer_message = async (req, res) => {
    const { customerId } = req.params;
    const { id } = req;
    try {
      const messages = await sellerCustomerMessage.find({
        $or: [
          {
            $and: [
              {
                receverId: { $eq: customerId },
              },
              {
                senderId: { $eq: id },
              },
            ],
          },
          {
            $and: [
              {
                receverId: { $eq: id },
              },
              {
                senderId: { $eq: customerId },
              },
            ],
          },
        ],
      });
      const currentCustomer = await userModel.findById(customerId);
      responseReturn(res, 200, { messages, currentCustomer });
    } catch (error) {
      console.log(error.message);
    }
  };
  seller_message_add = async (req, res) => {
    const { senderId, receverId, text, name } = req.body;
    try {
      const message = await sellerCustomerMessage.create({
        senderId,
        receverId,
        senderName: name,
        message: text,
      });
      const data = await sellerCustomerModel.findOne({ myId: senderId });
      let myFriends = data.myFriends;
      let index = myFriends.findIndex((f) => f.fndId === receverId);
      while (index > 0) {
        let temp = myFriends[index];
        myFriends[index] = myFriends[index - 1];
        myFriends[index - 1] = temp;
        index--;
      }
      await sellerCustomerModel.updateOne(
        {
          myId: senderId,
        },
        {
          myFriends,
        }
      );
      const data1 = await sellerCustomerModel.findOne({ myId: receverId });
      let myFriends1 = data1.myFriends;
      let index1 = myFriends1.findIndex((f) => f.fndId === senderId);
      while (index1 > 0) {
        let temp = myFriends1[index1];
        myFriends1[index] = myFriends1[index1 - 1];
        myFriends1[index1 - 1] = temp;
        index1--;
      }
      await sellerCustomerModel.updateOne(
        {
          myId: receverId,
        },
        {
          myFriends1,
        }
      );
      responseReturn(res, 200, { message });
    } catch (error) {
      console.log(error.message);
    }
  };
  get_sellers = async (req, res) => {
    try {
      const sellers = await sellerModel.find({});
      responseReturn(res, 200, { sellers });
    } catch (error) {
      console.log(error.message);
    }
  };
  seller_admin_message = async (req, res) => {
    const { senderName, senderId, receverId, message } = req.body;
    try {
      const messages = await adminSellerMessage.create({
        senderId,
        receverId,
        message,
        senderName,
      });
      responseReturn(res, 200, { messages });
    } catch (error) {
      console.log(error.message);
    }
  };
  get_admin_message = async (req, res) => {
    const { receverId } = req.params;
    const id = "";
    try {
      const messages = await adminSellerMessage.find({
        $or: [
          {
            $and: [
              {
                receverId: { $eq: receverId },
              },
              {
                senderId: { $eq: id },
              },
            ],
          },
          {
            $and: [
              {
                receverId: { $eq: id },
              },
              {
                senderId: { $eq: receverId },
              },
            ],
          },
        ],
      });
      let currentSeller = {};
      if (receverId) {
        currentSeller = await sellerModel.findById(receverId);
      }
      responseReturn(res, 200, { messages, currentSeller });
      // console.log(messages, currentSeller);
    } catch (error) {
      console.log(error.message);
    }
  };
  get_seller_message = async (req, res) => {
    const receverId = "";
    const { id } = req;
    try {
      const messages = await adminSellerMessage.find({
        $or: [
          {
            $and: [
              {
                receverId: { $eq: receverId },
              },
              {
                senderId: { $eq: id },
              },
            ],
          },
          {
            $and: [
              {
                receverId: { $eq: id },
              },
              {
                senderId: { $eq: receverId },
              },
            ],
          },
        ],
      });

      responseReturn(res, 200, { messages });
    } catch (error) {
      console.log(error.message);
    }
  };
}
module.exports = new chatController();
