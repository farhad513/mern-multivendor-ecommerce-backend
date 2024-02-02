// const lg = require("")
const formidable = require("formidable");
const productModel = require("../../models/productModel");
const cloudinary = require("cloudinary").v2;
const { responseReturn } = require("../../utils/response");
class productController {
  add_Product = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      let {
        name,
        description,
        stock,
        discount,
        brand,
        price,
        category,
        shopName,
      } = fields;
      const { images } = files;
      console.log(fields);
      name = name.trim();
      const slug = name.split(" ").join("-");
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret_key,
        secure: true,
      });
      try {
        let allImages = [];
        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.uploader.upload(images[i].filepath, {
            folder: "products",
          });
          allImages = [...allImages, result.url];
        }
        await productModel.create({
          sellerId: id,
          name,
          slug,
          shopName,
          // description,
          description: description.trim(),
          brand: brand.trim(),
          // brand,
          category,
          category: category.trim(),
          stock: parseInt(stock),
          price: parseInt(price),
          discount: parseInt(discount),
          images: allImages,
        });
        // console.log(product);
        responseReturn(res, 201, { message: "Product Add Success" });
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    });
  };
  // get Products
  get_products = async (req, res) => {
    const { page, searchValue, perPage } = req.query;
    const { id } = req;
    const skipPage = parseInt(perPage) * (parseInt(page) - 1);
    try {
      if (searchValue && page && perPage) {
        const products = await productModel
          .find({
            $text: { $search: searchValue },
            sellerId: id,
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalProducts = await productModel
          .find({
            $text: { $search: searchValue },
            sellerId: id,
          })
          .countDocuments();
        responseReturn(res, 201, { totalProducts, products });
      } else {
        const products = await productModel
          .find({ sellerId: id })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalProducts = await productModel
          .find({ sellerId: id })
          .countDocuments();
        responseReturn(res, 201, { totalProducts, products });
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // get Product
  get_product = async (req, res) => {
    const { productId } = req.params;
    try {
      const product = await productModel.findById(productId);
      responseReturn(res, 201, { product });
    } catch (error) {
      console.log(error.message);
    }
  };

  // get Product
  updateProduct = async (req, res) => {
    console.log(req.body);
    let { name, price, discount, stock, description, brand, productId } =
      req.body;
    console.log(req.body);
    name = name.trim();
    const slug = name.split(" ").join("-");
    try {
      await productModel.findByIdAndUpdate(productId, {
        name,
        price,
        discount,
        stock,
        description,
        brand,
        productId,
        slug,
      });
      const product = await productModel.findById(productId);
      responseReturn(res, 201, { product, message: "Product Update Success" });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  // Product image Update
  product_image_update = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {
      const { oldImage, productId } = fields;
      const { newImage } = files;
      if (err) {
        responseReturn(res, 404, { error: err.message });
      } else {
        try {
          cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret_key,
            secure: true,
          });
          const result = await cloudinary.uploader.upload(newImage.filepath, {
            folder: "products",
          });
          if (result) {
            let { images } = await productModel.findById(productId);
            const index = await images.findIndex((img) => img === oldImage);
            images[index] = result.url;
            await productModel.findByIdAndUpdate(productId, {
              images,
            });
            const product = await productModel.findById(productId);
            responseReturn(res, 201, {
              product,
              message: "Product Image Update Success",
            });
          } else {
            responseReturn(res, 404, { error: "Image Upload Failed" });
          }
        } catch (error) {
          responseReturn(res, 404, { error: error.message });
        }
      }
    });
  };
}
module.exports = new productController();
