const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
require("dotenv").config();

const port = process.env.PORT;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.jmbhoqf.mongodb.net/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define the main schema for the parent
const parentSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  children: [
    {
      name: String,
      age: Number,
      gender: String,
    },
  ],
});

// Create a model for the parent
const Parent = mongoose.model("Parent", parentSchema);

// API Routes

// Create a new parent registration
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, phone, children } = req.body;
    //console.log(req);
    const newParent = new Parent({ name, email, phone, children });
    const parent = await newParent.save();
    res.status(201).json(parent);
    //   console.log(res.data);
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Get all registered parents
app.get("/api/parents", async (req, res) => {
  try {
    const parents = await Parent.find();
    res.json(parents);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve parents" });
  }
});

app.get("/", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res
        .status(400)
        .json({ error: "Email is required in the query parameter." });
    }

    //   console.log(email);
    const isPresent = await Parent.findOne({ email: email });
    if (isPresent) {
      return res.status(409).json({ error: "Email already registered." });
    }
    return res.status(200).json({ message: "Proceed with registration" });
  } catch (error) {
    res.status(500).json({ error: "Failure in processing email search" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
