var db = require('./mongoConnection.js').mongoConnection();
setTimeout(function(){


	var evaluator = require('./situationEvaluator').situationEvaluator(db);

	console.log(evaluator.getPlayer('Raiser'));
	
}, 300);

