var guid = require('guid')
var createGame = require('../../client/code/app/game')

var games = {}

exports.actions = function(req, res, ss) {
    req.use('session')
    var api = {}
    api.playWord = function(gameID, word, player) {
        ss.publish.all('newWord', word, player)
        var game = games[gameID]
        game.lines
        return res(true)
    }

    api.newGame = function(){
        var gameID = guid.create().toString()
        games[gameID] = createGame()
        return res(gameID)
    }

    return api
}