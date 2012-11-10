/* TODO

* make the syllable indicators less noisy. maybe we don't need to show the count for every word
* make the current syllable count for the current line visible somehow, that way they can plan
* add in mandatory words
* add in 2-player mode

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
    $scope.currentLine = function(){
        return $scope.lines[$scope.currLine]
    }
    $scope.addWord = function(){
        if ($scope.currLine >= $scope.lines.length){
            $scope.resetTextBox()
            return
        }
        if ($scope.tooManySyllables()){
            return
        }
        var word = $scope.newWordText
        var line = $scope.currentLine()
        if (line.words.length === 0){
            word = capitalize(word)
        }
        line.words.push({text: word, syllables: countSyllables(word)})
        var totalSyllables = countSyllablesInLine(line)
        console.log('totalSyllables: ' + totalSyllables)
        if (totalSyllables === line.max){ // filled up this line
            $scope.currLine ++
            if ($scope.currLine >= $scope.lines.length){
                $scope.endGame()
            }
        }
        $scope.resetTextBox()
    }
    $scope.resetTextBox = function(){
        $scope.newWordText = ''
    }
    $scope.endGame = function(){
        $scope.message = 'Nice haiku!'
    }
    $scope.updateCurrentSyllableCount = function(){
        console.log('updateCurrentSyllableCount')
        $scope.currSyllableCount = countSyllables($scope.newWordText)
        $scope.currSyllableCountClass = $scope.tooManySyllables() ? 'bad' : 'good'
    }
    $scope.tooManySyllables = function(){
        var line = $scope.currentLine()
        if (!line) return false
        return (countSyllablesInLine(line) + $scope.currSyllableCount) > line.max
    }
}