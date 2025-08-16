const { serve } = require("inngest/vercel");
const { inngest, functions } = require("../server/inngest/index");

module.exports = serve("MovieTicketBooking Inngest", functions);
