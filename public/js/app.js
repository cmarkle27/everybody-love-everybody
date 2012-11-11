/* TODO

* add in 2-player mode
* workflow for starting a game
* make the syllable indicators less noisy. maybe we don't need to show the count for every word
* make the current syllable count for the current line visible somehow, that way they can plan

*/

/* ===========  AngularJS directives (which are sort of like extensions to the HTML elements) ======== */
var app=angular.module('app', [])

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/single', {controller:WordCtrl, templateUrl:'single.html'})
      .when('/double', {controller:WordCtrl, templateUrl:'double.html'})
      .when('/', {controller:HomeCtrl, templateUrl:'landing.html'})
    $locationProvider.html5Mode(true)
    //debugger;
});

// / (landing)
// /single
// /double
// /id



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
app.controller('HomeCtrl', ['$scope', HomeCtrl])

function HomeCtrl($scope){
    console.log('s');
}

app.controller('WordCtrl', ['$scope', WordCtrl])
var makeGame = require('./game')
var wordutils = require('./wordutils')

function WordCtrl($scope){
    $scope.game = makeGame()
    $scope.currSyllableCount = 0
    $scope.currSyllabelCountClass = 'good'
    $scope.message = ''
    $scope.instaImg = $("#imageKu");
    $scope.grams = [];
    $scope.imgSrc = '';

    $scope.updateImg = function(i){
        $scope.updateImgSrc(i);
        $scope.updateImgWords(i);
    }

    $scope.updateImgSrc = function(i){
        // jquery update of imgsrc
        $( $scope.instaImg ).attr("src", $scope.grams[ i ].images.standard_resolution.url).show();
    }

    $scope.updateImgWords = function(i){
        var keywords = wordutils.keywords( $scope.grams[ i ] );
        // get most freq keywords
        console.log( keywords );
        console.log( wordutils.frequent( keywords ) );

        var keywords = wordutils.keywords( $scope.grams[ i ] ),
            freq = wordutils.frequent( keywords ),
            first, second, third;

        first = freq.shift();
        third = freq.shift();
        second = freq[ Math.floor( Math.random()*freq.length ) ];

        $scope.game.mandatoryWords = [
            { text: first[ 'key' ] }
            , {text: second[ 'key' ] }
            , {text: third[ 'key' ] }
        ]
    
        $scope.$apply();
        
    }

    $scope.processGrams = function( instas ){
        // save the grams
        $scope.grams = instas;

        /*
        for (var i = 0, len = instas.length ; i < len; i++) {
            $scope.grams.push( instas[ i ].images.standard_resolution );
        };
        */

        $scope.updateImg(0);
    }

    $scope.instagram = new INSTAGRAM( {
        onComplete: $scope.processGrams,
        clientId: '82800ae3936348649c2c922d144cfe53',
        limit: 16
    });
    $scope.instagram.getImages();

    $scope.currentLine = function(){
        return $scope.game.currentLine()
    }
    $scope.enterPressed = function(){
        if ($scope.game.ended()){
            $scope.resetTextBox()
            return
        }
        if ($scope.tooManySyllables()){
            return
        }
        var word = $scope.newWordText || ""
        var syllablesInWord = wordutils.countSyllables(word)
        if (syllablesInWord === 0) return

        $scope.game.playWord(word)
        $scope.checkMandatoryWordsUsed(word)
        if ($scope.game.ended()){
            $scope.endGame()
        }
        $scope.resetTextBox()
    }

    $scope.checkMandatoryWordsUsed = function(word){
        $scope.mandatoryWords.filter(function(mw){
            if (wordutils.sameWord(mw.text, word)){
                mw.used = true
            }
        })
        $scope.allMandatoryWordsUsed = $scope.game.allMandatoryWordsUsed()
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
        $scope.currSyllableCount = wordutils.countSyllables($scope.newWordText || '')
        $scope.currSyllableCountClass = $scope.tooManySyllables() ? 'bad' : 'good'
    }
    $scope.tooManySyllables = function(){
        return !$scope.game.canFitWord($scope.newWordText || '')
    }
}