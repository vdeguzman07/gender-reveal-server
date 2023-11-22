const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
    },
    hasAnswer: {
      type: Boolean,
      required: [true, "hasAnswer is required"],
    },
    options: [
      {
        label: {
          type: String,
          //   required: [true, "Label is required"],
        },
        isCorrect: {
          type: Boolean,
          //   required: [true, "isCorrect is required"],
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
