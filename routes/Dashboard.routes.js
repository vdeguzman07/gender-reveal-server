const express = require("express");
const router = express.Router();
const DashboardController = require("./../controllers/dashboardController");

router.get("/dashboard-data", DashboardController.getTotalStatus);
router.get("/dashboard", DashboardController.getCompletion);

module.exports = router;
