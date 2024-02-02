const cardModel = require("../../models/cardModel");
const wishlistModel = require("../../models/wishlistModel");
const { responseReturn } = require("../../utils/response");
const {
  mongo: { ObjectId },
} = require("mongoose");
class cartController {
  add_Card = async (req, res) => {
    const { productId, userId, quantity } = req.body;
    try {
      const product = await cardModel.findOne({
        $and: [
          {
            productId: {
              $eq: productId,
            },
          },
          {
            userId: {
              $eq: userId,
            },
          },
        ],
      });
      if (product) {
        responseReturn(res, 404, { error: "Product already add to Cart" });
      } else {
        const product = await cardModel.create({
          productId,
          userId,
          quantity,
        });
        responseReturn(res, 201, {
          message: "Product add to Cart Success",
          product,
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  get_card_products = async (req, res) => {
    const adminCom = 5;
    const { userId } = req.params;
    try {
      const card_products = await cardModel.aggregate([
        {
          $match: {
            userId: {
              $eq: new ObjectId(userId),
            },
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "products",
          },
        },
      ]);
      let calculatePrice = 0;
      let card_product_count = 0;
      let buy_product_item = 0;
      const outOfStock = card_products.filter(
        (p) => p.products[0].stock < p.quantity
      );
      for (let i = 0; i < outOfStock.length; i++) {
        card_product_count = card_product_count + outOfStock[i].quantity;
      }
      const stockProduct = card_products.filter(
        (p) => p.products[0].stock >= p.quantity
      );
      for (let i = 0; i < stockProduct.length; i++) {
        const { quantity } = stockProduct[i];
        card_product_count = card_product_count + quantity;
        buy_product_item = buy_product_item + quantity;
        const { price, discount } = stockProduct[i].products[0];
        if (discount !== 0) {
          calculatePrice =
            calculatePrice +
            quantity * (price - Math.floor(price * discount) / 100);
        } else {
          calculatePrice = calculatePrice + quantity * price;
        }
      }
      let p = [];
      let uniqueSeller = [
        ...new Set(stockProduct.map((p) => p.products[0].sellerId.toString())),
      ];

      for (let i = 0; i < uniqueSeller.length; i++) {
        let price = 0;
        for (let j = 0; j < stockProduct.length; j++) {
          const tempProduct = stockProduct[j].products[0];
          if (uniqueSeller[i] === tempProduct.sellerId.toString()) {
            let pr = 0;
            if (tempProduct.discount !== 0) {
              pr =
                tempProduct.price -
                Math.floor((tempProduct.price * tempProduct.discount) / 100);
            } else {
              pr = tempProduct.price;
            }
            pr = pr - Math.floor((pr * adminCom) / 100);
            price = price + pr * stockProduct[j].quantity;
            p[i] = {
              sellerId: uniqueSeller[i],
              shopName: tempProduct.shopName,
              price,
              products: p[i]
                ? [
                    ...p[i].products,
                    {
                      _id: stockProduct[j]._id,
                      quantity: stockProduct[j].quantity,
                      productInfo: tempProduct,
                    },
                  ]
                : [
                    {
                      _id: stockProduct[j]._id,
                      quantity: stockProduct[j].quantity,
                      productInfo: tempProduct,
                    },
                  ],
            };
          }
        }
      }
      // console.log(p.products);
      responseReturn(res, 201, {
        card_products: p,
        price: calculatePrice,
        card_product_count,
        shipping_fee: 85 * p.length,
        outOfStock,
        buy_product_item,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  delete_card_product = async (req, res) => {
    const { card_id } = req.params;
    try {
      await cardModel.findByIdAndDelete(card_id);
      responseReturn(res, 200, { message: "Card Product deleted Success" });
    } catch (error) {
      console.log(error.message);
    }
  };
  increment_quantity = async (req, res) => {
    const { card_id } = req.params;
    // console.log(card_id);
    try {
      const product = await cardModel.findById(card_id);
      const { quantity } = product;
      await cardModel.findByIdAndUpdate(card_id, {
        quantity: quantity + 1,
      });
      responseReturn(res, 200, { message: "Increment Success" });
    } catch (error) {
      cosole.log(error.message);
    }
  };
  decrement_quantity = async (req, res) => {
    const { card_id } = req.params;
    // console.log(card_id);
    try {
      const product = await cardModel.findById(card_id);
      const { quantity } = product;
      await cardModel.findByIdAndUpdate(card_id, {
        quantity: quantity - 1,
      });
      responseReturn(res, 200, { message: "Decrement Success" });
    } catch (error) {
      cosole.log(error.message);
    }
  };
  add_wishlist = async (req, res) => {
    const { productId } = req.body;
    try {
      const product = await wishlistModel.findOne({ productId });
      if (product) {
        responseReturn(res, 404, { error: "Wishlist product already added" });
      } else {
        await wishlistModel.create(req.body);
        responseReturn(res, 201, { message: "Wishlist successfully added" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  get_wishlist_products = async (req, res) => {
    const { userId } = req.params;
    try {
      const wishlists = await wishlistModel.find({ userId });
      responseReturn(res, 201, { wishlistCount: wishlists.length, wishlists });
    } catch (error) {
      console.log(error.message);
    }
  };
  delete_wishlist_product = async (req, res) => {
    const { wishlistId } = req.params;
    try {
      const wishlist = await wishlistModel.findByIdAndDelete(wishlistId);
      responseReturn(res, 201, {
        message: "Wishlist Delete success",
        wishlistId,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
}

module.exports = new cartController();
