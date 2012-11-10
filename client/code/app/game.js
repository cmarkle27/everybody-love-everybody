var wordutils = require('./wordutils')

function countSyllablesInLine(line){
    var words = line.words
    var sum = 0
    for (var i = 0; i < words.length; i++){
        sum += words[i].syllables
    }
    return sum
}

function createGame(){

    var game = {}
    game.currIndex = 0
    game.lines = [
        {max: 5, words: []}
        , {max: 7, words: []}
        , {max: 5, words: []}
    ]

    game.currentLine = function(){
        return game.lines[game.currIndex]
    }

    game.playWord = function(word){
        var syllablesInWord = wordutils.countSyllables(word)
        var currLine = game.currentLine()
        var syllablesInLine = countSyllablesInLine(currLine)
        if (syllablesInWord + syllablesInLine > currLine.max){
            return
        }
        currLine.words.push({text: word, syllables: wordutils.countSyllables(word)})
        var syllablesInLine = countSyllablesInLine(currLine)
        if (syllablesInLine === currLine.max){
            game.currIndex++
        }
    }

    game.ended = function(){
        return !game.currentLine()
    }

    game.canFitWord = function(word){
        var currLine = game.currentLine()
        return countSyllablesInLine(game.currentLine()) + 
            wordutils.countSyllables(word) <= currLine.max
    }

    return game
}

module.exports = createGame