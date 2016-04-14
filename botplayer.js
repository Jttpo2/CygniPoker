require('./modules/sugar-1.3.min.js');

var ranks = ['ACE', 'DEUCE', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'JACK', 'QUEEN', 'KING', 'ACE'];
var suits = ['HEARTS', 'SPADES', 'DIAMONDS', 'CLUBS'];

function getName() {
	return 'Ohshit';

    // throw new Error('Did you forget to specify your name? A good idea is to use your e-mail as username!');
};

// ************** TODO **************
/*
    Don't agree to all-ins on a normally playable hand


*/

var db = require('./mongoConnection.js').mongoConnection();
var evaluator = require('./situationEvaluator').situationEvaluator();

var stateUpdater = require('./modules/playerStateUpdater.js').playerStateUpdater();
stateUpdater.playerName = getName();

var playerState = stateUpdater.playerState; // private object ref. that can't be changed via player

var player = {
	
    getName : getName,
    state : playerState,  // property 'state' can be accessed with player.state

    // Event handlers

    onRegisterForPlayResponse : function (playResponse) {
    },

    onPlayIsStartedEvent : function (event) {
        console.log('I got a PlayIsStartedEvent, tableId:'+playerState.tableId + ' Chips: ' + playerState.amount);
        // console.log('I got chips: '+playerState.amount);        
    },

    onCommunityHasBeenDealtACardEvent : function (event) {
        // console.log('Community dealt card');
    },

    onPlayerBetBigBlindEvent : function (event) {
        // console.log('Player bet BB');

    },

    onPlayerBetSmallBlindEvent : function (event) {
        // console.log('Pleyer bet SB');
    },

    onPlayerCalledEvent : function (event) {
        // console.log('Player called');
        db.logCall(event.player.name);
        // db.getPlayer(event.player.name, function(player) {
        //      console.log(player.name + " called. " + player.raisePercentage);
        // });
        // evaluator.getPlayer(event.player.name);
    },

    onPlayerCheckedEvent : function (event) {
        // console.log('Player checked');
        db.logCheck(event.player.name);
    },

    onPlayerFoldedEvent : function (event) {
        // console.log('Player folded');
        db.logFold(event.player.name);
    },

    onPlayerForcedFoldedEvent : function (event) {
        console.log('I got a PlayerForcedFoldedEvent, my onActionRequest() is too slow!!!');
    },

    onPlayerQuitEvent : function (event) {
        console.log('Player Quit');
    },

    onPlayerRaisedEvent : function (event) {
        // console.log('Player Raised');
        db.logRaise(event.player.name);
        db.getPlayer(event.player.name, function(player) {
             console.log(player.name + " raised." + player.raisePercentage);
        });
    },

    onPlayerWentAllInEvent : function (event) {
        // console.log('Player went All in');
        db.logAllIn(event.player.name);
    },

    onServerIsShuttingDownEvent : function (event) {
        console.log('Server shutting down');
    },

    onShowDownEvent : function (event) {
        // console.log('Showdown');
    },

    onTableChangedStateEvent : function (event) {
        // console.log('Table changed state: ', event);
        // switch (event.state) {
        //     case 'PRE_FLOP': console.log('Preflop');
        //     break;
        //     case 'FLOP':
        //     break;
        // }
    },

    onTableIsDoneEvent : function (event) {
    	// if (stateUpdater.amIWinner()) {
     //        console.log('I won');            
     //    } else {
     //        console.log('I Lost');
     //    }
        // console.log('I'am the winner: '+stateUpdater.amIWinner());
    },

    onYouHaveBeenDealtACardEvent : function (event) {
        // console.log('I Got a card');
    },

    onYouWonAmountEvent : function (event) {
        if (event.wonAmount == 0) {
            console.log('Lost');
        } else {
            console.log('Won amount: ', event.wonAmount);        
        }
    },

    onActionRequest : function (possibleActions) {

        var raiseAction, callAction, checkAction, foldAction, allInAction;
        var i, action;
        for (i = 0; i < possibleActions.length; i += 1) {
            action = possibleActions[i];
            switch (action.actionType) {
                case 'RAISE' : 
                    raiseAction = action;
                    break;
                case 'CALL' : 
                    callAction = action;
                    break;
                case 'CHECK' : 
                    checkAction = action;
                    break;
                case 'FOLD' : 
                    foldAction = action;
                    break;
                case 'ALL_IN' :
                    allInAction = action;
                    break;
                default : 
                    break;
            }
        }

        var chosenAction = checkAction || callAction || raiseAction || foldAction || allInAction;
        
        console.log(player.state);
        var hand = player.state.myCards;
        switch (player.state.table.state) {
            case 'PRE_FLOP': 
                if (isAllInHand(hand)) {
                    chosenAction = allInAction;
                } else if (isPlayableHand(hand)) {
                    // chosenAction = raiseAction || checkAction || callAction || allInAction;
                    if (randomRaise()) {
                        chosenAction = raiseAction || checkAction || callAction || allInAction;
                    } else {
                        chosenAction = checkAction || callAction || allInAction;
                    }
                } else if (isMeInBB()) {
                    // Play all "free" hands in BB
                    if (randomRaise()) {
                        chosenAction = raiseAction || checkAction || callAction || allInAction || foldAction;
                    } else {
                        chosenAction = checkAction || foldAction;
                    }
                } else {
                    // Fold unplayable hands preflop
                    if (randomRaise()) {
                        chosenAction = raiseAction || checkAction || callAction || foldAction;
                    } else {
                        chosenAction = foldAction;
                    }
                }
                break;
            case 'FLOP':
                if (gotFullHouse(hand) || gotFlush(hand)) {
                    // All in on full house or flush
                    chosenAction = allInAction;
                } else if (getMultiplesAmountOneCard(hand[0]) === 4 || getMultiplesAmountOneCard(hand[1]) === 4 || gotThreeOfAKind(hand)) {
                // Always raise three and four of a kind and above
                    chosenAction = raiseAction || callAction || checkAction || allInAction;
                } else if (getMultiplesAmount() >= 3) {
                    // Check-Call everywhere with two pair
                    chosenAction = raiseAction || checkAction || callAction || allInAction || foldAction;
                } else if (getMultiplesAmount() >= 2 && highCardRank(hand) >= 11) {
                    // Check-call one pair
                    // TODO: Check-call high pairs only
                    // TODO: Stay with flush or straight draws
                    chosenAction = checkAction || callAction || foldAction;
                } else {
                    // Check-fold everything else
                    chosenAction = checkAction || foldAction;
                }
                break;
            case 'TURN':
                if (gotFullHouse(hand) || gotFlush(hand)) {
                    // All in on full house or flush
                    chosenAction = allInAction;
                } else if (getMultiplesAmountOneCard(hand[0]) === 4 || getMultiplesAmountOneCard(hand[1]) === 4 || gotThreeOfAKind(hand)) {
                // Always raise three and four of a kind and above
                    chosenAction = raiseAction || callAction || checkAction || allInAction;
                } else if (getMultiplesAmount() >= 3) {
                    // Check-Call everywhere with two pair
                    chosenAction = raiseAction || checkAction || callAction || allInAction || foldAction;
                } else if (getMultiplesAmount() >= 2 && highCardRank(hand) >= 11) {
                    // Check-call one pair
                    // TODO: Check-call high pairs only
                    // TODO: Stay with flush or straight draws
                    chosenAction = checkAction || callAction || foldAction;
                } else {
                    // Check-fold everything else
                    chosenAction = checkAction || foldAction;
                }
                break;
            case 'RIVER': 
                if (gotFullHouse(hand) || gotFlush(hand)) {
                    // All in on full house or flush
                    chosenAction = allInAction;
                } else if (getMultiplesAmountOneCard(hand[0]) === 4 || getMultiplesAmountOneCard(hand[1]) === 4 || gotThreeOfAKind(hand)) {
                // Always raise three and four of a kind and above
                    chosenAction = raiseAction || callAction || checkAction || allInAction;
                } else if (getMultiplesAmount() >= 3) {
                    // Check-Call everywhere with two pair
                    chosenAction = raiseAction || checkAction || callAction || allInAction || foldAction;
                } else if (getMultiplesAmount() >= 2 && highCardRank(hand) >= 11) {
                    // Check-call one pair
                    // TODO: Check-call high pairs only
                    chosenAction = checkAction || callAction || foldAction;
                } else if (isPotNotRaised()) {
                    // No raise yet? Try to steal pot
                    chosenAction = raiseAction || checkAction || callAction || allInAction || foldAction;
                } else {
                    // Check-fold everything else
                    chosenAction = checkAction || foldAction;
                }

                break;
            default:
        }
        
        console.log('I chose action: ' + chosenAction.actionType);

        return chosenAction;
    },
    
    dispatchEvent : function(event) {
    	var clazz = event.type.split('.').pop();
    	stateUpdater.eventHandlers['on' + clazz](event); // update currentPlayState
    	this['on' + clazz](event);
    }
}
exports.botplayer = player;

