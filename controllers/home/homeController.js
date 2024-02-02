const categoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel");
const queryProducts = require("../../utils/queryProduct");
const { responseReturn } = require("../../utils/response");
const reviewModel = require("../../models/reviewModel");
const moment = require("moment");
const {
  mongo: { ObjectId },
} = require("mongoose");
class homeController {
  formateProduct = (products) => {
    const productArray = [];
    let i = 0;
    while (i < products.length) {
      let temp = [];
      let p = i;
      while (p < i + 3) {
        if (products[p]) {
          temp.push(products[p]);
        }
        p++;
      }
      productArray.push([...temp]);
      i = p;
    }
    return productArray;
  };
  get_categorys = async (req, res) => {
    try {
      const categorys = await categoryModel.find({});
      responseReturn(res, 200, { categorys });
    } catch (error) {
      console.log(error.message);
    }
  };
  get_products = async (req, res) => {
    try {
      const products = await productModel
        .find({})
        .limit(16)
        .sort({ createdAt: -1 });

      const allProducts = await productModel
        .find({})
        .limit(9)
        .sort({ createdAt: -1 });
      const latestProduct = this.formateProduct(allProducts);
      const allProducts1 = await productModel
        .find({})
        .limit(9)
        .sort({ rating: -1 });
      const topRatedProduct = this.formateProduct(allProducts1);
      const allProducts2 = await productModel
        .find({})
        .limit(16)
        .sort({ discount: -1 });
      const discountProduct = this.formateProduct(allProducts2);
      responseReturn(res, 200, {
        products,
        latestProduct,
        topRatedProduct,
        discountProduct,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  get_product = async (req, res) => {
    const { slug } = req.params;
    try {
      const product = await productModel.findOne({ slug });
      const relatedProduct = await productModel
        .find({
          $and: [
            {
              _id: {
                $ne: product.id,
              },
            },
            {
              category: {
                $eq: product.category,
              },
            },
          ],
        })
        .limit(20);
      const moreProducts = await productModel
        .find({
          $and: [
            {
              _id: {
                $ne: product.id,
              },
            },
            {
              sellerId: {
                $eq: product.sellerId,
              },
            },
          ],
        })
        .limit(3);
      responseReturn(res, 201, { product, relatedProduct, moreProducts });
    } catch (error) {
      console.log(error.message);
    }
  };
  user_review = async (req, res) => {
    const { productId, name, rating, review } = req.body;
    try {
      await reviewModel.create({
        productId,
        name,
        rating,
        review,
        date: moment(Date.now()).format("LL"),
      });
      let rat = 0;
      const reviews = await reviewModel.find({ productId });
      for (let i = 0; i < reviews.length; i++) {
        rat = rat + reviews[i].rating;
      }
      let productReview = 0;
      if (reviews.length !== 0) {
        productReview = (rat / reviews.length).toFixed(1);
      }
      await productModel.findByIdAndUpdate(productId, {
        rating: productReview,
      });
      responseReturn(res, 201, {
        message: "Product Review successfully",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  get_reviews = async (req, res) => {
    const { productId } = req.params;
    let { pageNumber } = req.query;
    pageNumber = parseInt(pageNumber);
    const limit = 5;
    const skipPage = limit * (pageNumber - 1);
    try {
      let getRating = await reviewModel.aggregate([
        {
          $match: {
            productId: {
              $eq: new ObjectId(productId),
            },
            rating: {
              $not: {
                $size: 0,
              },
            },
          },
        },
        {
          $unwind: "$rating",
        },
        {
          $group: {
            _id: "$rating",
            count: {
              $sum: 1,
            },
          },
        },
      ]);
      let rating_review = [
        {
          rating: 5,
          sum: 0,
        },
        {
          rating: 4,
          sum: 0,
        },
        {
          rating: 3,
          sum: 0,
        },
        {
          rating: 2,
          sum: 0,
        },
        {
          rating: 1,
          sum: 0,
        },
      ];
      for (let i = 0; i < rating_review.length; i++) {
        for (let k = 0; k < getRating.length; k++) {
          if (rating_review[i].rating === getRating[k]._id) {
            rating_review[i].sum = getRating[k].count;
            break;
          }
        }
      }
      const getAll = await reviewModel.find({ productId });
      const reviews = await reviewModel
        .find({ productId })
        .skip(skipPage)
        .limit(limit)
        .sort({ createdAt: -1 });
      responseReturn(res, 200, {
        reviews,
        totalReviews: getAll.length,
        rating_review,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  product_price_range = async (req, res) => {
    try {
      let priceRange = {
        low: 0,
        high: 0,
      };
      const products = await productModel
        .find({})
        .limit(9)
        .sort({ createdAt: -1 });
      const latestProduct = this.formateProduct(products);
      const getPrice = await productModel.find({}).sort({ price: 1 });
      if (getPrice.length > 0) {
        priceRange.high = getPrice[getPrice.length - 1].price;
        priceRange.low = getPrice[0].price;
      }
      responseReturn(res, 200, { latestProduct, priceRange });
    } catch (error) {
      console.log(error.message);
    }
  };
  query_products = async (req, res) => {
    const perPage = 12;
    req.query.perPage = perPage;
    console.log(req.query);
    try {
      const products = await productModel.find({}).sort({ createdAt: -1 });
      // console.log(products);
      const totalProduct = new queryProducts(products, req.query)
        .categoryQuery()
        .searchQuery()
        .priceQuery()
        .ratingQuery()
        .sortByPrice()
        .countProducts();

      const result = new queryProducts(products, req.query)
        .categoryQuery()
        .searchQuery()
        .ratingQuery()
        .priceQuery()
        .sortByPrice()
        .skipPage()
        .limit()
        .getProducts();
      // console.log(totalProduct);
      responseReturn(res, 200, { products: result, totalProduct, perPage });
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = new homeController();
