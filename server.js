var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var config = require('./config.js');

app.use(cors());

app.use(bodyParser.json());

//Connect to mySQL
const sequelize = new Sequelize(`mysql://${config.DB_USERNAME}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`, {sync: true});

//Let's checkout connection
sequelize
    .sync()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

//Init model (in this same file because it's a simple single page app)
const Song = sequelize.define('song', {
    title: {
        type: Sequelize.STRING
    },
    artist: {
        type: Sequelize.STRING
    },
    album_img_url: {
        type: Sequelize.STRING
    }
}, {timestamps: false});

/////////////// For VOTES ///////////////

/// DEFAULT GET HERE ///
app.get('/api/songs', function (req, res) {

    Song.findAll().then(songs => {
        res.json(songs)
    });
});

/// GET SONGS BY title ///
app.get('/api/songs/:title', function (req, res) {

    Song.findAll({
        where: {
            title: req.params.title
        }
    }).then((songs) => songs ? res.json(songs) : res.status(404).json({error: 'no songs found'}))
});

/// GET SONGS BY id ///
app.get('/api/songs/:id', function (req, res) {

    Song.findOne({
        where: {
            id: req.params.id
        }
    }).then((song) => song ? res.json(song) : res.status(404).json({error: 'no song found'}))
});

/// POST NEW SONG ///
app.post('/api/songs/', function (req, res) {

    Song.create({
        title: req.body.title,
        artist: req.body.artist,
        album_img_url: req.body.album_img_url
    }).then((song) => res.json(song))
});

/// DELETE SONG ///
app.delete('/api/songs/:id', function (req, res) {

    Song.destroy({
        where: {
            id: req.params.id
        }
    }).then((song) => song ? res.json(song) : res.status(404).json({error: 'unknown song with id : ' + req.params.id}))
});

app.listen(3000);
console.log('Running on port 3000...');