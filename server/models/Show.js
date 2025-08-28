const mongoose = require("mongoose")

 const showSchema = new mongoose.Schema({
   movie:{type:String,ref:"Movie", required:true},
   showDateTime:{type:Date,required:true},
   showPrice:{type:Number,required:true},
   occupiedSeats:{type:Object,default:{}}
 },{minimize:false})


 const Show = mongoose.model("Show",showSchema)

 module.exports = Show;