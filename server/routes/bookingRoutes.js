const express = require("express");
const { createBooking, getOccupiedSeats } = require("../controller/bookingController");
const { getAllBookings } = require("../controller/adminController");
const { getUserBookings } = require("../controller/userController");

const bookingRouter = express.Router();

bookingRouter.post('/create',createBooking);
bookingRouter.get('/seats/:showId',getOccupiedSeats);
bookingRouter.get("/bookings",getUserBookings)

module.exports = bookingRouter


