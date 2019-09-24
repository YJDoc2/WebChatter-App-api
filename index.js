const express = require('express');
const request = require('request');
const cors = require('cors');

const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

const app = express();
const mongoose = require('mongoose');

const config = require('./config/mongodb');
const PORT = process.env.PORT || 3000;

mongoose.connect(config.database);
let db = mongoose.connection;

// Check connection
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err) {
  console.log(err);
});
/*app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8100/');
  res.header('Access-Control-Allow-Credential', true);
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
//app.use(cors());
//app.use(cors({ origin: true, credentials: true }));*/
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8100'); // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.use(cors({ origin: true, credentials: true }));

app.use(
  session({
    secret: 'AaryaSA',
    resave: true,
    saveUninitialized: false,
    ephemeral: true
  })
);

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

let users = require('./routes/users');
app.use('/users', users);

let api = require('./routes/api');
app.use('/api', api);

app.listen(PORT, () => {
  console.log('Server listening on port 3000...');
});
