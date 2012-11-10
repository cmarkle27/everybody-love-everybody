var express = require('express')
var path = require('path')
var stylus = require('stylus')
var app = express()


app.configure(function(){
    app.use(app.router)
    app.use(express.static(path.join(__dirname, 'public')))
    app.use(stylus.middleware({
        src: __dirname + '/styl',
        dest: __dirname + '/public/css',
        compile: function (str, path, fn) { // optional, but recommended
          stylus(str)
          .set('filename', path)
          .set('compress', true)
          .render(fn);
        }
    }));
})


app.listen(3000)