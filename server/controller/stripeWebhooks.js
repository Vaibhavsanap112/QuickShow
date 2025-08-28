const stripe = require("stripe")
const Booking = require("../models/Booking");
const { inngest } = require("../inngest");

 const stripeWebhooks = async (request , response)=>{
      const stripeInstance = new stripe(process.env.STRIPE_WEBHOOK_SECRET);
      const sig = request.headers["stripe-signature"]

      let event ;
      try{

        event = stripeInstance.webhooks.constructEvent(request.body , sig , process.env.STRIPE_WEBHOOK_SECRET)

      }catch(error){
        return response.status(400).send(`Webhook Error: ${error.message}`)

      }

      try{
        switch(event.type){
          case "payment_intent.succeeded":{
            const payment_intent = event .data.object;
            const sessionList = await stripeInstance.checkout.sessions.list({
              payment_intent: payment_intent.id
            })
            const session = sessionList.data[0];

            const {bookingId} =session.metadata;
            await Booking.findByIdAndUpdate(bookingId,{
              isPaid:true,
              paymentLink:""

            })

            // Send Confirmation Email
            await inngest.send({
              name:"app/show.booked",
              data:{bookingId}
            })
            break;

          }
          default:
            console.log("Unhadled event Type:",event.type)
        }
        response.json({received:true})

      }catch(error){
        console.log("webhook precessing error:",error)
        response.status(500).send("Internal Server Error");

      }
    }
module.exports= {stripeWebhooks};