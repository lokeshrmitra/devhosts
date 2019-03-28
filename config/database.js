if(process.env.NODE_ENV == 'production'){
    module.exports = {
        mongoURI : 'mongodb://lokeshrmitra:lokesh789@ds141720.mlab.com:41720/devhosts'
     }
}else{
    module.exports = {
        mongoURI : 'mongodb://localhost/devhosts-dev'
    }
}