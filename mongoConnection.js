var mongoose = require('mongoose');

exports.mongoConnection = function() {
	'use strict';
	// var url = 'mongodb://localhost:27017/test'
	init();
	// setup();

	var playerSchema = createPlayerSchema();
	var Player = mongoose.model('Player', playerSchema);

	function init() {
		console.log("initing db");
		mongoose.connect('mongodb://localhost/test');
		
		var db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error: '));
		db.once('open', function() {
			console.log('connected');
		});
	}

	function setup() {
		createPlayerSchema();
	}

	function createPlayerSchema() {
		var playerSchema = mongoose.Schema({
			name: String,
		    folds: Number,
		    calls: Number,
		    raises: Number
		});

		return playerSchema;
	}

	// function logRaise(name) {
	// 	var testP = new Player({name: name});
	// 	testP.raises++;
	// 	testP.save(function(err, testP) {
	// 		if (err) return console.log(err);

	// 		console.log(test)
	// 	});
	// }

	var mongo = {
		init: init
	};

	return mongo;
}