function noOfPlayers() {
    return player.state.table.players.length; 
}

function isHeadsUp() {
    return noOfPlayers() === 2;
}

function isAllInHand(hand) {
    var card1 = hand[0];
    var card2 = hand[1];

    if (card1.rank === 'ACE' && isPair(card1, card2) || 
        card2.rank === 'KING' && isPair(card1, card2) ) {
        // AA and KK
        return true; 
    } else if (isPair(card1, card2) && getRank(card1) >= 12) {
            // Pair Queen or higher
         return true;
    }
    if (noOfPlayers() <= 3) {
        // console.log('********************* Three or less');
        // Three players or less
        if (card1.rank === 'ACE' && isTopTwo(card2) && areSuited(card1, card2) || 
            card2.rank === 'ACE' && isTopTwo(card1) && areSuited(card1, card2)) {
            return true; 
        } else if (isPair(card1, card2) && getRank(card1) >= 10) {
            // Pair 10 or higher
            return true;
        } 
    } else if (isHeadsUp()) {
        // Heads up
        if (card1.rank === 'ACE' && isTopThree(card2) || 
            card2.rank === 'ACE' && isTopThree(card1) || 
            (areFollowing(card1, card2) && areSuited(card1, card2)) && highCardRank(hand) >= 10 ||
            isPair(card1, card2) && getRank(card1) >= 5) {
            // Ace-queen, Following and suited (10 or higher), pairs higher than 4
            return true;
        }
    }
    return false;
}

