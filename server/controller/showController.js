// controllers/movieController.js
const axios = require('axios');
const Movie = require("../models/Movie");
const Show = require('../models/Show');
const { inngest } = require('../inngest');

const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
      headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
    })

    const movies = data.results;
    res.json({ success: true, movies: movies })

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message })

  }
}

// Api to add new show to database


const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;
    let movie = await Movie.findById(movieId)

    if (!movie) {
      // fetch movie details from TMDB api

      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`
https://api.themoviedb.org/3/movie/${movieId}`,
          {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
          }),
        axios.get(`
https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
        })
      ])
      const movieApiData = movieDetailsResponse.data;
      const movieCreditData = movieCreditsResponse.data;


      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditData.casts,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime

      }

      // Add movie to the database
      movie = await Movie.create(movieDetails);




    }
    const ShowsToCreate = [];
    showsInput.forEach(show => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;
        ShowsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {}
        })
      })

    });

    if (ShowsToCreate.length > 0) {
      await Show.insertMany(ShowsToCreate)
    }


    // Trigger inngest event
    await inngest.send({
      name:"app/show.added",
      data:{movieTitle:movie.title}
    })
    
    res.json({ success: true, message: "Show Added successfully" })



  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message })

  }
}

// API to get all shows from database

const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie').sort({ showDateTime: 1 });

    // filter unque shows

    const uniqueShows = new Set(shows.map(show => show.movie))
    res.json({ success: true, shows: Array.from(uniqueShows) })
  } catch (error) {

    console.log(error)
    res.json({ success: false, message: error.message })
  }
}


// Api to get Single show from database

const getShow = async (req,res)=>{
  try{

    const {movieId}= req.params;
    const shows = await Show.find({movie:movieId, showDateTime:{$gte:new Date()}})

    const movie = await Movie.findById(movieId);
    const dateTime = {}

    shows.forEach((show)=>{
      const date = show.showDateTime.toISOString().split("T"[0]);
      if(!dateTime[date]){
        dateTime[date]=[]
      }
      dateTime[date].push({time:show.showDateTime,showId:show._id})
    })
    res.json({success:true,movie,dateTime})

  }catch(error){

       console.log(error)
    res.json({ success: false, message: error.message })

  }
}


module.exports = {
  getNowPlayingMovies,
  addShow,
  getShows,
  getShow

};
