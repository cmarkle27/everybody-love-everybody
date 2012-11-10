var createGame = require('../app/game')
var expect = require('chai').expect
var wordutils = require('../app/wordutils')

function makeWord(word){
    return {text: word, syllables: wordutils.countSyllables(word)}
}

describe('game', function(){
    var game
    beforeEach(function(){
        game = createGame()
    })
    it('initializes', function(){})
    it('has 3 lines', function(){
        expect(game.lines.length).to.equal(3)
    })
    it('has a current line', function(){
        expect(game.currentLine()).to.equal(game.lines[0])
    })
    it('can play a word', function(){
        game.playWord('once')
        expect(game.currentLine().words).to.deep.equal([makeWord('once')])
    })
    it('can goes to the next line when reaches 5 syllables', function(){
        game.playWord('once')
        game.playWord('upon')
        game.playWord('a')
        game.playWord('time')
        expect(game.currentLine()).to.equal(game.lines[1])
    })
    it("won't take a word if syllables goes over line limit", function(){
        game.playWord('once')
        game.playWord('upon')
        game.playWord('a')
        game.playWord('elephant')
        expect(game.currentLine()).to.equal(game.lines[0])
        expect(game.currentLine().words).to.deep.equal(
            ['once', 'upon', 'a'].map(makeWord))
    })
    it('checks game has ended', function(){
        expect(game.ended()).to.equal(false)
        var haiku = 'once upon a time \
there was a person some where \
here are more words here'
        haiku.split(' ').forEach(function(word){
            game.playWord(word)
        })
        expect(game.ended()).to.be.ok
    })
    it('tells whether can fit word', function(){
        expect(game.canFitWord('once')).to.be.ok
        game.playWord('once')
        game.playWord('upon')
        game.playWord('a')
        expect(game.canFitWord('time')).to.be.ok
        expect(game.canFitWord('elephant')).not.to.be.ok
    })

})