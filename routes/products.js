const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const webpush = require('web-push');

//get the products module
require('../models/Product');
const Product = mongoose.model('product');
require('../models/Subscription');
const Subscription = mongoose.model('subscription');

webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  "BB-vYEM6B3wVD1JX4hYuuGoFJsLeRGMt7G8to6ZAyQyHHTwzUAk3AekCU7r_yRSL3xDEX2T1m9KJsraElv5icfk",
  "hKEheVRB2afntwIU1WtLnNusfEa2LI1luCwRBuYk_Jk"
);

router.post('/subs', (req,res)=>{
    const subObj = req.query.subscription;
    const email = req.query.email;

    new Subscription({
            email,
            subscription:subObj
        })
        .save()
        .then(
            () => {
                console.log("New user added");
                res.json({success:"User registered successfully"})
            },
            (err) => {
                console.log(err.message);
                res.json({message:"Server error: Can't register", error: err});
            }
        )
})

router.get('/subs', (req, res)=>{
    Subscription.find({})
    .then((subs)=>{
        res.json(subs);
    }, (err)=>{
        res.sendStatus(500);
    });
});

router.post('/subs/send', (req, res)=>{
    const email = req.query.email;
    Subscription.findOne({email})
    .then((sub)=>{
        webpush.sendNotification(sub, 'Hello from the other side');
        res.json({message:'push sent successfully', sub});
    }, (err)=>{
        res.json(err);
    });
});



//to get info of a single product
router.get('/:id', (req, res)=>{
    let prodid = req.params.id;
    Product.find({prodid: prodid}).select('-_id')
    .then((prod)=>{
        if(prod.length > 0)
            res.json(prod);
        else res.status(404).json({error: 'Invalid product ID'})
    },(err)=>{
        res.sendStatus(500);
    });
});

//to get info of all products
router.get('/', (req,res)=>{
    Product.find().select('-_id')
    .then((prod)=>{
        res.json(prod);
    },(err)=>{
        res.sendStatus(500);
    });
});

module.exports = router;
