const { Inngest } = require("inngest");
const User = require("../models/user");
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const sendEmail = require("../configs/nodeMailer");

// Create a client
const inngest = new Inngest({ id: "movie-ticket-booking" });

// Functions
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        clerkId: id,
        email: email_addresses?.[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        image: image_url,
      };

      const user = await User.create(userData);
      console.log("✅ User synced to DB:", user);
    } catch (err) {
      console.error("❌ Error syncing user:", err);
    }
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;
      const deletedUser = await User.findOneAndDelete({ clerkId: id });
      if (deletedUser) console.log("🗑️ User deleted from DB:", id);
      else console.log("⚠️ User not found in DB for deletion:", id);
    } catch (err) {
      console.error("❌ Error deleting user:", err);
    }
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const userData = {
        email: email_addresses?.[0]?.email_address || "",
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        image: image_url,
      };

      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },
        userData,
        { new: true }
      );
      if (updatedUser) console.log("♻️ User updated in DB:", updatedUser);
      else console.log("⚠️ User not found in DB for update:", id);
    } catch (err) {
      console.error("❌ Error updating user:", err);
    }
  }
);

// Inngest functionto cancel booking and release seats of show after 10 min of booking created if payment is not made

const releseSeatsAndDeleteBooking = inngest.createFunction(
  { id: 'release-seats-delete-booking' },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil('wait-for-10-minutes', tenMinutesLater)

    await step.run('check-payment-status', async () => {
      const bookingId = event.data.bookingId;

      const booking = await Booking.findById(bookingId)

      // If payment is not pade relase seats and delete booking

      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);

        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat]
        })
        show.markModified('occupiedSeats')
        await show.save()
        await Booking.findByIdAndDelete(booking._id)
      }
    })

  }
)

// Inngest Function to send emial when user books a show

const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },
  async ({ event, step }) => {
    const { bookingId } = event.data;

    const booking = await Booking.findById(bookingId).populate({
      path: "show",
      populate: { path: "movie", model: "Movie" }
    }).populate('user');

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
  <h2>Hi ${booking.user.name},</h2>
  <p>Your booking for <strong style="color: #F84565;">${booking.show.movie.title}</strong> is confirmed.</p>
  <p>
    <strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}<br/>
    <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}
  </p>
  <p>Enjoy the show! 🍿</p>
  <p>Thanks for booking with us!<br/>— QuickShow Team</p>
</div>
`
    })
  }

)

const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releseSeatsAndDeleteBooking , sendBookingConfirmationEmail];

module.exports = { inngest, functions };
