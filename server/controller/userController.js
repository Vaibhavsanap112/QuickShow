// Api controller function to get user bookings

const clerkClient = require("@clerk/express")
const Movie = require("../models/Movie")


const Booking = require("../models/Booking")



const getUserBookings = async (req, res) => {

  try {

    const bookings = await Booking.find({ user }).populate({
      path: "show",
      populate: { path: "movie" }
    }).sort({ createdAt: -1 })

    res.json({ success: true, bookings })

  } catch (error) {

    console.error(error.message)
    res.json({ success: false, message: error.message })


  }



}

// API controller function to update favourite movie in clerk user metadata

const updateFavorite = async (req,res)=>{
  try{
    const {movieId} = req.body;
    const userId  = req.auth().userId;

    const user = await clerkClient.users.getUser(userId)

    if(!user.privateMetadata.favorites){
      user.privateMetadata.favorites =[]
    }

    if(!user.privateMetadata.favorites.includes(movieId)){
      user.privateMetadata.favorites.push(movieId)
    }else{
       user.privateMetadata.favorites= user.privateMetadata.favorites.filter(itme=> item !== movieId)
    }

    await clerkClient.users.updateUserMetadata(userId, {privateMetadata:user.privateMetadata})

    res.json({success:true , message:"fav movie updated successfully"})
  }catch(error){
    console.error(error.message)
    res.json({ success: false, message: error.message })

  }
}

const getFavorites = async (req,res)=>{
  try{
const user = await clerkClient.users.getUsre(req.auth().userId)
const favorites = user.privateMetadata.favorites

// Get movies from database

const movies  = await Movie.find({_id:{$in: favorites}})
 res.json({ success: true, message: movies })

  }catch(error){

    console.error(error.message)
     res.json({ success: false, message: error.message })


  }
}

module.exports = {
  getFavorites,
   updateFavorite,
   getUserBookings
}