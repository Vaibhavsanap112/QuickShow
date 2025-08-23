const express = require("express");
const { getUserBookings, updateFavorite, getFavorites } = require("../controller/userController");
const { useReducer } = require("react");
const userRouter = express.Router();

userRouter.get("/bookings",getUserBookings)
userRouter.post("/update-favorite",updateFavorite)
userRouter.get("/favorite",getFavorites)
module.exports = userRouter