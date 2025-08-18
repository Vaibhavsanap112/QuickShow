const mongoose = require("mongoose")

 const showSchema = new mongoose.Schema({
   movie:{type:mongoose.Schema.Types.ObjectId,ref:"Movie"},
   showDateTime:{type:Date,required:true},
   showPrice:{type:Number,required:true},
   occupiedSeats:{type:Object,required:true}
 },{minimize:false})


 const Show = mongoose.model("Show",showSchema)

 module.exports = Show;