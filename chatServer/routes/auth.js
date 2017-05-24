var express = require('express');
var router = express.Router();
var auth_model = require('../models/auth_model');
var bcrypt = require('bcrypt');
const saltRounds = 10;

// sign Up
router.post('/signup', (req, res) => {

  //check if user already existed
  auth_model.findOne({'email': req.body.email}).exec((err, data) => {
    if (err)
      return res.json(err)
    if (data) {
      return res.json({message: "already a member"})
    } else {
      //create a new user
      //hash the password
      bcrypt.hash(req.body.password, saltRounds).then((hash) => {
        var user = new auth_model()
        user.name = req.body.name;
        user.email = req.body.email;
        user.password = hash;

        user.save((err) => {
          if (err)
            res.json(err)
            // saved!
          res.json({message: "signed up successfully", status: true})
        })
      });

    }
  })

})

// signin
router.post('/signin', (req, res) => {

  auth_model.findOne({'email': req.body.email}).exec((err, data) => {
    if (data) {
      // compare hash from your password DB.
      bcrypt.compare(req.body.password, data.password, (err, result) => {
        // result == true
        if (result == true)
          res.json({message: "signed in successfully", id: data._id, name:data.name, status: true})
        else {
          res.json({message: "can't sign in"})
        }
      });
    }
    else res.json({message: "can't sign in"})
  })
})

module.exports = router;
