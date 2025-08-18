const { default: axios } = require("axios");
const Movie = require("../models/Movie");
const Show = require("../models/Show"); // <-- make sure this model exists

// API to get now playing movies
const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get("https://api.themoviedb.org/3/movie/now_playing", {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      },
    });

    const movies = data.results;
    res.json({ success: true, movies:movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to add a new show to database
const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    if (!movie) {
      // Fetch movie details and credits from TMDB API
      const [movieDetailsResponse, movieCreditResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }),
      ]);

      const movieDetails = movieDetailsResponse.data;
      const movieCredits = movieCreditResponse.data;

      const movieADetails = {
        _id: movieId,
        title: movieDetails.title,
        overview: movieDetails.overview,
        poster_path: movieDetails.poster_path,
        backdrop_path: movieDetails.backdrop_path,
        release_date: movieDetails.release_date,
        original_language: movieDetails.original_language,
        tagline: movieDetails.tagline || " ",
        genres: movieDetails.genres,
        casts: movieCredits.cast,
        vote_average: movieDetails.vote_average,
        runtime: movieDetails.runtime,
      };

      movie = await Movie.create(movieADetails);
    }

    // Prepare show entries
    const showsToCreate = [];
    showsInput.forEach((show) => {
      const showDate = show.date;
      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}:00`;
        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {}
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: "Show added successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNowPlayingMovies,
  addShow,
};
