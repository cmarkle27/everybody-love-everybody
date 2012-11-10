var express = require('express')
var path = require('path')
var stylus = require('stylus')
var app = express()


app.configure(function(){
    app.use(app.router)
    app.use(express.static(path.join(__dirname, 'public')))
})


app.listen(3000)
console.log('Server listening on port 3000')