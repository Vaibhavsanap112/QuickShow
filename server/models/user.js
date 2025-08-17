const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
   clerkId:{
    type:String,
     required:true,
     unique: true
  },
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  image:{
    type:String,
    required:true
  }

})

const User = mongoose.model("User",userSchema)

module.exports = User;