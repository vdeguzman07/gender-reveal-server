const Asset = require("../models/Asset.model");
const catchAsync = require("../utils/catchAsync");
const QueryFeatures = require("../query/QueryFeatures");
const AppError = require("../utils/AppError");

exports.createAsset = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const { serialNumber, assetTag } = req.body;
  // let findExisting = await Asset.find({
  //   $or: [{ serialNumber: serialNumber }, { assetTag: assetTag }],
  // });
  let findExistingSn = await Asset.findOne({
    // serialNumber: { $eq: serialNumber },
    $and: [{ serialNumber: serialNumber }, { serialNumber: { $ne: "N/A" } }],
  });

  let findExistingAt = await Asset.findOne({
    $and: [{ assetTag: assetTag }, { assetTag: { $ne: "N/A" } }],
  });
  // console.log(findExistingAt, findExistingSn);

  if (findExistingSn) {
    return next(new AppError(`${findExistingSn.serialNumber} existed!`, 400));
  }

  if (findExistingAt)
    return next(new AppError(`${findExistingAt.assetTag} existed!`, 400));

  const asset = await Asset.create(req.body);
  res.status(200).json({ asset });
});

exports.getAllAssets = catchAsync(async (req, res, next) => {
  const assetQuery = new QueryFeatures(Asset.find({}), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populate();

  const assetCount = new QueryFeatures(Asset.find({}), req.query)
    .filter()
    .count();

  const assets = await assetQuery.query;
  const totalAssets = await assetCount.query;

  res.status(200).json({
    total_docs: totalAssets,
    assets,
  });
});

exports.updateAssets = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { body } = req.body;

  const initialMatch = {
    _id: id,
  };

  const asset = await Asset.findByIdAndUpdate(initialMatch, body);
  if (!asset) return next(new AppError("Asset not Found", 400));

  res.status(200).json({
    asset,
  });
});

exports.deleteAsset = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const asset = await Asset.findByIdAndDelete(id);
  if (!asset) return next(new AppError("Asset not Found", 400));
  res.status(200).json({
    success: true,
  });
});
