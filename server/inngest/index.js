const { Inngest } = require("inngest");
const User = require("../models/user");
const Booking = require("../models/Booking");
const Show = require("../models/Show");

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
  {id:'release-seats-delete-booking'},
  {event:"app/checkpayment"},
  async ({event , step})=>{
    const tenMinutesLater = new Date(Date.now()+10*60*1000);
    await step.sleepUntil('wait-for-10-minutes', tenMinutesLater)

    await step.run('check-payment-status', async()=>{
      const bookingId = event.data.bookingId;

      const booking = await Booking.findById(bookingId)

      // If payment is not pade relase seats and delete booking

      if(!booking.isPaid){
        const show = await Show.findById(booking.show);

        booking.bookedSeats.forEach((seat)=>{
          delete show.occupiedSeats[seat]
        })
        show.markModified('occupiedSeats')
        await show.save()
        await Booking.findByIdAndDelete(booking._id)
      }
    })

  }
)

const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releseSeatsAndDeleteBooking];

module.exports = { inngest, functions };
