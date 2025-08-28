const express = require("express");
require ("dotenv").config();
const app = express();
const connectDB = require("./configs/db")
const cors = require("cors")

const {serve}  = require("inngest/express")
const {inngest, functions} = require("./inngest")
const {clerkMiddleware} = require("@clerk/express");
const Show = require("./models/Show");
const showRouter = require("./routes/showRoutes");
const  bookingRouter  = require("./routes/bookingRoutes");
const adminRouter = require("./routes/adminRoutes");
const userRouter = require("./routes/userRoutes");
const { stripeWebhooks } = require("./controller/stripeWebhooks");
app.use(clerkMiddleware())

app.use(cors({
  origin: "http://localhost:5173",  // your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json())
 connectDB()

app.use('/api/stripe', express.raw({type:'application/json'}) , stripeWebhooks)




app.get("/",function(req,res){
  res.send("Server is live")
})
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/show', showRouter);
app.use("/api/booking",bookingRouter)
app.use("/api/admin", adminRouter)
app.use('/api/user', userRouter)


app.listen(3000,()=>{
  console.log("server is live on port number 3000")
})