const express = require("express");
const app = express();
const connectDB = require("./configs/db")
const cors = require("cors")
require ("dotenv").config();

app.use(express.json())
connectDB()

app.get("/",function(req,res){
  res.send("Server is live")
})

app.listen(3000,()=>{
  console.log("server is live on port number 3000")
})