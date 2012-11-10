var FW = require('./filewatcher')
var exec = require('child_process').exec

function build(){
    console.log('Re-building assets')
    exec('./build', function(err, stdout, stderr){
        console.log(stdout)
        console.error(stderr)
    })
}

module.exports = function(){
    var fw = new FW
    fw.add('public/css/*.styl')
    fw.add('public/js/*.js')
    fw.on('change', function(){
        build()
    })
    build()
}