var mongoose = require('mongoose');

exports.mongoConnection = function() {
	'use strict';

	init();

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

	function disconnect() {
		mongoose.disconnect();
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
		    allins: {type: Number, default: 0},
		    wins: {type: Number, default: 0},
		    losses: {type: Number, default: 0}
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

	function logGameResult(players) {
		for (let p of players) {
			if (p.chipCount === 0) {
				Player.findOneAndUpdate({name: p.name}, {$inc: {losses: 1}}, {new: true, upsert: true}, function(err, player) {
					if (err) console.log(err);
				});
			} else {
				Player.findOneAndUpdate({name: p.name}, {$inc: {wins: 1}}, {new: true, upsert: true}, function(err, player) {
					if (err) console.log(err);
				});
			}
		}
	}

	var gracefulExit = function() { 
		mongoose.connection.close(function () {
	    	console.log('Mongoose default connection with DB :' + ' is disconnected through app termination');
	    	process.exit(0);
  		});
	}

	// If the Node process ends, close the Mongoose connection
	process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

	var mongo = {
		init: init,
		disconnect: disconnect,
		logRaise: logRaise,
		logFold: logFold,
		logCheck: logCheck,
		logCall: logCall,
		logAllIn: logAllIn,
		getPlayer: getPlayer,
		getAllPlayers: getAllPlayers,
		logGameResult: logGameResult
	};

	return mongo;
}