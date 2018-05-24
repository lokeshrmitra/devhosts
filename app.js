const express = require('express');

const PORT = 5001;

var app = express();

app.get('', (req,res)=>{
    res.send("Started");
});

app.listen(PORT);