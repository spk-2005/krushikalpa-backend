const mongoose = require('mongoose');

const consumerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  userType: { type: String, required: true, enum: ['Consumer'] }, // Fixed type
  address: {
    state: { type: String, default: "" },
    district: { type: String, default: "" },
    mandal: { type: String, default: "" },
    townVillage: { type: String, default: "" },
    pincode: { type: String, default: "" }
  }
});

const ConsumerUser = mongoose.model('ConsumerUser', consumerSchema);
module.exports = ConsumerUser;