function getRank(card) {
    if (card.rank == 'ACE') {
        return 14;
    } else {
        return ranks.indexOf(card.rank)+1;
    }
}

function isTopFive(card) {
    var rank = card.rank;
    return isTopFour(card) || rank === 'TEN';
}

function isTopFour(card) {
    var rank = card.rank;
    return isTopThree(card) || rank === 'JACK';
}

function isTopThree(card) {
    var rank = card.rank;
    return isTopTwo(card) || rank === 'QUEEN';
}

function isTopTwo(card) {
    var rank = card.rank;
    return rank === 'ACE' || rank === 'KING';
}

function isPlayableHand(hand) {
    var card1 = hand[0];
    var card2 = hand[1];
    
    var threeOrMore = areFollowing(card1, card2) || 
        (areSuited(card1, card2) && isNoCardShit(hand)) || 
        isPair(card1, card2) || 
        (isTopFive(card1) && isTopFive(card2));
    
    if (noOfPlayers() >= 3) {
        return threeOrMore;
    } else if (isHeadsUp()) {
        if (isMeInSB) {
            // Loosen up a lot in SB too
            // Play anything suited w high card 10 or over
            // Ace-anything
            // One-gaps higher than 7
            return threeOrMore || 
            (areSuited(card1, card2) && highCardRank(hand) >= 10) ||
            highCardRank(hand) === 14 ||
                isOneGap(card1, card2) && highCardRank(hand) >= 7;

        } else {
            // Loosen playable hands requirements when heads up, play anything with a king or ace
            return threeOrMore || highCardRank(hand) >= 13;
        }
    }
    return false;
}

function areFollowing(card1, card2) {
    if (card1.rank === 'ACE') {
        return card2.rank === 'KING' || card2.rank === 'DEUCE';
    } else if (card2.rank === 'ACE') {
        return card1.rank === 'KING' || card1.rank === 'DEUCE';
    }
    var index = ranks.indexOf(card1.rank);
    return card2.rank === ranks[index-1] || card2.rank === ranks[index+1];
}

function isOneGap(card1, card2) {
    if (card1.rank === 'ACE') {
        return card2.rank === 'QUEEN' || card2.rank === 'THREE';
    } else if (card2.rank === 'ACE') {
        return card1.rank === 'QUEEN' || card1.rank === 'THREE';
    } else if (card1.rank === 'KING') {
        return card2.rank === 'JACK';
    } else if (card2.rank === 'KING') {
        return card1.rank === 'JACK';
    }

    var index = ranks.indexOf(card1.rank);
    return card2.rank === ranks[index-2] || card2.rank === ranks[index+2];
}

