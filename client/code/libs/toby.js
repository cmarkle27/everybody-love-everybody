// <http://stackoverflow.com/questions/5686483/how-to-compute-number-of-syllables-in-a-word-in-javascript>
function countSyllables(word) {
  word = word.toLowerCase();                                     //word.downcase!
  if(word.length <= 3) { return 1; }                             //return 1 if word.length <= 3
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');   //word.sub!(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '');                                 //word.sub!(/^y/, '')
  return word.match(/[aeiouy]{1,2}/g).length;                    //word.scan(/[aeiouy]{1,2}/).size
}

var app=angular.module('app', []);

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
    $scope.words = []
    $scope.addWord = function(){
        var word = $scope.newWordText
        $scope.words.push({text: word, syllables: countSyllables(word)})
        $scope.newWordText = ''
        console.log('added word')
    }
}