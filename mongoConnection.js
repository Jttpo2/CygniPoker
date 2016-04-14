var mongoose = require('mongoose');
// var evaluator = require('./situationEvaluator.js').situationEvaluator();

exports.mongoConnection = function() {
	'use strict';
	// var url = 'mongodb://localhost:27017/test'
	init();
	// setup();

	// var playerSchema = createPlayerSchema();
	// var Player = mongoose.model('Player', playerSchema);
	
	var Player;

	function init() {
		console.log("initing db");
		mongoose.connect('mongodb://localhost/test');
		
		var db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error: '));
		db.once('open', function() {
			console.log('connected to mongo');
			setupSchemas();
		});
	}

	function setupSchemas() {
		Player = createPlayerSchema();
		
	}

	function createPlayerSchema() {
		var playerSchema = mongoose.Schema({
			name: {String},
		    folds: {type: Number, default: 0},
		    checks: {type: Number, default: 0},
		    calls: {type: Number, default: 0},
		    raises: {type: Number, default: 0},
		    allins: {type: Number, default: 0}
		});

		playerSchema.virtual('foldPercentage').get(function() {
			return this.folds/(this.folds+this.checks+this.calls+this.raises+this.allins);
		});
		playerSchema.virtual('checkPercentage').get(function() {
			return this.checks/(this.folds+this.checks+this.calls+this.raises+this.allins);
		});
		playerSchema.virtual('callPercentage').get(function() {
			return this.calls/(this.folds+this.checks+this.calls+this.raises+this.allins);
		});
		playerSchema.virtual('raisePercentage').get(function() {
			return this.raises/(this.folds+this.checks+this.calls+this.raises+this.allins);
		});
		playerSchema.virtual('allInPercentage').get(function() {
			return this.allins/(this.folds+this.checks+this.calls+this.raises+this.allins);
		});


		return mongoose.model('Player', playerSchema);
	}

	function logRaise(name) {
		var query = {name: name};
		Player.findOneAndUpdate(query, {$inc: {raises: 1}}, {new: true, upsert: true}, function(err, player) {
			// console.log(player);
		});		
	}

	function logCall(name) {
		var query = {name: name};
		Player.findOneAndUpdate(query, {$inc: {calls: 1}}, {new: true, upsert: true}, function(err, player) {
			// console.log(player);
		});		
	}

	function logFold(name) {
		var query = {name: name};
		Player.findOneAndUpdate(query, {$inc: {folds: 1}}, {new: true, upsert: true}, function(err, player) {
			// console.log(player);
		});		
	}

	function logAllIn(name) {
		var query = {name: name};
		Player.findOneAndUpdate(query, {$inc: {allins: 1}}, {new: true, upsert: true}, function(err, player) {
			// console.log(player);
		});		
	}

	function logCheck(name) {
		var query = {name: name};
		Player.findOneAndUpdate(query, {$inc: {checks: 1}}, {new: true, upsert: true}, function(err, player) {
			// console.log(player);
		});		
	}

	function getPlayer(name, callback) {
		var query = {name: name};
		Player.findOne(query, function(err, player) {
			if (err) console.log(err);
			callback(player);
		});
	}

	function getAllPlayers(callback) {
		Player.find({}, function(err, players) {
			if (err) console.log(err);
			callback(players);
		});
	}

	var mongo = {
		init: init,
		logRaise: logRaise,
		logFold: logFold,
		logCheck: logCheck,
		logCall: logCall,
		logAllIn: logAllIn,
		getPlayer: getPlayer,
		getAllPlayers: getAllPlayers
	};

	return mongo;
}