const Question = require("../models/Question.model");
const Gender = require("../models/Gender.model");

exports.createQuestion = async (req, res, next) => {
  const question = await Question.create(req.body);
  res.send(question);
};

exports.getAllQuestions = async (req, res, next) => {
  const questions = await Question.find({}).sort({ createdAt: 1 });
  res.send(questions);
};

exports.updateQuestions = async (req, res, next) => {
  const { id } = req.params;
  const question = await Question.findByIdAndUpdate(id, req.body);
  res.send(question);
};

exports.createGender = async (req, res, next) => {
  const gender = await Gender.create(req.body);
  res.send(gender);
};

exports.getGender = async (req, res, next) => {
  const gender = await Gender.find({}).sort({ createdAt: -1 });
  res.send(gender);
};
