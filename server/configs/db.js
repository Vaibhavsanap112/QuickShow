const mongoose = require("mongoose");
const protectAdmin = require("../middleware/auth");
const { isAdmin, getAllShows, getAllBookings } = require("../controller/adminController");

const { clerkClient } = require("@clerk/express");
console.log("MONGODB_URL:", process.env.MONGODB_URL);


const connectDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "quickshow",       // specify database name explicitly
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

 // remove parentheses
   
    

    console.log("✅ Database Connected");
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    process.exit(1); // stop app if DB connection fails
  }
};

// Export the function
module.exports = connectDB;
