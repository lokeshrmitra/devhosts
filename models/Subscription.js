const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
    email:String,
    subscription: Object
},{
    strict: false
});

mongoose.model('subscription', SubscriptionSchema);
