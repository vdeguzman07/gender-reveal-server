const Asset = require("../models/Asset.model");
const catchAsync = require("../utils/catchAsync");
const QueryFeatures = require("../query/QueryFeatures");

exports.getTotalStatus = catchAsync(async (req, res, next) => {
  const totalStatus = await Asset.aggregate([
    {
      $group: { _id: "$status", count: { $sum: 1 } },
    },
  ]);
  const assetTotal = await Asset.aggregate([
    {
      $group: { _id: "$type", count: { $sum: 1 } },
    },
  ]);
  res.status(200).json({
    status: "success",
    status: totalStatus,
    asset: assetTotal,
  });
});

exports.getCompletion = catchAsync(async (req, res, next) => {
  const completion = await Asset.aggregate([
    {
      $group: {
        _id: null,
        completed: {
          $sum: {
            $cond: [
              {
                $ifNull: ["$dateCompleted", false],
              },
              1,
              0,
            ],
          },
        },
        notComplete: {
          $sum: {
            $cond: [
              {
                $eq: ["$dateCompleted", null],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  res.status(200).json({
    completion,
  });
});
