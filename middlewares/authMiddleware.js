const jwt = require("jsonwebtoken");

module.exports.authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const token = authorization.split("Bearer ")[1];
    if (!token) {
      return res.status(409).json({ message: "Please Login First" });
    } else {
      try {
        const decodeToken = await jwt.verify(token, process.env.SECRET_KEY);
        req.role = decodeToken.role;
        req.id = decodeToken.id;
        next();
      } catch (error) {
        return res.status(400).json({ message: "Please Login" });
      }
    }
  } else {
    return res.status(400).json({ message: "Please Login" });
  }
};
