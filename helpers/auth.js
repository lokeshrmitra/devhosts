module.exports = {
    verifyJWT: function(req, res, next){//just verifying if JWT passed properly
        const bearerHeader = req.headers['authorization'];
        if( typeof bearerHeader !== 'undefined'){            
           req.token = bearerHeader.split(' ')[1];
           next();
        }else{
            res.sendStatus(403);
        }
    }
}