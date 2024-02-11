const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  currencyCode: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  usdAmount: {
    type: Number,
    required: true
  }
});

const Currency = mongoose.model('Currency', currencySchema);

module.exports = Currency;
