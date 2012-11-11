var createGame = require('../public/js/game')
var guid = require('guid')

function start(io){

    function newGame(player1, player2){
        var gameID = guid.create().toString()
        var game = createGame({
            player1: player1.playerName
            , player2: player2.playerName
        })
        //games[gameID] = {player1: player1, player2: player2, game: game, startTime: + new Date}
        console.log('new game created')
        console.log('emiting gameStart ' + player2.playerName)
        player1.emit('gameStart', player2.playerName)
        player1.on('gameImage', function(url){
            player2.emit('gameStart', player1.playerName, url)
        })
        player2.on('playWord', function(word){
            game.playWord(word, player2.playerName)
            console.log('giving player 1 the turn')
            player1.emit('turn', word)
        })
        player1.on('playWord', function(word){
            game.playWord(word, player1.playerName)
            console.log('giving player 2 the turn')
            player2.emit('turn', word)
        })
    }

    var games = {}
    var pendingPlayers = []

    io.sockets.on('connection', function(socket){
        socket.on('joinGame', function(playerName){
            socket.playerName = playerName
            if (pendingPlayers.length > 0){
                var player = pendingPlayers.pop()
                newGame(player, socket)
            }else{
                pendingPlayers.push(socket)
            }
            console.log(pendingPlayers.length + ' pending players')
        })
    })

}

module.exports = { start: start }