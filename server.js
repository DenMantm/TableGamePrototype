// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express'),
 app      = express(),
 port     = process.env.PORT || 3001,
 mongoose = require('mongoose'),
 passport = require('passport'),
 flash    = require('connect-flash'),
 http     = require('http'),
 path     = require('path'),
// io       = require('socket.io'),
 configDB = require('./db'),
 reg      = require('./engine/regsocket');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./passport')(passport); // pass passport for configuration

app.configure(function() {
	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms

	app.set('view engine', 'ejs'); // set up ejs for templating
	app.set('port', port);
	// required for passport
	app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session
	app.use(express.static(path.join(__dirname, 'pub')));
});


function handleIO(socket){
	function disconnect(){
		console.log("Disconnected");
		socket.broadcast.emit('disconn',socket.id);
	}

	console.log("connected");
	socket.broadcast.emit('conn',socket.id);
	
	var intv = setInterval(function(){
		socket.emit("message",Math.random());
	},1000);
	//whenever client disconnected
	socket.on("disconnect",disconnect);
}

var server = app.listen(port);
var io = require('socket.io').listen(server);

//requireing debug messages to go away
//io.set('log level', 1);

//event listner on connection fires funct
io.on("connection",handleIO);



// routes ======================================================================
require('./roots')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================

console.log('Express server listening on port ' + app.get('port'));

