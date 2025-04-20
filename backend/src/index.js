require("dotenv").config();

const express = require("express");
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = 5454;

// Configure CORS with proper options
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure the carousel uploads directory exists
const carouselUploadsDir = path.join(uploadsDir, 'carousel');
if (!fs.existsSync(carouselUploadsDir)) {
    fs.mkdirSync(carouselUploadsDir, { recursive: true });
}

// Serve static files from the uploads directory with proper CORS headers
app.use("/uploads", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static(uploadsDir));

// Ensure the images directory exists
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Serve static files from the "images" directory with proper CORS headers
app.use("/images", (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(imagesDir));

app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5454/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/", (req, res) => {
    return res.status(200).send(" <a href='/auth/google'>Login with Google</a>");
});

const authRouter = require("./routes/auth.routes.js");
app.use("/auth", authRouter);

const userRouter = require("./routes/user.routes.js");
app.use("/api/users", userRouter);

const productRouter = require("./routes/product.routes.js");
app.use("/api/products", productRouter);

const adminProductRouter = require("./routes/product.admin.routes.js");
app.use("/api/admin/products", adminProductRouter);

const cartRouter = require("./routes/cart.routes.js");
app.use("/api/cart", cartRouter);

const cartItemRouter = require("./routes/cartItem.routes.js");
app.use("/api/cart_items", cartItemRouter);

const orderRouter = require("./routes/order.routes.js");
app.use("/api/orders", orderRouter);

const notificationRouter = require("./routes/notification.routes.js");
app.use("/api/notifications", notificationRouter);

const paymentRouter = require("./routes/payment.routes.js");
app.use('/api/payments', paymentRouter);

const reviewRouter = require("./routes/review.routes.js");
app.use("/api/reviews", reviewRouter);

const ratingRouter = require("./routes/rating.routes.js");
app.use("/api/ratings", ratingRouter);

const adminRouter = require('./routes/admin.routes.js');
// Admin routes
app.use('/api/admin', adminRouter);

const carouselRouter = require('./routes/carousel.routes');
app.use('/api/carousel', carouselRouter);

// admin routes handler
const adminOrderRoutes = require("./routes/adminOrder.routes.js");
app.use("/api/admin/orders", adminOrderRoutes);

const categoryRoutes = require('./routes/category.routes');
app.use('/api/categories', categoryRoutes);

const uploadRoutes = require('./routes/upload.routes');

// Upload routes
app.use('/api/upload', uploadRoutes);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

const connectDb = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database", error);
    process.exit(1);
  }
};

app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app };
