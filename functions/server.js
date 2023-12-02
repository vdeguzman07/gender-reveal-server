const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");

const dotenv = require("dotenv");
const { connectDB } = require("./../db/connect");
dotenv.config();
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

const UserRoutes = require("./../routes/User.routes");
const QuestionRoutes = require("../routes/Question.routes");
const AssetRoutes = require("../routes/Asset.routes");
const DashboardRoutes = require("../routes/Dashboard.routes");

const errorController = require("../controllers/errorController");

const app = express();
const router = express.Router();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin:
      // "*",
      [
        "http://localhost:4208",
        "https://vdg-asset-management.netlify.app",
        "https://vdg-asset-management.netlify.app/login",
        "https://vdg-asset-management.netlify.app/",
        "https://sumalinog-asset-management.netlify.app",
        "https://sumalinog-asset-management.netlify.app/",
        "https://viel-gender-reveal.netlify.app",
        "*",
        //   "https://655b208a2802f363d70d6b96--clinquant-liger-ae140b.netlify.app",
        //   "https://s-feast-development-4f65d5a8b11b.herokuapp.com",
        //   "www.sfeast.ph",
        //   "sfeast.ph",
        //   "https://www.sfeast.ph",
        //   "https://sfeast.ph",
      ],
  })
);
app.use(helmet());
app.use(mongoSanitize({ allowDots: true }));
app.use(xss());

router.get("/", (req, res) => {
  res.send({
    msg: "Welcome",
  });
});

router.use("/api/v1/user", UserRoutes);
router.use("/api/v1/question", QuestionRoutes);
router.use("/api/v1/asset", AssetRoutes);
router.use("/api/v1/dashboard", DashboardRoutes);
router.get("/sample", (req, res) => {
  res.send("App is running");
});

const port = process.env.PORT;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
app.use("/.netlify/functions/server", router);
app.use(errorController);
module.exports.handler = serverless(app);
