const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
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

mongoose.model('subscription', SubscriptionSchema);
