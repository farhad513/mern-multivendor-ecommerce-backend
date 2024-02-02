const jwt = require("jsonwebtoken");

module.exports.authMiddleware = async (req, res, next) => {
  const { accessToken } = req.cookies;
  if (!accessToken) {
    return res.status(409).json({ message: "Please Login First" });
  } else {
    try {
      const decodeToken = await jwt.verify(accessToken, process.env.SECRET_KEY);
      req.role = decodeToken.role;
      req.id = decodeToken.id;
      next();
    } catch (error) {
      return res.status(400).json({ message: "Please Login" });
    }
  }
};
