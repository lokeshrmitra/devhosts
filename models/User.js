const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name : {
        type: String,
        required : true
    },
    email : {
        type: String,
        required : true
    },
    address:{
        type: String
    },
    age: {
        type: Number
    },
    password: {
        type: String,
        required: true
    },
    cart:{
        type: Array
    },
    order_history:{
        type: Array
    }
});

mongoose.model('user', UserSchema);