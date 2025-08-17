const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "quickshow",       // specify database name explicitly
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Database Connected");
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    process.exit(1); // stop app if DB connection fails
  }
};

// Export the function
module.exports = connectDB;
