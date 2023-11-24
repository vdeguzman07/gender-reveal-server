const express = require("express");
const router = express.Router();
const DashboardController = require("./../controllers/dashboardController");

router.get("/dashboard-data", DashboardController.getTotalStatus);

module.exports = router;
