const userModel = require("../../models/userModel");
const { responseReturn } = require("../../utils/response");
const { CreateTokan } = require("../../utils/createTokan");
const bcrypt = require("bcrypt");
const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
class authController {
  register_user = async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const user = await userModel.findOne({ email });
      //   console.log(user);
      if (user) {
        responseReturn(res, 404, { error: "Email Already Exists" });
      } else {
        const createUser = await userModel.create({
          name: name.trim(),
          email: email.trim(),
          password: await bcrypt.hash(password, 10),
        });
        await sellerCustomerModel.create({
          myId: createUser.id,
        });
        const token = await CreateTokan({
          id: createUser.id,
          name: createUser.name,
          email: createUser.email,
        });
        res.cookie("userToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        responseReturn(res, 201, { message: "Register successful", token });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  login_user = async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await userModel.findOne({ email }).select("+password");

      if (user) {
        const matched = await bcrypt.compare(password, user.password);

        if (matched) {
          const token = await CreateTokan({
            id: user.id,
            name: user.name,
            email: user.email,
          });
          res.cookie("userToken", token, {
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
  user_logout = async (req, res) => {
    res.cookie("userToken", "", {
      expires: new Date(Date.now()),
    });
    responseReturn(res, 200, { message: "Logout Success" });
  };
}

module.exports = new authController();
