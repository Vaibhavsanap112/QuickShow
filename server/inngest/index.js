const { Inngest } = require("inngest");
const User = require("../models/user");
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const sendEmail = require("../configs/nodeMailer");
const { set } = require("mongoose");

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

// Inneges FUnctions to send the reminder

const sendShowReminders = inngest.createFunction(
  { id: "send-show-reminders" },
  { cron: "0 */8 * * *" },
  async ({ step }) => {
    const now = new Date();
    const in8Hours = new Date(now.getTime() + 8 * 60 * 1000);
    const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000)

    // Prepare reminder tasks
    const reminderTask = await step.run("prepare-reminder-tasks", async () => {
      const shows = await Show.find({
        showTime: { $gte: windowStart, $lte: in8Hours }
      }).populate("movie");
      const tasks = [];
      for (const show of shows) {
        if (!show.movie || !show.occupiedSeats) continue;
        const userIds = [...new set(Object.values(show.occupiedSeats))]
        if (userIds.length === 0) continue;

        const users = await User.find({ _id: { $in: userIds } }).select("name email");

        for (const user of users) {
          task.push({
            userEmail: user.email,
            userName: show.movie.title,
            showTime: show.showTime,
          })
        }

      }
      return tasks;
    })
    if (reminderTask.length === 0) {
      return { sent: 0, message: "No reminders to send." }
    }
    //  send reminder emails

    const results = await step.run('send-all-reminders', async () => {
      return await Promise.allSettled(
        reminderTask.map(task => sendEmail({
          to: task.userEmail,
          subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
          body: `<div style="font-family: Arial, sans-serif; padding: 10px;">
  <h2>Hello ${task.userName},</h2>
  <p>This is a quick reminder that your movie:</p>
  <h3 style="color: #F84565;">${task.movieTitle}</h3>
  <p>
    is scheduled for 
    <strong>${new Date(task.showTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}</strong> 
    at 
    <strong>${new Date(task.showTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</strong>.
  </p>
  <p>It starts in approximately <strong>8 hours</strong> - make sure you're ready!</p>
  <br/>
  <p>Enjoy the show!<br/>QuickShow Team</p>
</div>
`
        }))
      )
    })

    const sent = results.filter(r => r.status === "fulfilled").length;
    const failed = results.length - sent;

    return {
      sent,
      failed,
      message: `Sent ${sent} reminder(s), ${failed} failed.`
    }
  }
)
// Innegest function to send notificatin when a new show is added

const sendNewShowNotifications = inngest.createFunction(
  { id: "send-new-show-notification" },
  { event: "app/show.added" },
  async ({ event }) => {
    const { movieTitle } = event.data;
    const users = await User.find({})

    for (const user of users) {
      const userEmail = user.email;
      const userName = user.name;
      const subject = `New Show Added: ${movieTitle}`;

      const body = `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Hi ${userName},</h2>
  <p>We've just added a new show to our library:</p>
  <h3 style="color: #F84565;">${movieTitle}</h3>
  <p>Visit our website</p>
  <br/>
  <p>Thanks,<br/>QuickShow Team</p>
</div>
`;

 await sendEmail({
      to:userEmail,
      subject,
      body,
      
    })

    }

    return {message: "Notification sent."}
   

  }
)
const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releseSeatsAndDeleteBooking, sendBookingConfirmationEmail, sendShowReminders,sendNewShowNotifications];

module.exports = { inngest, functions };
