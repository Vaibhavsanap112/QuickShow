const express = require("express");
const { createBooking, getOccupiedSeats } = require("../controller/bookingController");

const bookingRouter = express.Router();

bookingRouter.post('/create',createBooking);
bookingRouter.get('/seats/:showId',getOccupiedSeats);

module.exports = bookingRouter


