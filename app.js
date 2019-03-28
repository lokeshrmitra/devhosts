const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
//const path = require('path');
//const session = require('express-session');
//const passport = require('passport');

const PORT = process.env.PORT || 5002;

//intialize
var app = express();

//get mongoose connection config
const db = require('./config/database');
mongoose.connect(db.mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.use(cors())
//app.use('/static', express.static(path.join(__dirname, '/static')));

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//bring user routes
const user = require('./routes/user');
app.use('/user', user);
//bring products route
const products = require('./routes/products');
app.use('/products', products);

app.listen(PORT, () => console.log(`SV started on port ${PORT}`));