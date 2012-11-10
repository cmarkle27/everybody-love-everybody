// My SocketStream 0.3 app

var http = require('http'),
    ss = require('socketstream');


// Define a single-page client called 'main'
ss.client.define('main', {
  view: 'app.html',
  css:  ['libs/reset.css', 'app.styl'],
  code: ['libs/jquery.min.js', 'app'],
  tmpl: '*'
});

ss.client.define('toby', {
  view: 'toby.html',
  css:  ['libs/normalize.css', 'toby.styl'],
  code: ['libs/jquery.min.js', 'libs/angular.min.js', 'app'],
  tmpl: '*'
});

// Serve this client on the root URL
ss.http.route('/', function(req, res){
  res.serveClient('main');
});

ss.http.route('/toby', function(req, res){
  res.serveClient('toby');
});

// Code Formatters
ss.client.formatters.add(require('ss-stylus'));

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan'));

ss.responders.add(require('ss-angular'));

// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env === 'production') ss.client.packAssets();

// Start web server
var server = http.Server(ss.http.middleware);
server.listen(3000);

// Start SocketStream
ss.start(server);