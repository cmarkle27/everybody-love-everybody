// <http://stackoverflow.com/questions/5686483/how-to-compute-number-of-syllables-in-a-word-in-javascript>
var wordutils = {}

wordutils.countSyllables = countSyllables
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

wordutils.capitalize = capitalize
function capitalize(word){
    if (word.length === 0) return word
    return word.substring(0, 1).toUpperCase() + word.substring(1)
}

wordutils.sameWord = sameWord
function sameWord(one, other){
    return one.toLowerCase() === other.toLowerCase()
}

function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1'>$1</a>"); 
}

function uncommon( sentence ){

    // a, an, by, to, me, he, we, it, i, to, of, be, is
    var wordArr = sentence.match(/[a-zA-z0-9@]+/g),
        common = 'the, all, but, ago, tha, with, can, lol, nigga, haha, com, thats, you, your, have, ago, was, what, let, that, she, they, how, are, for, this, and',
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
        // and not be only digits, ignore @crap, ignore www stuff
        if ( word.length > 2 
                && !commonObj[word] 
                && ! /^\d+$/.test(word)
                && word.indexOf('@') !== 0
                && word.indexOf('www') !== 0 ) {
            uncommonArr.push(word);
        }
    }

    return uncommonArr;
}

function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function(a, b) { return b.value - a.value; });
    return arr; // returns array
}

wordutils.frequent = frequent
function frequent( words ){

    var wordCounts = { };
    //var words = str.split(/\b/);

    for(var i = 0; i < words.length; i++){
        wordCounts[ words[i] ] = ( wordCounts[ words[i] ] || 0 ) + 1;
    }

    return sortObject( wordCounts );
}

wordutils.keywords = keywords
function keywords( img ){

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

    //console.log( str );

    // remove common words
    return uncommon( str );

    //console.log( keywords.join(' ') );
    
}