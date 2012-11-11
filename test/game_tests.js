var createGame = require('../public/js/game')
var expect = require('chai').expect
var wordutils = require('../public/js/wordutils')

function makeWord(word){
    return {text: word, syllables: wordutils.countSyllables(word)}
}

var haiku = 'once upon a time \
there was a person some where \
here are more words here'

var princessHaiku = 'once upon a time \
there was a princess and she \
had a prince and king'

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
    it('should not bomb if calling canFitWord after game ended', function(){
        haiku.split(' ').forEach(function(word){
            game.playWord(word)
        })
        game.canFitWord('bobby')
    })
    it('fires game ended', function(){
        var ended = false
        game.on('ended', function(){
            ended = true
        })
        haiku.split(' ').forEach(function(word){
            game.playWord(word)
        })
        expect(ended).to.be.ok
    })
    it('should give syllable counts for each line', function(){
        expect(game.syllableCounts()).to.deep.equal([0,0,0])
        haiku.split(' ').forEach(function(word){
            game.playWord(word)
        })
        expect(game.syllableCounts()).to.deep.equal([5,7,5])
    })
})

describe('mandatory words', function(){
    var game
    beforeEach(function(){
        game = createGame({
            mandatoryWords: ['princess', 'prince', 'king'].map(makeWord)
        })
    })
    it('tells whether all mandatory words are used', function(){
        expect(game.allMandatoryWordsUsed()).not.to.be.ok
        princessHaiku.split(' ').forEach(function(word){
            game.playWord(word)
        })
        expect(game.allMandatoryWordsUsed()).to.be.ok
    })
})

describe('two player game', function(){
    var game
    beforeEach(function(){
        game = createGame({
            player1: 'Don',
            player2: 'John'
        })
    })
    it('should save playerName with word if provided', function(){
        game.playWord('car', 'Don')
        expect(game.currentLine().words[0].text).to.equal('car')
        expect(game.currentLine().words[0].player).to.equal('Don')
        expect(game.currentLine().words[0].which).to.equal(1)
        game.playWord('board', 'John')
        expect(game.currentLine().words[1].which).to.equal(2)
    })
})