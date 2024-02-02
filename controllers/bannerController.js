const formidable = require("formidable");
const productModel = require("./../models/productModel");
const cloudinary = require("cloudinary").v2;
const bannerModel = require("./../models/bannerModel");
const { responseReturn } = require("../utils/response");
const {
  mongo: { ObjectId },
} = require("mongoose");
class bannerController {
  addBanner = async (req, res) => {
    try {
      const form = formidable({ multiples: true });
      form.parse(req, async (err, fields, files) => {
        const { productId } = fields;
        const { image } = files;

        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret_key,
          secure: true,
        });

        const { slug } = await productModel.findById(productId);
        const result = await cloudinary.uploader.upload(image.filepath, {
          folder: "banners",
        });
        const cbanner = await bannerModel.create({
          productId,
          banner: result.url,
          link: slug,
        });
        responseReturn(res, 200, { cbanner, message: "Banner Added Success" });
      });
    } catch (error) {
      responseReturn(res, 500, { message: error.message });
    }
  };

  getbanners = async (req, res) => {
    try {
      const banners = await bannerModel.aggregate([
        {
          $sample: {
            size: 10,
          },
        },
      ]);
      responseReturn(res, 200, { banners });
    } catch (error) {
      responseReturn(res, 500, { message: error.message });
    }
  };

  getbanner = async (req, res) => {
    try {
      const { productId } = req.params;
      const banner = await bannerModel.findOne({
        productId: new ObjectId(productId),
      });
      responseReturn(res, 200, { banner });
    } catch (error) {
      responseReturn(res, 500, { message: error.message });
    }
  };

  updateBanner = async (req, res) => {
    try {
      const { bannerId } = req.params;
      const form = formidable({ multiples: true });
      form.parse(req, async (err, fields, files) => {
        const { image } = files;
        let banner = await bannerModel.findById(bannerId);
        let temp = banner.banner.split("/");
        temp = temp[temp.length - 1];
        const imageName = temp.split(".")[0];
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret_key,
          secure: true,
        });
        await cloudinary.uploader.destroy(imageName);
        const { url } = await cloudinary.uploader.upload(image.filepath, {
          folder: "banners",
        });
        await bannerModel.findByIdAndUpdate(bannerId, {
          banner: url,
        });
        banner = await bannerModel.findById(bannerId);
        responseReturn(res, 200, { banner, message: "Banner Update Success" });
      });
    } catch (error) {
      responseReturn(res, 500, { message: error.message });
    }
  };
}

module.exports = new bannerController();
