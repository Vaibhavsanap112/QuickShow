const express = require('express');
const { getNowPlayingMovies, addShow } = require('../controller/showController');
const showRouter = express.Router();

showRouter.get('/now-playing',getNowPlayingMovies)

showRouter.post('/add',addShow)

module.exports = showRouter;
