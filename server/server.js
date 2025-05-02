const express = require("express");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv");
const passport = require("./config/passport"); // Initialize Passport configuration

// Import custom middlewares
const jsonParserMiddleware = require("./middlewares/jsonParserMiddleware");
const urlEncodedMiddleware = require("./middlewares/urlEncodedMiddleware");
const corsMiddleware = require("./middlewares/corsMiddleware");
const cookieParserMiddleware = require("./middlewares/cookieParserMiddleware");
const morganMiddleware = require("./middlewares/morganMiddleware");
const expSession = require("./middlewares/expressSessionMiddleware");

// Import routes
const authRouter = require("./routes/auth.route");
const googleAuthRouter = require("./routes/googleAuth.route");
const productRouter = require("./routes/product.route");
const CouponRouter = require("./routes/coupon.route");
const OrderRouter = require("./routes/order.route");

// Used to load environment variables from a .env file into process.env
dotenv.config();

const port = process.env.PORT;
const app = express();

// Middleware order is important
app.use(corsMiddleware);
app.use(cookieParserMiddleware);
app.use(expSession);
app.use(passport.initialize());
app.use(passport.session());

// Debug middleware
// app.use((req, res, next) => {
//   console.log("Request URL:", req.url);
//   console.log("Session ID:", req.sessionID);
//   console.log("Session:", req.session);
//   console.log("Is Authenticated:", req.isAuthenticated());
//   console.log("User:", req.user);
//   next();
// });

// Then add your other middleware
app.use(jsonParserMiddleware);
app.use(urlEncodedMiddleware);
app.use(morganMiddleware);

dbConnect();

// Routes
app.use("/auth", authRouter);
app.use("/googleAuth", googleAuthRouter);
app.use("/product", productRouter);
app.use("/coupon", CouponRouter);
app.use("/order", OrderRouter);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`);
});
