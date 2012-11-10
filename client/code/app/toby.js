/* TODO

* add in 2-player mode
* workflow for starting a game
* make the syllable indicators less noisy. maybe we don't need to show the count for every word
* make the current syllable count for the current line visible somehow, that way they can plan

*/

/* ================ Just some helper functions ==================== */
// <http://stackoverflow.com/questions/5686483/how-to-compute-number-of-syllables-in-a-word-in-javascript>
function countSyllables(word) {
    word = word.toLowerCase();
    if(word.length <= 3) {
        if (word.match(/[aeiouy]/)) return 1
        return 0
    }
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    return word.match(/[aeiouy]{1,2}/g).length
}

function countSyllablesInLine(line){
    var words = line.words
    var sum = 0
    for (var i = 0; i < words.length; i++){
        sum += words[i].syllables       
    }
    return sum
}

function capitalize(word){
    if (word.length === 0) return word
    return word.substring(0, 1).toUpperCase() + word.substring(1)
}

function sameWord(one, other){
    return one.toLowerCase() === other.toLowerCase()
}

/* ===========  AngularJS directives (which are sort of like extensions to the HTML elements) ======== */
var app=angular.module('app', [])

// the only-letters directive that forces all in put to be
// letters only
app.directive('onlyLetters', function(){
    return function(scope, elm){
        elm.bind('keypress', function(evt){
            var code = evt.keyCode
            if ((code >= 65 && code <= 90) || 
                (code >= 97 && code <= 122) || 
                code === 13){
                // ok
            }else{
                evt.preventDefault()
            }
        })
    }
})

// what to do after a key press
app.directive('onKeyup', function(){
    return function(scope, elm, attrs){
        elm.bind('keyup', function(evt){
            scope.$apply(attrs.onKeyup)
        })
    }
})

/* ============== The meat and potatoes: the controller for the UI ================= */
app.controller('WordCtrl', ['$scope', WordCtrl])

function WordCtrl($scope){
    $scope.lines = [
        {max: 5, words: []}
        , {max: 7, words: []}
        , {max: 5, words: []}
    ] // 3 lines
    $scope.currLine = 0
    $scope.currSyllableCount = 0
    $scope.currSyllabelCountClass = 'good'
    $scope.message = ''
    $scope.mandatoryWords = [
        {text: 'princess'}
        , {text: 'prince'}
        , {text: 'king'}
    ]
    $scope.currentLine = function(){
        return $scope.lines[$scope.currLine]
    }
    $scope.countSyllablesInLine = countSyllablesInLine
    $scope.enterPressed = function(){
        if ($scope.currLine >= $scope.lines.length){
            $scope.resetTextBox()
            return
        }
        if ($scope.tooManySyllables()){
            return
        }
        var word = $scope.newWordText
        var line = $scope.currentLine()
        line.words.push({text: word, syllables: countSyllables(word)})
        $scope.checkMandatoryWordsUsed(word)
        var totalSyllables = countSyllablesInLine(line)
        if (totalSyllables === line.max){ // filled up this line
            $scope.currLine ++
            if ($scope.currLine >= $scope.lines.length){
                $scope.endGame()
            }
        }
        $scope.resetTextBox()
    }
    $scope.checkMandatoryWordsUsed = function(word){
        $scope.mandatoryWords.filter(function(mw){
            if (sameWord(mw.text, word)){
                mw.used = true
            }
        })
        $scope.allMandatoryWordsUsed = $scope.mandatoryWords.every(function(mw){
            return mw.used
        })
    }
    $scope.resetTextBox = function(){
        $scope.newWordText = ''
    }
    $scope.setMessage = function(level, message){
        $scope.message = message
        $scope.messageLevel = level
    }
    $scope.endGame = function(){
        if (!$scope.allMandatoryWordsUsed){
            $scope.setMessage('error', "Sorry, you didn't use all the required words")
        }else{
            $scope.setMessage('info', 'Nice haiku!')
        }
    }
    $scope.updateCurrentSyllableCount = function(){
        $scope.currSyllableCount = countSyllables($scope.newWordText)
        $scope.currSyllableCountClass = $scope.tooManySyllables() ? 'bad' : 'good'
    }
    $scope.tooManySyllables = function(){
        var line = $scope.currentLine()
        if (!line) return false
        return (countSyllablesInLine(line) + $scope.currSyllableCount) > line.max
    }
}