const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  fileName: {
    type: String
  },
  realFileName: {
    type: String
  }
});

module.exports = mongoose.model("Task", taskSchema);
