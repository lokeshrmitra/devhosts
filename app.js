const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const PORT = 5002;

//intialize
var app = express();

//get mongoose connection config
const db = require('./config/database');
mongoose.connect(db.mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//bring user routes
const user = require('./routes/user');
app.use('/user', user);

app.listen(PORT, () => console.log(`SV started on port ${PORT}`));