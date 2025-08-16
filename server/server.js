const express = require("express");
const app = express();
const connectDB = require("./configs/db")
const cors = require("cors")
require ("dotenv").config();
const {serve}  = require("inngest/express")
const {inngest, functions} = require("./inngest/index")
const {clerkMiddleware} = require("@clerk/express")
app.use(clerkMiddleware())


app.use(express.json())
 connectDB()

app.get("/",function(req,res){
  res.send("Server is live")
})


app.use('/api/inngest', serve({ client: inngest, functions }));

app.listen(3000,()=>{
  console.log("server is live on port number 3000")
})