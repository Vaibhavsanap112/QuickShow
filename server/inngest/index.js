const Inngest = require("inngest");
const User  = require("../models/User")

// Create a client to send and receive events
const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      clerkId: id, // safer than using _id
      email: email_addresses?.[0]?.email_address || "",
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      image: image_url,
    };

    await User.create(userData);
    console.log("✅ User synced to DB:", userData);
  }
);
// Inngest function to delete the user from database

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {

    const {id}= event.data
    await User.findByIdAndDelete(id)

    await User.create(userData);
    console.log("✅ User synced to DB:", userData);
  }
);

// Update the user data 

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
     const { id, first_name, last_name, email_addresses, image_url } = event.data;
       const userData = {
      clerkId: id, // safer than using _id
      email: email_addresses?.[0]?.email_address || "",
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      image: image_url,
    };
    await User.findByIdAndUpdate(id,userData)

  }
);

// Export functions
const functions = [syncUserCreation,syncUserDeletion,syncUserUpdation];

module.exports = { inngest, functions };
