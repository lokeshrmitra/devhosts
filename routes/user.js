const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//const passport = require('passport');
const jwt = require('jsonwebtoken');


//bring the UserSchema model
require('../models/User');//now available thoughout the app
const User = mongoose.model('user');
//products modules
require('../models/Product');
const Product = mongoose.model('product');
//get JWT verifier
const myV = require('../helpers/auth');

/*
jwt.verify(req.token,'keyboard dog', (err, data)=>{
        if(err)res.sendStatus(401);
        else{
            
        }
    });
*/ 

//get cart data
router.get('/cart', (req, res)=>{
    User.findOne({email:'lokeshrmitra@gmail.com'})
    .then((user)=>{
        if(user.cart.length > 0){
            let prodids = [];
            for(var i=0;i<user.cart.length;i++){
                prodids.push(user.cart[i].prodid);
            }
            console.log(prodids);
            Product.find({prodid: {$in:prodids} })
            .then((products)=>{
                res.json(products);
            },(err)=>{
                res.sendStatus(500);
                consoe.log(err);
            });
        }else{
            res.send('none found');
        }
    })
});

//purchase the product = remove all items from cart, add to order_history
router.post('/order', (req, res)=>{
    User.findOne({email: 'lokeshrmitra@gmail.com'})
    .lean()
    .then((user)=>{
        let myCart = user.cart;
        if(myCart.length <= 0) return res.sendStatus(403);
        for(var i=0; i<myCart.length; i++){
            myCart[i].iat = Date.now();
        }
        
        User.update(
            {email:'lokeshrmitra@gmail.com'},
            {$set : {cart : []},
             $push :{
                 order_history : {
                     $each: myCart
                 }
             }
            },
            {new : true},
            (err, doc)=>{
                if(err){
                    res.sendStatus(500);
                    console.error(err);
                }
                else res.json({success: 'Cart checked out'});
            }
        )
    });
});

//add a prod to user cart body data=id,no
router.post('/cart', (req, res)=>{
    let no_of_months=1;
    if(req.body.id != null){
        if(req.body.no_of_months != null) no_of_months = parseInt(req.body.no_of_months+'');
        Product.findOne({prodid: req.body.id})
        .then((prod)=>{
            if(prod != null){
                User.update(
                    {email : 'lokeshrmitra@gmail.com'},
                    {$push: {
                        cart:{
                            prodid: prod.prodid,
                            no_of_months,
                        }
                    }
                }).then((info)=>{
                    if(info.ok == 1)
                        res.json({success: `Prod of id ${req.body.id} added to cart`});
                });
            }else res.sendStatus(503);
        }, (err)=>{
            res.sendStatus(500);
            console.log(err);
        });
    }
});

//get user information
router.get('/', myV.verifyJWT,  (req,res)=>{
    jwt.verify(req.token,'keyboard dog', (err, data)=>{
        if(err)res.sendStatus(401);
        else{
            User.findOne({email: data.email})
            .select('-_id name email age address')
            .then((myUser)=>{                            
                res.json(myUser);
            }, (err)=>{
                res.sendStatus(500);
                console.log(err);
            });
        }
    });
})

//update user info. Name, age, address can be update but not email/password
router.put('/',myV.verifyJWT ,(req, res)=>{
    jwt.verify(req.token,'keyboard dog', (err, data)=>{
        if(err)res.sendStatus(401);
        else{
            User.update({email: data.email},{ $set:{
                name: req.body.name,
                age: req.body.age,
                address: req.body.address
            }}).then((response)=>{
                if(response.ok === 1)
                    res.json({success: `User ${req.body.name} updated`});
                else
                    res.sendStatus(500);                
            },(err)=>{
                res.sendStatus(500);
            });
        }
    });
});

//delete the user. Email taken from JWT payload
router.delete('/', myV.verifyJWT, (req,res)=>{
    jwt.verify(req.token, 'keyboard dog', (err, authData)=>{
        if(err) res.status(401).json(err);
        else{
            User.findOne({email:authData['email']})
            .then((user)=>{
                if(user != null){
                    User.remove({email: user.email})
                    .then(()=>{
                        res.json({success: `User with email:${user.email} deleted`});
                    });
                }
            });
        }
    });
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
                            jwt.sign({email: user.email}, 'keyboard dog',{expiresIn:'1h'} ,(err, token)=>{
                                if(err) res.status(401).json(err);
                                else{
                                    res.json({
                                        success: "Logged in successfully",
                                        token
                                    });
                                }                                
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
                                password : hash,
                                age: req.body.age,
                                address: req.body.address
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