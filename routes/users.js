const express = require('express');
const router = express.Router();
const expressValidator = require('express-validator');
const passport = require('passport');
const uuidv4 = require('uuid/v4');
const bcrypt = require('bcryptjs');

const User = require('../models/user');

router.post(
  '/register',
  [
    expressValidator
      .check('name')
      .not()
      .isEmpty()
      .withMessage('Name is required'),
    expressValidator
      .check('email')
      .not()
      .isEmpty()
      .withMessage('Email is required'),
    expressValidator
      .check('email')
      .isEmail()
      .withMessage('Email is not valid'),
    expressValidator
      .check('username')
      .not()
      .isEmpty()
      .withMessage('Username is required'),
    expressValidator
      .check('password')
      .not()
      .isEmpty()
      .withMessage('Password is required')
  ],
  (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    const resjson = {};

    let errors = expressValidator.validationResult(req);
    if (errors.errors.length) {
      //console.log(errors.errors);
      resjson.err = 'Email is not Valid';
      resjson.success = false;
      resjson.user = null;
      res.json(resjson);
    } else {
      User.countDocuments({ userName: username }, (err, count) => {
        if (count != 0) {
          resjson.err = 'Username Is Taken';
          res.json(resjson);
        } else {
          createUser(req, res);
        }
      });
    }
  }
);

function createUser(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  const resjson = {};

  let newUser = new User({
    uuid: uuidv4(),
    name: name,
    email: email,
    userName: username,
    password: password
  });
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      if (err) {
        console.log(err);
      }
      newUser.password = hash;
      newUser.save(function(err) {
        if (err) {
          console.log(err);
          return;
        } else {
          resjson.success = true;
          resjson.user = newUser;
          res.json(resjson);
        }
      });
    });
  });
}

// Login Process
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.json({ err: info.err });
      return;
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      res.json({ success: true, user: user, err: 'Success' });
    });
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.json({ success: true });
});

module.exports = router;
