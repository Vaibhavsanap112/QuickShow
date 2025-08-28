const express = require("express");
const protectAdmin = require("../middleware/auth");
const { isAdmin, getAllShows, getAllBookings, getDashboardData } = require("../controller/adminController");

const adminRouter = express.Router();

adminRouter.get('/is-admin', protectAdmin ,isAdmin)
adminRouter.get("/dashboard" , getDashboardData)
adminRouter.get('/all-shows', protectAdmin ,getAllShows)
adminRouter.get('/all-bookings', protectAdmin ,getAllBookings)


module.exports =adminRouter;