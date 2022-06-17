const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//bring in user model
const User = require('../models/User.js');

module.exports = function(passport) {
    passport.use(
        new localStrategy({ usernameField : 'email'}, (email, password, done) => {
            //match user
            User.findOne({ email : email})
            .then(user => {
                if(!user) {
                    return done(null, false, {message: 'The email you provided is not registered'});
                }

                //compare password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                   if(err) throw err;
                   
                   // if a user details provided from the login form match details already stored in the database
                   if(isMatch) {
                       return done(null, user)
                   }
                   //if user is found but the password is no match
                   else {
                     return done(null, false, {message : 'You entered an incorrect password'});
                   }
                });
            }
            )
            .catch(err => console.log(err));
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
          done(err, user);
        });
      });
}