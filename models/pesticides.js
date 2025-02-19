const mongoose = require('mongoose');

// Define the schema for pesticides
const pesticideSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  organic: {
    type: Boolean,
    required: true,
  },
  price: {
    type: String, // You can change this to a number if you prefer
    required: true,
  },
  per: {
    type: String, // You can change this to a number if you prefer
    required: true,
  },
  image: {
    type: Buffer,  // Store the image as binary data
    required: false, // Image is optional
  },
}, { timestamps: true }); // Optional: add timestamps to track creation and modification

// Create and export the model
const Pesticide = mongoose.model('Pesticide', pesticideSchema);
module.exports = Pesticide;
