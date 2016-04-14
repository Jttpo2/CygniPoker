exports.situationEvaluator = function() {

	// var db = require('./mongoConnection.js').mongoConnection();
	// if (db) {
	// 	console.log('getting players');
	// 	getAllPlayers();
	// } else {
	// 	console.log('db not ready');
	// }
	var state = {
	}

	// function shoulCallRaise(playerName, amount, state, callback) {
	// 	var shouldCall = true;
	// 	db.getPlayer(playerName, function(player) {
	// 		if (player is loose) {
	// 			call more
	// 		}
	// 	});


	// 	return shouldCall;
	// }

	// function init() {
	// 	getAllPlayers();
	// }

	function getAllPlayers() {
		db.getAllPlayers(function(players) {
			state.players = players;
		});
	}

	function getPlayer(playerName) {
		var index = state.players.findIndex(x => x.name = playerName);
		console.log("index: " + index);
		return state.players[index];

		// var player = state.players.filter(function(p) {
		// 	return p.name === playerName;
		// });

		// for (player of state.players) {
		// 	if (player.name === playerName) {
		// 		return player;
		// 	}
		// }
	}

	function replacePlayer(playerName, playerObject) {
		for (player of state.players) {
			if (player.name === playerName) {
				
			}
		}
	}

	function shouldIBluffRaiseAgainst(playerName) {
		
		db.getPlayer(playerName, function(player) {
			if (player.foldPercentage > 0.5) {
				callback(true);
			} else {
				callback(false);
			}
		});	
		return false;
	}

	function shouldICallRaiseAgainst(playerName) {
		db.getPlayer(playerName, function(player) {
			if (player.raisePercentage > 0.5) {
				callback(true);
			} else {
				callback(false);
			}
		});	
		return false;
	}

	var evaluator = {
		shouldIBluffRaiseAgainst: shouldIBluffRaiseAgainst,
		shouldICallRaiseAgainst: shouldICallRaiseAgainst,
		getPlayer: getPlayer,
		// init: init
	}

	return evaluator;
}