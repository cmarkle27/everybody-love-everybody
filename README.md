# Team: Everybody Love Everybody!

## Development Instructions

First clone the repo

~~~sh
git clone git@github.com:nko3/everybody-love-every.git
~~~

Next cd into the dir

~~~sh
cd everybody-love-every
~~~

To start the server run

    npm start

Open your browser at

    http://localhost:3000

Now you can start developing. Editing any of the source files should refresh the app in your browser automagically.

## SocketStream Quick Start

Client-side source code is in the `client` folder. The main `app.html` is in `client/views/app.html`. Javascripts are in `client/code/app`.

Server-side source code is in the `server` folder. `server/rpc` is where you write services for the client side to consume, look at the `server/rpc/demo.js` as an example. To consume an rpc API, let's say it was the `sendMessage(text)` API in `demo.js`, you would do

    ss.rpc('demo.sendMessage', text, function(itWorked){
        // Success!!
    });

## Deploy instructions

### GitHub — [Team][2], [Repo][3]

~~~sh
git clone git@github.com:nko3/everybody-love-every.git
~~~

### Nodejitsu — [More details][5], [Handbook][4]

~~~sh
npm install -g jitsu
jitsu login --username nko3-everybody-love-every --password Crf3C9GxqlrcDGG1
jitsu deploy
~~~

### Tutorials & Free Services

If you're feeling a bit lost about how to get started or what to use, we've
got some [great resources for you](http://nodeknockout.com/resources).

First, we've pulled together a great set of tutorials about some of node's
best and most useful libraries:

* [How to install node and npm](http://blog.nodeknockout.com/post/33857791331/how-to-install-node-npm)
* [Getting started with Express](http://blog.nodeknockout.com/post/34180474119/getting-started-with-express)
* [Real-time communication with Socket.IO](http://blog.nodeknockout.com/post/34243127010/knocking-out-socket-io)
* [Data persistence with Mongoose](http://blog.nodeknockout.com/post/34302423628/getting-started-with-mongoose)
* [OAuth integration using Passport](http://blog.nodeknockout.com/post/34765538605/getting-started-with-passport)
* [Debugging with Node Inspector](http://blog.nodeknockout.com/post/34843655876/debugging-with-node-inspector)
* [and many more](http://nodeknockout.com/resources#tutorials)&hellip;

Also, we've got a bunch of great free services provided by sponsors,
including:

* [MongoLab](http://nodeknockout.com/resources#mongolab) - for Mongo hosting
* [Monitaur](http://nodeknockout.com/resources#monitaur) - for server monitoring
* [Ratchet.io](http://nodeknockout.com/resources#ratchetio) - for exception tracking
* [Teleportd](http://nodeknockout.com/resources#teleportd) - real-time photo streams
* [and more](http://nodeknockout.com/resources#tutorials)&hellip;

## Have fun!

If you have any issues, we're on IRC in #nodeknockout and #nodejitsu on
freenode, email us at <all@nodeknockout.com>, or tweet
[@node_knockout](https://twitter.com/node_knockout).

[2]: https://github.com/organizations/nko3/teams/280850
[3]: https://github.com/nko3/everybody-love-every
[4]: http://handbook.jit.su
[5]: http://blog.nodeknockout.com/post/35279199042/introduction-to-jitsu-deployment
