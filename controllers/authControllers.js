const adminModel = require("../models/adminModel");
const sellerModel = require("../models/sellerModel");
const sellerCustomerModel = require("../models/chat/sellerCustomerModel");
const { responseReturn } = require("../utils/response");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;
const { CreateTokan } = require("../utils/createTokan");
class authControllers {
  // Admin Login
  admin_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await adminModel.findOne({ email }).select("+password");

      if (admin) {
        const matched = await bcrypt.compare(password, admin.password);

        if (matched) {
          const token = await CreateTokan({
            id: admin.id,
            role: admin.role,
          });
          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          responseReturn(res, 200, { token, message: "Login successful" });
        } else {
          responseReturn(res, 404, { error: "Email and Password Invalid !!" });
        }
      } else {
        responseReturn(res, 404, { error: "Email doesn't Exist !!" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error });
    }
  };

  // seller Login

  seller_login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const seller = await sellerModel.findOne({ email }).select("+password");

      if (seller) {
        const matched = await bcrypt.compare(password, seller.password);

        if (matched) {
          const token = await CreateTokan({
            id: seller.id,
            role: seller.role,
          });
          res.cookie("accessToken", token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
          responseReturn(res, 200, { token, message: "Login successful" });
        } else {
          responseReturn(res, 404, { error: "Email and Password Invalid !!" });
        }
      } else {
        responseReturn(res, 404, { error: "Email doesn't Exist !!" });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  // Seller Register
  seller_register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const user = await sellerModel.findOne({ email });
      if (user) {
        responseReturn(res, 404, { error: "Email already exists" });
      } else {
        const seller = await sellerModel.create({
          name,
          email,
          password: await bcrypt.hash(password, 10),
          method: "Facebook",
          shopInfo: {},
        });
        await sellerCustomerModel.create({
          myId: seller.id,
        });
        const token = await CreateTokan({ id: seller.id, role: seller.role });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        responseReturn(res, 201, { token, message: "Register successful" });
      }
    } catch (error) {
      responseReturn(res, 404, { error: "Internal Server Error" });
    }
  };

  // get User
  getUser = async (req, res) => {
    const { role, id } = req;
    try {
      if (role === "admin") {
        const admin = await adminModel.findById(id);
        responseReturn(res, 200, { userInfo: admin });
      } else {
        const seller = await sellerModel.findById(id);
        responseReturn(res, 200, { userInfo: seller });
      }
    } catch (error) {
      responseReturn(res, 404, { error: "Internal Server Error" });
    }
  };

  profile_image_upload = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiple: true });
    form.parse(req, async (err, _, files) => {
      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret_key,
        secure: true,
      });
      const { image } = files;
      try {
        const result = await cloudinary.uploader.upload(image.filepath, {
          folder: "profile",
        });
        if (result) {
          await sellerModel.findByIdAndUpdate(id, {
            image: result.url,
          });
          const userInfo = await sellerModel.findById(id);
          responseReturn(res, 201, {
            userInfo,
            message: "Seller Image Update Success",
          });
        } else {
          responseReturn(res, 404, { error: " Seller Image Upload Failed" });
        }
      } catch (error) {
        responseReturn(res, 404, { error: error.message });
      }
    });
  };

  // Shop Info add

  profile_add_info = async (req, res) => {
    const { division, distict, thana, shopName } = req.body;
    const { id } = req;
    // console.log(id);
    try {
      await sellerModel.findByIdAndUpdate(id, {
        shopInfo: {
          shopName,
          division,
          distict,
          thana,
        },
      });
      const userInfo = await sellerModel.findById(id);
      responseReturn(res, 201, {
        userInfo,
        message: "Profile Info Add Success",
      });
    } catch (error) {
      responseReturn(res, 404, { error: error.message });
    }
  };
  logout = async (req, res) => {
    try {
      res.cookie("accessToken", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      responseReturn(res, 201, {
        message: "logout successfully",
      });
    } catch (error) {
      responseReturn(res, 404, { error: error.message });
    }
  };
}

module.exports = new authControllers();
