const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


//bring the UserSchema model
require('../models/User');
const User = mongoose.model('user');

//name, email, password all required
router.post('/register', (req,res) => {
        User.findOne({email:req.body.email})
        .then(
            (user) => {
                if(user != null){
                    res.send('User already registered');
                }else{
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            if(err) throw err;
                            new User({
                                name : req.body.name,
                                email : req.body.email,
                                password : hash
                            })
                            .save()
                            .then(
                                () => res.send("User added"),
                                (err) => res.send(err.message)
                            )     
                        });
                    });                                     
                }
            },
            (err) => res.send(err.message)
        )
    
});

module.exports = router;