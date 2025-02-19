const mongoose = require('mongoose');

const soldPesticideSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  per: String,
  date: { type: Date, default: Date.now }, // Date of purchase
  userName: String,
  userEmail: String,
});

const SoldPesticide = mongoose.model('SoldPesticide', soldPesticideSchema);
module.exports = SoldPesticide;
