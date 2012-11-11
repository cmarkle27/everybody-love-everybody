var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var path = require('path')
var stylus = require('stylus')
var build = require('./lib/build')
var gameCoordinator = require('./lib/game_coordinator')
build()

app.configure(function(){
    app.use(app.router)
    app.use(express.static(path.join(__dirname, 'public')))
})

app.get(/^\/(?:|single|double)$/, function(req, res){
	res.sendfile(path.join(__dirname, 'public/index.html'))
})

gameCoordinator.start(io)


var port = process.env.NODE_ENV === 'production' ? 80 : 3000
server.listen(port)
console.log('Server listening on port ' + port)