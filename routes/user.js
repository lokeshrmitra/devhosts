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

//get purchase history
router.get('/order', myV.verifyJWT, (req,res)=>{
    jwt.verify(req.token,'keyboard dog', (err, data)=>{
        if(err)res.sendStatus(401);
        else{
            User.findOne({email: data.email}).lean()
            .then((user)=>{
                if(user.order_history.length > 0){
                    let hist = user.order_history;
                    let monthly_total = 0;
                    for(var i=0;i<hist.length;i++){
                        if(hist[i].status == "Active")                        
                            monthly_total += hist[i].price;
                    }
                    res.json({
                        monthly_total,
                        order_history:hist
                    });
                }else{
                    res.json({error: 'No purchase history found'});
                }
            },(err)=>{
                console.log(err);
            });     
        }
    });
});

//get cart data
router.get('/cart', myV.verifyJWT, (req,res)=>{
    jwt.verify(req.token,'keyboard dog', (err, data)=>{
        if(err)res.sendStatus(401);
        else{
            User.findOne({email:data.email})
            .then((user)=>{
                if(user.cart.length > 0){
                    let cart_total = 0;
                    for(var i=0;i<user.cart.length;i++){
                        cart_total += user.cart[i].price;
                    }
                    res.json({
                        cart_total,
                        cart: user.cart
                    })
                }else{
                    res.json({error: 'Cart empty'});
                }
            })     
        }
    });
});

//inactivate a product from the oreder_history
router.put('/order/:id', myV.verifyJWT, (req,res)=>{
    jwt.verify(req.token,'keyboard dog', (err, data)=>{
        if(err)res.sendStatus(401);
        else{
            User.update(
                {email: data.email, "order_history.prodid": req.params.id},
                {
                    $set:{
                        "order_history.$.status": "Inactive",
                        "order_history.$.inactivation_date": Date.now()
                    }
                },
                (err, doc)=>{
                    if(err){
                        res.sendStatus(503);
                        console.log(err);
                    }else{
                        res.json({success: `Product ${req.params.id} Inactivated`});
                    }
                }
            );     
        }
    });
});

//order only a single item from cart (params.id = cart's product id)
router.post('/order/:id', myV.verifyJWT, (req,res)=>{
    /*Some gateway receipt or token to be checked before actually ordering
    * if(!verifyReceipt(req.body.receipt)) return
    */
    jwt.verify(req.token,'keyboard dog', (err, data)=>{
        if(err)res.sendStatus(401);
        else{
            User.findOne({email: data.email})
            .lean()
            .then((user)=>{
                let singleItem = null;
                for(var i=0;i<user.cart.length;i++){
                    if(user.cart[i].prodid == req.params.id){
                        singleItem = user.cart[i];
                        singleItem.iat = Date.now();
                        singleItem.status = "Active";                        
                    }
                }
                if(singleItem == null) return res.status(400).json({error: 'Invalid product id from cart'});
                User.update(
                    {email:data.email},
                    {$pull : {cart : {
                        prodid: singleItem.prodid
                    }},
                     $push :{
                         order_history : singleItem
                     }
                    },            
                    (err, doc)=>{
                        if(err){
                            res.sendStatus(500);
                            console.error(err);
                        }
                        else res.json({success: `Cart item ${req.params.id} checked out`});
                    }
                )
            });    
        }
    });
});

//order entire cart, remove all items from cart, add to order_history
router.post('/order', myV.verifyJWT, (req,res)=>{
    /*Some gateway receipt or token to be checked before actually ordering
    * if(!verifyReceipt(req.body.receipt)) return
    */
    jwt.verify(req.token,'keyboard dog', (err, data)=>{
        if(err)res.sendStatus(401);
        else{
            User.findOne({email: data.email})
            .lean()
            .then((user)=>{
                let myCart = user.cart;
                if(myCart.length <= 0) return res.status(403).json({error: 'No items in cart'});
                for(var i=0; i<myCart.length; i++){
                    myCart[i].iat = Date.now();
                    myCart[i].status = "Active";
                }
                
                User.update(
                    {email:data.email},
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
        }
    });
});

//delete prod from cart w/o purchasing
router.delete('/cart/:id', myV.verifyJWT, (req, res)=>{
    jwt.verify(req.token,'keyboard dog', (err, data)=>{
        if(err)res.sendStatus(401);
        else{
            User.update(
                {email: data.email},
                {
                    $pull: {
                        cart:{
                            prodid: req.params.id
                        }
                    }
                },
                (err, doc)=>{
                    if(err)res.sendStatus(501);
                    else res.json({success: `Product ${req.params.id} removed`});
                }
            );
        }
    });
});

//empty entire cart w/o purchasing
router.delete('/cart', myV.verifyJWT, (req, res)=>{
    jwt.verify(req.token,'keyboard dog', (err, data)=>{
        if(err)res.sendStatus(401);
        else{
            User.update(
                {email: data.email},
                {
                    $set: {
                        cart: []
                    }
                },
                (err, doc)=>{
                    if(err)res.sendStatus(501);
                    else res.json({success: `Cart emptied`});
                }
            );
        }
    });
});

//add a prod to user cart body data=id,no
router.post('/cart/:id', myV.verifyJWT, (req,res)=>{
    jwt.verify(req.token,'keyboard dog', (err, data)=>{
        if(err)res.sendStatus(401);
        else{
            User.findOne({email:data.email})
            .then((user)=>{
                for(var i=0;i<user.cart.length;i++){
                    if(user.cart[i].prodid == req.params.id) {
                        return res.json({error: 'Product already added to cart'});             
                    }
                }
                for(var i=0;i<user.order_history.length;i++){
                    if(user.order_history[i].prodid == req.params.id && user.order_history[i].status == "Active" ){
                        return res.json({error: 'Product already ordered'});
                    }
                }
                Product.findOne({prodid: req.params.id})
                .then((prod)=>{
                    if(prod != null){
                        User.update(
                            {email : data.email},
                            {$push: {
                                cart:{
                                    prodid: prod.prodid,
                                    name: prod.name,
                                    price : prod.price
                                    }
                                }
                            },
                            (errr, doc)=>{
                                if(errr){
                                    res.sendStatus(501);
                                    console.log(err);
                                }else{
                                    res.json({success: `Prod of id ${req.params.id} added to cart`});
                                }
                            });                        
                    }else res.status(500).json({error: 'Inavild product id'});
                }, (err)=>{
                    res.sendStatus(500);
                    console.log(err);
                });    
            });
             
        }
    });    
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
            User.update(
                {email: data.email},
                { $set:{
                    name: req.body.name,
                    age: req.body.age,
                    address: req.body.address
                    }
                },(err,doc)=>{
                    if(err)res.sendStatus(500);
                    else res.json({success: `User ${req.body.name} updated`});
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
                    },(err)=>{
                        res.sendStatus(500);
                    });
                }
            },(err)=>{
                res.sendStatus(500);
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
                            jwt.sign({email: user.email}, 'keyboard dog',{expiresIn:'2h'} ,(err, token)=>{
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
