//  Functions to check availability of selected seats for a movie

const Booking = require("../models/Booking");
const Show = require("../models/Show")

const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {

    const data = await Show.findById(showId)
    if (!showData) return false;


    const occupiedSeats = showData.occupiedSeats;
    const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
    return !isAnySeatTaken
  } catch (error) {


    console.log(error.message)
    return false;
  }
}

const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();

    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;

    // Check if the seat is available for selected show


    const isAvailable = await checkSeatsAvailability(showId, selectedSeats)
    if (!isAvailable) {
      return res.json({ success: false, message: "Selected Seaat are not available" })
    }
    // get the show details
    const showData = await Show.findById(showId).populate('movie');
    // create a new booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats

    })

    selectedSeats.mapp((seat) => {
      showData.occupiedSeats[seat] = userId;
    })
    showData.markModified('occupiedSeats')

    await showData.save();

    //  Stripe Gateway Initialize

    res.json({ success: true, message: "booked successesfully" })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}

const getOccupiedSeats = async (req,res)=>{
  try{
    const {showId} = req.params;
    const showData = await Show.findById(showId)

    const occupiedSeats = Object.keys(showData.occupiedSeats)

     res.json({ success: true,occupiedSeats })
  }catch(error){

    console.log(error.message)
    res.json({ success: false, message: error.message })
  }

  
}
module.exports={ 
  createBooking ,
   getOccupiedSeats 

}