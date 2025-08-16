const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log(" Database Connected")
    );

    await mongoose.connect(`${process.env.MONGODB_URL}/quickshow`);
  } catch (error) {
    console.log(" DB Error:", error.message);
  }
};

module.exports = connectDB; 
