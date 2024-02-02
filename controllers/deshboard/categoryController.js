const formidable = require("formidable");
const { responseReturn } = require("../../utils/response");
const categoryModel = require("../../models/categoryModel");
const cloudinary = require("cloudinary").v2;
class categoryController {
  categoryAdd = async (req, res) => {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        responseReturn(res, 404, { error: "Something Error" });
      } else {
        try {
          let { name } = fields;
          let { image } = files;
          name = name.trim();
          const slug = name.split(" ").join("-");
          cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret_key,
            secure: true,
          });
          const result = await cloudinary.uploader.upload(image.filepath, {
            folder: "categories",
          });
          if (result) {
            const category = await categoryModel.create({
              name,
              slug,
              image: result.url,
            });
            // console.log(category);
            responseReturn(res, 201, {
              category,
              message: "Add Category Success",
            });
          } else {
            responseReturn(res, 404, { error: "Add Category Failed" });
          }
        } catch (error) {
          responseReturn(res, 500, { error: "Internal Server Error" });
        }
      }
    });
  };
  // Get Category
  get_category = async (req, res) => {
    console.log(req.query);
    const { page, searchValue, perPage } = req.query;

    try {
      let skipPage = "";
      if (perPage && page) {
        skipPage = parseInt(perPage) * (parseInt(page) - 1);
      }
      if (searchValue && page && perPage) {
        const categories = await categoryModel
          .find({
            $text: { $search: searchValue },
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalCategories = await categoryModel
          .find({
            $text: { $search: searchValue },
          })
          .countDocuments();
        responseReturn(res, 201, { totalCategories, categories });
      } else if (searchValue === "" && page && perPage) {
        const categories = await categoryModel
          .find({})
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });
        const totalCategories = await categoryModel.find({}).countDocuments();
        responseReturn(res, 201, { totalCategories, categories });
      } else {
        const categories = await categoryModel.find({}).sort({ createdAt: -1 });
        const totalCategories = await categoryModel.find({}).countDocuments();
        responseReturn(res, 201, { totalCategories, categories });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
}

module.exports = new categoryController();
