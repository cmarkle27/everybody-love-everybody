/* TODO

* flesh out ending a game for 2 player
* saving finished games
* improve UI
* make the syllable indicators less noisy. maybe we don't need to show the count for every word
* make the current syllable count for the current line visible somehow, that way they can plan

*/

/* ===========  AngularJS directives (which are sort of like extensions to the HTML elements) ======== */
var app=angular.module('app', [])

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/single', {templateUrl:'single.html'})
      .when('/double', {templateUrl:'double.html'})
      .when('/', {controller:HomeCtrl, templateUrl:'landing.html'})
    $locationProvider.html5Mode(true)
});

// / (landing)
// /single
// /double
// /

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


/* ============== The meat and potatoes: the controllers for the UI ================= */

function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function restorePlayerName(){
    return readCookie('playerName')
}

function storePlayerName(name){
    createCookie('playerName', name, 365)
}

function HomeCtrl($scope){
    $scope.playerName = restorePlayerName()
    $scope.submitName = function(){
        $scope.playerName = $scope.tempName
        storePlayerName($scope.playerName)
    }
}

function GameCtrl($scope){
    $scope.game = createGame()
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
        $scope.playWord(word)
        $scope.checkMandatoryWordsUsed(word)
        if ($scope.game.ended()){
            $scope.endGame()
        }
        $scope.resetTextBox()
    }
    $scope.checkMandatoryWordsUsed = function(word){
        if (!$scope.game.mandatoryWords) return
        $scope.game.mandatoryWords.forEach(function(mw){
            if (wordutils.sameWord(mw.text, word)){
                mw.used = true
            }
        })
        $scope.allMandatoryWordsUsed = $scope.game.allMandatoryWordsUsed()
    }

    $scope.tooManySyllables = function(){
        return !$scope.game.canFitWord($scope.newWordText || '')
    }
    $scope.updateCurrentSyllableCount = function(){
        $scope.currSyllableCount = wordutils.countSyllables($scope.newWordText || '')
        $scope.currSyllableCountClass = $scope.tooManySyllables() ? 'bad' : 'good'
    }
    $scope.resetTextBox = function(){
        $scope.newWordText = ''
    }
    $scope.currentLine = function(){
        return $scope.game.currentLine()
    }
    $scope.setMessage = function(level, message){
        $scope.message = message
        $scope.messageLevel = level
    }

}




function OnePlayerGameCtrl($scope){
    GameCtrl($scope)
    $scope.currSyllableCount = 0
    $scope.currSyllabelCountClass = 'good'
    $scope.message = ''
    $scope.grams = [];
    $scope.imageSrc = '';

    $scope.updateImg = function(i){
        $scope.updateImgSrc(i);
        $scope.updateImgWords(i);
    }
    $scope.playWord = function(word){
        $scope.game.playWord(word)
    }
    $scope.updateImgSrc = function(i){
        // jquery update of imgsrc
        $scope.imageSrc = $scope.grams[ i ].images.standard_resolution.url
        $scope.$apply();
    }

    $scope.updateImgWords = function(i){
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
        $scope.grams = instas;
        $scope.updateImg(0);
    }
    
    $scope.instagram = new INSTAGRAM( {
        onComplete: $scope.processGrams,
        limit: 1
    });

    $scope.instagram.getImages();
        
    $scope.endGame = function(){
        if (!$scope.allMandatoryWordsUsed){
            $scope.setMessage('error', "Sorry, you didn't use all the required words")
        }else{
            $scope.setMessage('info', 'Nice haiku!')
        }
    }
    
    
}


function TwoPlayerGameCtrl($scope){
    $scope.playerName = restorePlayerName()
    $scope.gameStarted = false
    GameCtrl($scope)
    $scope.newWordText = ''
    function setImage(url){
        $scope.imageSrc = url
        $scope.$apply()
    }
    var socket = io.connect('http://' + location.hostname)
    socket.emit('joinGame', $scope.playerName)
    socket.on('gameStart', function(opponent, url){
        $scope.opponent = opponent
        $scope.gameStarted = true
        
        if (url){
            setImage(url)
            $scope.game.player1 = opponent
            $scope.game.player2 = $scope.playerName
            $scope.whichAmI = 2
            $scope.whichAreThey = 1
        }else{
            $scope.game.player1 = $scope.playerName
            $scope.game.player2 = opponent
            $scope.whichAmI = 1
            $scope.whichAreThey = 2
            new INSTAGRAM( {
                onComplete: $scope.gotImage,
                limit: 1
            }).getImages()
        }

        $scope.$apply()
    })
    socket.on('turn', function(word){
        $scope.game.playWord(word, $scope.opponent)
        $scope.setMyTurn(true)
        $scope.$apply()
    })
    $scope.setMyTurn = function(yes){
        $scope.myTurn = yes
        $scope.inputDisabled = !yes
    }
    $scope.setMyTurn(false)
    $scope.gotImage = function(grams){
        $scope.inputDisabled = false
        $scope.myTurn = true
        // Got image
        setImage(grams[0].images.standard_resolution.url)
        // Now send the image back to the other player
        socket.emit('gameImage', $scope.imageSrc)
    }
    $scope.playWord = function(word){
        $scope.game.playWord(word, $scope.playerName)
        socket.emit('playWord', word)
        $scope.setMyTurn(false)
    }
    $scope.endGame = function(){
        $scope.setMessage('info', 'Nice haiku, folks!')
    }
}
