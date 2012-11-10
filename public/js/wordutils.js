// <http://stackoverflow.com/questions/5686483/how-to-compute-number-of-syllables-in-a-word-in-javascript>

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