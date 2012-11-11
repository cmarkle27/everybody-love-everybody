var express = require('express')
var path = require('path')
var stylus = require('stylus')
var app = express()
var build = require('./lib/build')
build()

app.configure(function(){
    app.use(app.router)
    app.use(express.static(path.join(__dirname, 'public')))
})

app.get(/^\/(?:|single|double)$/, function(req, res){
	res.sendfile(path.join(__dirname, 'public/index.html'))
})

app.listen(3000)
console.log('Server listening on port 3000')