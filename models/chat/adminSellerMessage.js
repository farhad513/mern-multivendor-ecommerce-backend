const { Schema, model } = require("mongoose");

const adminSellerSchema = new Schema(
  {
    senderName: {
      type: String,
      required: true,
    },
    senderId: {
      type: String,
      // required: true,
      default: "",
    },
    receverId: {
      type: String,
      // required: true,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "unseen",
    },
  },
  { timestamps: true }
);

module.exports = model("seller_admin_messages", adminSellerSchema);
