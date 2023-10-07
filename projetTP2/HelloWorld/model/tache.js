const mongoose = require("mongoose");
const dataSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
    minlength: 3, 
    trim: true
  },
  description: {
    required: true,
    type: String,
    trim: true
  },
  dueDate: {
    required: true,
    type: Date
  },
  createdDate: {
    default: Date.now,
    type: Date
  },
  completed: {
    default: false,
    type: Boolean
  },

});
module.exports = mongoose.model("Tache", dataSchema);
