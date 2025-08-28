// auth.js
const { clerkClient } = require("@clerk/express");

const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth; // remove parentheses
    const user = await clerkClient.users.getUser(userId);
    console.log("req.auth:", req.auth);

    console.log(user.privateMetadata.role)

    if (user.privateMetadata.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    next();
  } catch (error) {
    return res.json({ success: false, message: "Not authorized" });
  }
};

module.exports = protectAdmin ;