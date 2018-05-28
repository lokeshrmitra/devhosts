const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//require('../models/User'); no need to bring it here
const User = mongoose.model('user');


module.exports = function(passport){//passport object passed in app.js to setup the 'local' startegy
    passport.use(new LocalStrategy(
        {usernameField:'email'}, (email, password, done)=>{
            User.findOne({email:email})
            .then(
                (user) =>{
                    if(!user){//invalid email login

                    }else{//comapare password
                        bcrypt.compare(password, user.password, (err, isMatch)=>{
                            if(err) throw err;
                            if(isMatch){
                                return done(null, user);//session var req.user
                            }else{
                                return done(null, false, {message:'Incorrect password'});
                            }
                        });
                    }
                }
            )
        })
    );
}

