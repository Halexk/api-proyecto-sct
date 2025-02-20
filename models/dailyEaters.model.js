const { model, Schema } = require('mongoose')

const dailyEatersSchema = new Schema({
  department: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  workersEating: {
    type: Number,
    required: true,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now, // Set the default value to the current date
  },
});

module.exports = model('DailyEaters', dailyEatersSchema)
