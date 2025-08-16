const { Inngest } = require("inngest");
const User = require("../models/User");

// Create a client
const inngest = new Inngest({ id: "movie-ticket-booking" });

// Functions
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      clerkId: id,
      email: email_addresses?.[0]?.email_address || "",
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      image: image_url,
    };

    await User.create(userData);
    console.log("✅ User synced to DB:", userData);
  }
);

const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findOneAndDelete({ clerkId: id });
    console.log("🗑️ User deleted from DB:", id);
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      email: email_addresses?.[0]?.email_address || "",
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      image: image_url,
    };

    await User.findOneAndUpdate({ clerkId: id }, userData, { new: true });
    console.log("♻️ User updated in DB:", userData);
  }
);

const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];

module.exports = { inngest, functions };
