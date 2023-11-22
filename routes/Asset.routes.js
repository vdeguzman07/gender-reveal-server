const express = require("express");
const router = express.Router();
const AssetController = require("./../controllers/assetsController");

router.post("/createAsset", AssetController.createAsset);
router.get("/", AssetController.getAllAssets);
router.put("/:id", AssetController.updateAssets);
router.delete("/:id", AssetController.deleteAsset);

module.exports = router;
