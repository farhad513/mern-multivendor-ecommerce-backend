const { Schema, model } = require("mongoose");

const sellerWalletSchema = new Schema(
  {
    sellerId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("sellerWallets", sellerWalletSchema);
