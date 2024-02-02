const { Schema, model } = require("mongoose");

const bannerSchema = new Schema(
  {
    productId: {
      type: Schema.ObjectId,
      required: true,
    },

    link: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = model("banner", bannerSchema);
