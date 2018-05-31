const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//get the products module
require('../models/Product');
const Product = mongoose.model('product');

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
