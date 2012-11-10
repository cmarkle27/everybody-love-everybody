// <http://stackoverflow.com/questions/5686483/how-to-compute-number-of-syllables-in-a-word-in-javascript>
function countSyllables(word) {
  word = word.toLowerCase();                                     //word.downcase!
  if(word.length <= 3) { return 1; }                             //return 1 if word.length <= 3
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');   //word.sub!(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '');                                 //word.sub!(/^y/, '')
  return word.match(/[aeiouy]{1,2}/g).length;                    //word.scan(/[aeiouy]{1,2}/).size
}

function sumSyllablesInLine(line){
    var words = line.words
    var sum = 0
    for (var i = 0; i < words.length; i++){
        sum += words[i].syllables       
    }
    return sum
}

var app=angular.module('app', []);


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

function WordCtrl($scope){
    $scope.lines = [
        {max: 5, words: []}
        , {max: 7, words: []}
        , {max: 5, words: []}
    ] // 3 lines
    $scope.currLine = 0
    $scope.addWord = function(){
        if ($scope.currLine >= $scope.lines.length) return
        console.log('currLine ' + $scope.currLine)
        var word = $scope.newWordText
        var line = $scope.lines[$scope.currLine]
        line.words.push({text: word, syllables: countSyllables(word)})
        var totalSyllables = sumSyllablesInLine(line)
        console.log('totalSyllables: ' + totalSyllables)
        if (totalSyllables >= line.max){
            $scope.currLine ++
        }
        $scope.newWordText = ''
    }
}