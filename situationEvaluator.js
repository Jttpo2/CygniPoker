exports.situationEvaluator = function(db) {

	var state = {
	}

	function getAllPlayers() {
		db.getAllPlayers(function(players) {
			state.players = players;
		});
	}

	function getPlayer(playerName) {
		var index = state.players.findIndex(x => x.name = playerName);
		console.log("index: " + index);
		return state.players[index];
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
	}

	return evaluator;
}