function areSuited(card1, card2) {
    return card1.suit === card2.suit;
}

function isPair(card1, card2) {
    return card1.rank === card2.rank;
}

function getMultiplesAmount() {
    var hand = player.state.myCards;
    var cardsOnTable = player.state.communityCards;
    var counter = 1;
    for (var card of hand) {
        for (var c of cardsOnTable) {
            if (card.rank ===  c.rank) {
                counter++;
            }
        }
    }
    if (hand[0].rank === hand[1].rank) {
        counter++;
    }
    return counter;
}

function getMultiplesAmountOneCard(card) {
    var cardsOnTable = player.state.communityCards;
    var counter = 1;
    for (var c of cardsOnTable) {
        if (card.rank ===  c.rank) {
            counter++;
        }
    }
    return counter;
}


function gotThreeOfAKind(hand) {
    var cardsOnTable = player.state.communityCards;
    if (isPair(hand[0], hand[1])) {
        for (var c of cardsOnTable) {
            if (isPair(hand[0], c)) {
                return true;
            }
        }
    } else {
        var counter1 = 1;
        var counter2 = 1;
        for (var c of cardsOnTable) {
            if (isPair(hand[0], c)) {
                counter1++;
            }
            if (isPair(hand[1], c)) {
                counter2++;
            }
        }
        if (Math.max(counter1, counter2) == 3) {
            return true;
        }
    }
    return false;
}

function gotFlush(hand) {
    var cardsOnTable = player.state.communityCards;
    if (areSuited(hand[0], hand[1])) {
        var counter = 2;
        for (var c of cardsOnTable) {
            if (areSuited(hand[0], c)) {
                // hand[0].suit ===  c.suit) {
                counter++;
            }
        }
        return counter >= 5;
    } else {
        var counter1 = 1;
        var counter2 = 1;
        for (var c of cardsOnTable) {
            if (areSuited(hand[0], c)) {
                // hand[0].suit ===  c.suit) {
                counter1++;
            } 
            if (areSuited(hand[1], c)) {
                counter2++;
            } 
        }
        return counter1 >= 5 || counter2 >= 5;
        
    }
}

function gotFullHouse(hand) {
    var cardsOnTable = player.state.communityCards;
    var counter1 = 1;
    var counter2 = 1;
    for (var c of cardsOnTable) {
        if (hand[0].rank ===  c.rank) {
            counter1++;
        }
    }
    for (var c of cardsOnTable) {
        if (hand[1].rank ===  c.rank) {
            counter2++;
        }
    }
    return counter1 >= 3 && counter2 >= 2 ||
        counter2 >= 3 && counter1 >= 2;
}

function isNoCardShit(hand) {
    for (var card of hand) {
        var index = ranks.indexOf(card.rank);
        if ( index > 0 && index <= 7) {
            // Anything between 2 and 6 is shit
            // console.log('At least one is shit!');
            return false;
        }
    }
    return true;
}

function highCardRank(hand) {
    var index1 = ranks.indexOf(hand[0]);
    var index2 = ranks.indexOf(hand[1]);
    if (index1 === 0 || index2 === 0) {
        return 14;
    } else {
        return Math.max(index1, index2) + 1;
    }
}

function randomRaise() {
    // linaear function through values
    
    // 2 0.15
    // 3 0.05
    // 7 0.01    
     // -1.018975059·10^-1 ln(x) + 1.969530707·10-1


    // 2 0.3
    // 3 0.1
    // 7 0.01
     // y = -0.212360638 ln(x) + 4.012446349·10-1
    var raisePercentage = -0.212360638*Math.log(noOfPlayers()) + 4.012446349*0.1;
    var raise = Math.random(0,1) < raisePercentage;
    // console.log('Random raise: ', raise);
    return  raise; 
}

function isMeInBB() {
    return player.state.table.bigBlindPlayer.name === getName();
}

function isMeInSB() {
    return player.state.table.smallBlindPlayer.name === getName();   
}

function isPotNotRaised() {
    // If pot hasn't been raised the only thing there is the ante. Well, not really, people can have folded. Enough for now
    var pot = player.state.potTotal;
    var bb = player.state.table.bigBlindAmount;
    return pot <= noOfPlayers()*bb;
}