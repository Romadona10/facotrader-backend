// backend/server.js
// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const port = 3000;

// // Enable CORS for the Angular app
// app.use(cors({
//     origin: 'http://localhost:4200'  // Adjust according to your Angular app's address
// }));

// app.use(bodyParser.json());

// // Use environment variables for MongoDB URI
// const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://king2000:lamp100@cluster0.fzl4pqy.mongodb.net/tradingjournal?retryWrites=true&w=majority&appName=Cluster0';

// // Connect to MongoDB using Mongoose
// mongoose.connect(mongoURI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   tls: true,
//   tlsInsecure: true // Ignore SSL issues temporarily; not recommended for production
// })
// .then(() => {
//   console.log('MongoDB connected');
// })
// .catch(err => {
//   console.error('MongoDB connection error:', err);
//   process.exit(1); // Exit if unable to connect to MongoDB
// });

// // Trading Schema
// const tradeSchema = new mongoose.Schema({
//   date: { type: Date, required: true },
//   symbol: { type: String, required: true },
//   entryPrice: { type: Number, required: true },
//   currentPrice: { type: Number, required: true },
//   roi: { type: Number, required: true },
// });

// const Trade = mongoose.model('Trade', tradeSchema);

// // Routes
// app.get('/api/trades', async (req, res) => {
//   try {
//     const trades = await Trade.find();
//     res.json(trades);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

// app.post('/api/trades', async (req, res) => {
//   try {
//     const newTrade = new Trade(req.body);
//     await newTrade.save();
//     res.json(newTrade);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });

// // Add update route
// app.put('/api/trades/:id', async (req, res) => {
//   try {
//     const updatedTrade = await Trade.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(updatedTrade);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });


// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });


require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:4200'  // Adjust according to your Angular app's address
}));

app.use(bodyParser.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://king2000:lamp100@cluster0.fzl4pqy.mongodb.net/tradingjournal?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
})
.then(() => {
  console.log('MongoDB connected');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Trading Schema
const tradeSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  symbol: { type: String, required: true },
  entryPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  roi: { type: Number, required: true },
});

const Trade = mongoose.model('Trade', tradeSchema);

// User Schema
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  nationality: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/api/trades', async (req, res) => {
  try {
    const trades = await Trade.find();
    res.json(trades);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.post('/api/trades', async (req, res) => {
  try {
    const newTrade = new Trade(req.body);
    await newTrade.save();
    res.json(newTrade);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/api/trades/:id', async (req, res) => {
  try {
    const updatedTrade = await Trade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTrade);
  } catch (err) {
    res.status(500).send(err);
  }
});

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { fullname, nationality, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ fullname, nationality, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).send(err);
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: 'User not registered' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err); // Log error for debugging
    res.status(500).send({ message: 'An error occurred during login' });
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
