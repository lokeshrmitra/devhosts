const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Subscription = new Schema({
    email:String,
    subscription:{
        endpoint: String,
        keys: {
            p256dh: String,
            auth: String
        }
    }
},{
    strict: false
});

mongoose.model('subscription', Subscription);
