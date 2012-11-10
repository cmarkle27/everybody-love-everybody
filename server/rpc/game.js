var guid = require('guid')

var games = {}

exports.actions = function(req, res, ss) {
    req.use('session')
    var api = {}
    api.playWord = function(word, player) {
        console.log('word ' + word + ' played.')
        ss.publish.all('newWord', word, player)
        return res(true)
    }

    api.newGame = function(){
        var gameID = guid()
        games[gameID] = {
            lines: [
                
            ]
        }
        return res(gameID)
    }

    return api
}