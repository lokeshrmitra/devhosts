const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//const passport = require('passport');
const jwt = require('jsonwebtoken');


//bring the UserSchema model
require('../models/User');//now available thoughout the app
const User = mongoose.model('user');
//get JWT verifier
const myV = require('../helpers/auth');

//protected route test
router.get('/prot', myV.verifyJWT, (req, res)=>{
    jwt.verify(req.token, 'keyboard dog', (err, authData)=>{
        if(err) res.sendStatus(401).json(err);
        else{
            res.json(authData);
        }
    })
});

//login route
router.post('/login', (req,res)=>{
    User.findOne({email:req.body.email})
        .then(
            (user) =>{
                if(!user){//invalid email login
                    res.json({error: "Email address not found"});
                }else{//comapare password
                    bcrypt.compare(req.body.password, user.password, (err, isMatch)=>{
                        if(err) throw err;
                        if(isMatch){
                            jwt.sign({email: user.email}, 'keyboard dog',{expiresIn:'3h'} ,(err, token)=>{
                                res.json({
                                    success: "Logged in successfully",
                                    token
                                });
                            });
                        }else{
                            res.json({
                                error: "Incorrect password"
                            });
                        }
                    });
                }
            }
        ),
        (err)=>{
            res.sendStatus(500).json({error: "DB error"});
        }
});

//name, email, password all required
router.post('/register', (req,res) => {
    if(req.body.name != null && req.body.email != null && req.body.password != null){
        User.findOne({email:req.body.email})
        .then(
            (user) => {
                if(user != null){
                    res.json({error:"User already registered"});
                }else{
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            if(err) {
                                res.json({error:"Server error"});
                                throw err;                                
                            }
                            new User({
                                name : req.body.name,
                                email : req.body.email,
                                password : hash
                            })
                            .save()
                            .then(
                                () => {
                                    console.log("New user added");
                                    res.json({success:"User registered successfully"})
                                },
                                (err) => {
                                    console.log(err.message);
                                    res.json({message:"Server error: Can't register"});
                                }
                            )     
                        });
                    });                                     
                }
            },
            (err) => {
                res.json({error:"Server error: DB error"});
            }
        )
    }else{
        res.json({error:"Empty fields passed"});
    }

});

module.exports = router;