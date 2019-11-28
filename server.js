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
const Vote = sequelize.define('vote', {
    value: {
        type: Sequelize.STRING
    }
}, {timestamps: false});

/////////////// For VOTES ///////////////

/// DEFAULT GET HERE ///
app.get('/api/votes', function (req, res) {

    Vote.findAll().then(votes => {
        res.json(votes)
    })
});

/// GET VOTE BY value ///
app.get('/api/votes/:value', function (req, res) {

    Vote.findAll({
        where: {
            value: req.params.value
        }
    }).then((votes) => votes ? res.json(votes) : res.status(404).json({error: 'no votes found'}))
});

/// PATH to reset votes ///
app.get('/api/reset', function (req, res) {

    Vote.destroy({
        where: {},
        truncate: true
      }).then(() => {
        for (let i = 0; i < 5; i++) {
            Vote.create({value: 'trebuchet'})
        }

        for (let i = 0; i < 5; i++) {
            Vote.create({value: 'catapult'})
        }

        return res.json({reset: 'ok'});
      });
});

/// POST NEW VOTE ///
app.post('/api/votes/', function (req, res) {

    Vote.create({
        value: req.body.value
    }).then((vote) => res.json(vote))
});

/// DELETE RECIPE ///
app.delete('/api/votes/:id', function (req, res) {

    Vote.destroy({
        where: {
            id: req.params.id
        }
    }).then((vote) => vote ? res.json(vote) : res.status(404).json({error: 'unknown vote wi id : ' + req.params.id}))
});

app.listen(9000);
console.log('Running on port 9000...');