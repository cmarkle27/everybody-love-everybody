(function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return window.setImmediate;
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/game.js",function(require,module,exports,__dirname,__filename,process,global){var wordutils = require('./wordutils')

function countSyllablesInLine(line){
    var words = line.words
    var sum = 0
    for (var i = 0; i < words.length; i++){
        sum += words[i].syllables
    }
    return sum
}

function augment(obj, properties){
    for (var key in properties){
        obj[key] = properties[key]
    }
}

function createGame(options){

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
        if (!currLine) return false
        return countSyllablesInLine(game.currentLine()) + 
            wordutils.countSyllables(word) <= currLine.max
    }

    game.allMandatoryWordsUsed = function(){
        return false
    }

    return game
}

module.exports = createGame
});

require.define("/wordutils.js",function(require,module,exports,__dirname,__filename,process,global){// <http://stackoverflow.com/questions/5686483/how-to-compute-number-of-syllables-in-a-word-in-javascript>

exports.countSyllables = countSyllables
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

exports.capitalize = capitalize
function capitalize(word){
    if (word.length === 0) return word
    return word.substring(0, 1).toUpperCase() + word.substring(1)
}

exports.sameWord = sameWord
function sameWord(one, other){
    return one.toLowerCase() === other.toLowerCase()
}

function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1'>$1</a>"); 
}

exports.uncommon = uncommon
function uncommon( sentence ){

    // a, an, by, to, me, he, we, it, i, to, of, be, is
    var wordArr = sentence.match(/\w+/g),
        common = 'the, all, you, she, they, how, are, for, this, and',
        commonObj = {},
        uncommonArr = [],
        word, i;

    common = common.split(',');
    for ( i = 0; i < common.length; i++ ) {
        commonObj[ common[i].trim() ] = true;
    }

    for ( i = 0; i < wordArr.length; i++ ) {

        word = wordArr[i].trim().toLowerCase();
        // words must be greater than 2 chars, not in our common list of words
        // and not be only digits
        if ( word.length > 2 
                && !commonObj[word] 
                && ! /^\d+$/.test(word) ) {
            uncommonArr.push(word);
        }
    }

    return uncommonArr;
}

exports.keywords = keywords
function keywords( img ){

    console.log( img );

    var str = '' 
        words = img.tags || [],
        comments = img.comments.data || [],
        keywords = [];

    if( img.caption )
        words.push( img.caption.text );

    for (var i = 0, len = comments.length; i < len; i++) {
        if( comments[ i ].text ) words.push( comments[ i ].text );
    };

    // remove urls
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    str = words.join(' ').replace(exp,''); 
    str = str.replace(/ +/g, ' ');

    console.log( str );

    // remove common words
    keywords = uncommon( str );

    console.log( keywords.join(' ') );
    
}
});

require.define("/app.js",function(require,module,exports,__dirname,__filename,process,global){/* TODO

* add in 2-player mode
* workflow for starting a game
* make the syllable indicators less noisy. maybe we don't need to show the count for every word
* make the current syllable count for the current line visible somehow, that way they can plan

*/

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
var makeGame = require('./game')
var wordutils = require('./wordutils')

function WordCtrl($scope){
    $scope.game = makeGame()
    $scope.currSyllableCount = 0
    $scope.currSyllabelCountClass = 'good'
    $scope.message = ''
    $scope.mandatoryWords = [
        {text: 'princess'}
        , {text: 'prince'}
        , {text: 'king'}
    ]

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
        wordutils.keywords( $scope.grams[ i ] );
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
        $scope.currSyllableCount = wordutils.countSyllables($scope.newWordText)
        $scope.currSyllableCountClass = $scope.tooManySyllables() ? 'bad' : 'good'
    }
    $scope.tooManySyllables = function(){
        return !$scope.game.canFitWord($scope.newWordText || '')
    }
}
});
require("/app.js");
})();
