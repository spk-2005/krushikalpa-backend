// server.js (Updated Express API)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const router = express.Router();
const Order = require('./models/orders'); // MongoDB order model
require('dotenv').config();
const multer = require('multer');
const app = express();
app.use(cors());
app.use(express.json());

const Pesticide = require('./models/pesticides');

const dburi = process.env.REACT_APP_MONGO_URI;
mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('Error:', err));

const db=mongoose.connection;

  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    userType: { type: String, required: true }, // Ensure this is stored
    dob: { type: String, default: "" },  // Optional with default value
    gender: { type: String, default: "" },
    aadharNumber: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },
    address: {
      state: { type: String, default: "" },
      district: { type: String, default: "" },
      mandal: { type: String, default: "" },
      townVillage: { type: String, default: "" },
      pincode: { type: String, default: "" }
    },
    landDetails: {
      acres: { type: Number, default: 0 },
      soilType: { 
        type: String, 
        enum: ['Alluvial', 'Black', 'Laterite', 'Arid', 'Saline', 'Alkaline'], 
        default: 'Alluvial'
      },
      primaryCrops: {  type: String, default: "" },
      secondaryCrops: {  type: String, default: "" }
    },
    previousInvestment: { type: Number, default: 0 },
    profitLoss: { 
      type: String, 
      enum: ['Profit', 'Loss'], 
      default: 'Profit'
    }
  });

  const selledProductSchema = new mongoose.Schema({
    name: String,
    email: String,
    productName: String,
    category: String,
    price: Number,
    dateTime: String,
    kgAvailable: Number,
    receipt: String,  // Can store file path or URL to the uploaded receipt
});

const SelledProduct = mongoose.model('SelledProduct', selledProductSchema);

const WastageSchema = new mongoose.Schema({
  user: {
    name: String,
    email: String,
    userType: String,
  },
  location: String,
  specificWaste: String,
  weight: Number,
  price: String,
  totalPrice: Number, // ✅ Add this field
  image: {
    type: String,  // Change to Buffer if you prefer to store binary data
    required: true,
  },
});

const Wastage = mongoose.model("Wastage", WastageSchema);



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // You can change the folder location as needed
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/selledproducts', upload.single('receipt'), async (req, res) => {
  try {
    const { name, email, productName, category, price, dateTime, kgAvailable } = req.body;
    const receipt = req.file ? req.file.path : null; // If a receipt is uploaded, store its path

    const newSale = new SelledProduct({
      name,
      email,
      productName,
      category,
      price,
      dateTime,
      kgAvailable,
      receipt,
    });

    await newSale.save();
  
  
    res.status(200).json({ message: 'Product sold successfully', newSale });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to sell product' });
  }
});

