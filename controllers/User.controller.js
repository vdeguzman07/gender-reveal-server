const UserReveal = require("./../models/User.model");
const AssetUser = require("../models/AssetUser.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res, next) => {
  const user = await UserReveal.create(req.body);
  //   const user = "adadasdasd";
  res.send({ user });
};

exports.getUsers = async (req, res, next) => {
  const users = await UserReveal.find({});
  res.send({
    users,
  });
};

exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;

  const user = await UserReveal.findByIdAndDelete({ _id: id });

  res.send({
    msg: "User deleted successfully",
  });
};

exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError("Please provide all the required fields", 400));
  }

  const userAlreadyExist = await AssetUser.findOne({ email: email });
  if (userAlreadyExist) {
    return next(new AppError("Email Already in used", 400));
  }

  const user = await AssetUser.create({ name, email, password });
  const token = user.createJWT();
  user.password = undefined;
  res.status(200).json({ user, token });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide credentials", 400));
  }

  const user = await AssetUser.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Invalid Credentials", 400));
  }

  const isPassword = await user.comparePassword(password);
  if (!isPassword) {
    return next(new AppError("Invalid Credentials", 400));
  }
  const token = user.createJWT();
  user.password = undefined;
  res.status(200).json({ user, token });
});
