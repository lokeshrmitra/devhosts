const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Server = new Schema({
    name: {
        type: String,
        required: true
    },
    prodid:{
        type:String
    },
    memory: {
        type: String,
        required: true   
    },
    cpu: {
        type: Number,
        required: true
    },
    storage: {
        type: String,
        required: true
    },
    transfer: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const DataStorage = new Schema({
    name: {
        type: String,
        required: true
    },
    prodid:{
        type:String
    },
    storage: {
        type: String,
        required: true
    },
    transfer: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});


const CI = new Schema({
    name: {
        type: String,
        required: true
    },
    prodid:{
        type:String
    },
    price: {
        type: Number,
        required: true   
    },
    builds: {
        type: Number,
        required: true
    },
    concurrentBuild: {
        type: Number,
        required: true
    }
});

const ErrLog = new Schema({
    name: {
        type: String,
        required: true
    },
    prodid:{
        type:String
    },
    eventsPerMonth: {
        type: Number,
        required: true   
    },
    history: {
        type: Number,
        required: true
    },
    users: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});


mongoose.model('errlog', ErrLog);
mongoose.model('ci', CI);
mongoose.model('datastorage', DataStorage);
mongoose.model('server', Server);