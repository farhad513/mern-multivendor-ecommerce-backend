const express = require("express");
const app = express();
const { dbConnect } = require("./utils/DB");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
require("dotenv").config();
const server = http.createServer(app);
const port = process.env.PORT;
const socket = require("socket.io");

dbConnect();

app.use(
  cors({
    origin:
      process.env.MODE === "pro"
        ? [
            process.env.client_customer_pro_url,
            process.env.client_admin_pro_url,
          ]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
const io = socket(server, {
  cors: {
    origin:
      process.env.MODE === "pro"
        ? [
            process.env.client_customer_pro_url,
            process.env.client_admin_pro_url,
          ]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  },
});

var allUser = [];
var allSeller = [];
const addUser = (userId, socketId, userInfo) => {
  const checkedUser = allUser.some((u) => u.userId === userId);
  if (!checkedUser) {
    allUser.push({
      userId,
      socketId,
      userInfo,
    });
  }
};
const addSeller = (sellerId, socketId, userInfo) => {
  const checkedSeller = allSeller.some((u) => u.sellerId === sellerId);
  if (!checkedSeller) {
    allSeller.push({
      sellerId,
      socketId,
      userInfo,
    });
  }
};

const findCustomer = (userId) => {
  return allUser.find((u) => u.userId === userId);
};
const findSeller = (sellerId) => {
  return allSeller.find((u) => u.sellerId === sellerId);
};
const remove = (socketId) => {
  allUser = allUser.filter((u) => u.socketId !== socketId);
  allSeller = allSeller.filter((s) => s.socketId !== socketId);
};
var admin = {};
const removeAdmin = (socketId) => {
  if (admin.socketId === socketId) {
    admin = {};
  }
};
io.on("connection", (soc) => {
  console.log("socket server connected");
  soc.on("add_user", (userId, userInfo) => {
    addUser(userId, soc.id, userInfo);
    io.emit("activeCustomer", allUser);
    io.emit("activeSellers", allSeller);
  });
  soc.on("add_seller", (sellerId, userInfo) => {
    addSeller(sellerId, soc.id, userInfo);
    io.emit("activeSellers", allSeller);
    io.emit("activeCustomer", allUser);
    io.emit("activeAdmin", { status: true });
  });
  soc.on("add_admin", (adminInfo) => {
    delete adminInfo.email;
    admin = adminInfo;
    adminInfo.socketId = soc.id;
    io.emit("activeAdmin", { status: true });
    io.emit("activeSellers", allSeller);
  });
  soc.on("send_seller_message", (msg) => {
    const user = findCustomer(msg.receverId);
    if (user !== undefined) {
      soc.to(user.socketId).emit("seller_message", msg);
    }
  });

  soc.on("customer_send_message", (msg) => {
    const seller = findSeller(msg.receverId);
    if (seller !== undefined) {
      soc.to(seller.socketId).emit("customer_message", msg);
    }
  });

  soc.on("send_message_admin_seller", (msg) => {
    const seller = findSeller(msg.receverId);
    if (seller !== undefined) {
      soc.to(seller.socketId).emit("receve_admin_message", msg);
    }
  });

  soc.on("send_message_seller_admin", (msg) => {
    if (admin.socketId) {
      soc.to(admin.socketId).emit("receve_seller_message", msg);
    }
  });

  soc.on("disconnect", () => {
    console.log("user disconnected");
    remove(soc.id);
    removeAdmin(soc.id);
    io.emit("activeAdmin", { status: false });
    io.emit("activeSellers", allSeller);
    io.emit("activeCustomer", allUser);
  });
});
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded());
// app.use(express.bodyParser())
app.use("/api", require("./routes/authRoute"));
app.use("/api", require("./routes/chatRoute"));
app.use("/api", require("./routes/paymentRoute"));
app.use("/api", require("./routes/deshboard/categoryRoute"));
app.use("/api", require("./routes/deshboard/sellerRoute"));
app.use("/api", require("./routes/deshboard/productRoute"));
app.use("/api", require("./routes/home/cardRoute"));
app.use("/api/home", require("./routes/home/homeRoutes"));
app.use("/api", require("./routes/order/orderRoute"));
app.use("/api", require("./routes/deshboard/dashboardIndexController"));
app.use("/api", require("./routes/bannerRoute"));
app.use("/api/home", require("./routes/home/dashboard/dashboardRoute"));

app.use("/api", require("./routes/home/authRoute"));
server.listen(port, () => console.log(`Server is running on port ${port}!`));
