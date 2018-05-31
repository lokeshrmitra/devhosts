const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
    name: String,
    prodid: String,
    type: String,
    price: Number
},{
    strict: false
});

mongoose.model('product', Product);
