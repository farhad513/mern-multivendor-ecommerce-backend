const mongoose = require("mongoose");

module.exports.dbConnect = async () => {
  try {
    if (process.env.MODE === "pro") {
      await mongoose.connect(process.env.DB_PRO_URL, {
        useNewUrlParser: true,
      });
      console.log("Database Connected...");
    } else {
      await mongoose.connect(process.env.DB_LOCAL_URL, {
        useNewUrlParser: true,
      });
      console.log("Local Database Connected...");
    }
  } catch (error) {
    console.log(error.message);
  }
};
