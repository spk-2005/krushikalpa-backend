const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    per: { type: String, required: true },
    image: { type: Buffer } // Store image as binary data
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
