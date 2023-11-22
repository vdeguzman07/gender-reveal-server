const express = require("express");
const router = express.Router();
const QuestionController = require("./../controllers/Question.controller");

router.post("/createQuestion", QuestionController.createQuestion);
router.get("/getQuestions", QuestionController.getAllQuestions);
router.patch("/updateQuestion/:id", QuestionController.updateQuestions);

router.post("/createGender", QuestionController.createGender);
router.get("/getGender", QuestionController.getGender);

module.exports = router;