app.get("/users/:email", async (req, res) => {
  const email = req.params.email;
  const user = await User.findOne({ email }); // Adjust based on DB structure
  if (!user) {
      return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});
const Product = require('./models/products'); 
app.get('/fproducts', async (req, res) => {
  try {
      const products = await Product.find();
      
      // Convert Buffer image data to Base64
      const updatedProducts = products.map(product => ({
          ...product._doc,
          image: product.image ? product.image.toString('base64') : null,
      }));

      res.json(updatedProducts);
  } catch (error) {
      res.status(500).json({ message: "Error fetching products", error: error.message });
  }
});

const User = mongoose.model('users', userSchema);


const ConsumerUser = require('./models/consumerschema'); // Import Consumer schema

app.post('/login', async (req, res) => {
  const { email, userType } = req.body;

  try {
    if (userType === "Farmer") {
      const farmerUser = await User.findOne({ email }); // Check in 'users' collection
      if (farmerUser) {
        return res.status(200).json({ message: "User found", user: farmerUser });
      }
    } else if (userType === "Consumer") {
      const consumerUser = await ConsumerUser.findOne({ email }); // Check in 'consumerusers' collection
      if (consumerUser) {
        return res.status(200).json({ message: "User found", user: consumerUser });
      }
    }

    return res.status(404).json({ message: "User not found, please sign up first." });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { email, name, userType } = req.body;

    if (userType === "Farmer") {
      const existingUser = await User.findOne({ email }); // Check only in 'users' collection
      if (existingUser) {
        return res.status(400).json({ message: "User already exists in Farmers" });
      }

      const newUser = new User({ email, name, userType }); // Store in 'users' collection
      await newUser.save();
      return res.status(201).json({ message: "Farmer registered successfully" });

    } else if (userType === "Consumer") {
      const existingConsumer = await ConsumerUser.findOne({ email }); // Check only in 'consumerusers' collection
      if (existingConsumer) {
        return res.status(400).json({ message: "User already exists in Consumers" });
      }

      const newConsumer = new ConsumerUser({ email, name, userType }); // Store in 'consumerusers' collection
      await newConsumer.save();
      return res.status(201).json({ message: "Consumer registered successfully" });
    }

    return res.status(400).json({ message: "Invalid user type" });

  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
});

app.put('/users/update', async (req, res) => {
  console.log(req.body); // Debugging: log the request body
  try {
    const { storedEmail, updatedData } = req.body;

    if (!storedEmail || !updatedData) {
      return res.status(400).json({ message: "Email and update data are required" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: storedEmail }, // Find user by email
      { $set: updatedData }, // Update the fields
      { new: true, runValidators: true } // Return updated user, ensure validation
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

const fs = require("fs");

// Storage configuration
const storage1 = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generating a unique filename
  },
});
const upload1 = multer({ storage: storage1 });

// Route to handle form submission
app.post("/api/wastage", upload1.single("image"), async (req, res) => {
  // Destructure form data and image from request
  const { name, email, userType, location, specificWaste, weight, totalPrice } = req.body;
  const imageFile = req.file; // This will be the image file uploaded by the user

  // Validation
  if (!imageFile) {
    return res.status(400).json({ message: "Image is required" });
  }

  // Store the image path in your database or process as needed
  const imagePath = imageFile.path; // Path of the uploaded image

  // Create new Wastage record
  const newWastage = new Wastage({
    user: { name, email, userType },
    location,
    specificWaste,
    weight,
    totalPrice,
    image: imagePath, // Store the path to the image
  });

  try {
    await newWastage.save();
    res.status(200).json({ message: "Wastage data submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});

app.get('/farmer-dashboard/:email', async (req, res) => {
  const email = req.params.email;

  try {
    // Fetch user details by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the products sold by the farmer (user) by their email
    const productsSold = await SelledProduct.find({ email });

    // Combine user data and products sold
    res.status(200).json({ user, productsSold });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});
app.get('/pesticides', async (req, res) => {
  try {
    const pesticides = await Pesticide.find();  // Fetch all pesticides

    // Convert Buffer to Base64 for each pesticide
    const modifiedPesticides = pesticides.map(pesticide => ({
      _id: pesticide._id,
      name: pesticide.name,
      description: pesticide.description,
      organic: pesticide.organic,
      price: pesticide.price,
      per:pesticide.per,
      image: pesticide.image ? pesticide.image.toString('base64') : null,  // Convert binary data to Base64
      createdAt: pesticide.createdAt,
      updatedAt: pesticide.updatedAt
    }));

    res.json(modifiedPesticides);
  } catch (error) {
    console.error('Error fetching pesticides:', error);
    res.status(500).json({ message: 'Error fetching pesticides', error: error.message });
  }
});



const SoldPesticide = require('./models/soldpesticides');
app.post('/sellPesticide', async (req, res) => {
  const { pesticide, user } = req.body;

  if (!pesticide || !user) {
    return res.status(400).json({ message: 'Missing pesticide or user information' });
  }

  try {
    const soldPesticide = new SoldPesticide({
      name: pesticide.name,
      description: pesticide.description,
      price: pesticide.price,
      per: pesticide.per,
      date: new Date(),
      userName: user.name,
      userEmail: user.email,
    });

    await soldPesticide.save();
    res.status(200).json({ message: 'Pesticide sold successfully!' });
  } catch (error) {
    console.error('Error selling pesticide:', error);
    res.status(500).json({ message: 'Error selling pesticide', error: error.message });
  }
});

router.get('/getUserDetails/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user details', error: err });
  }
});



// Define Schema
const farmingSchema = new mongoose.Schema({
  title: String,
  description: String,
  tips: [String]
});

const FarmingGuidance = mongoose.model('FarmingGuidance', farmingSchema);

// API to get farming guidance
app.get('/api/farmingguidance', async (req, res) => {
  try {
      const guidance = await FarmingGuidance.find();
      res.json(guidance);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

app.listen(5000, () => console.log('Server Running On Port 5000'));