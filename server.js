var express = require('express')
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var path = require('path')
var stylus = require('stylus')
var build = require('./lib/build')
build()

app.configure(function(){
    app.use(app.router)
    app.use(express.static(path.join(__dirname, 'public')))
})

app.get(/^\/(?:|single|double)$/, function(req, res){
	res.sendfile(path.join(__dirname, 'public/index.html'))
})

io.sockets.on('connection', function(socket){
    console.log('connected')
})

server.listen(3000)
console.log('Server listening on port 3000')