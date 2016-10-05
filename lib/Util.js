"use strict";

/*
 * 
 *   uitility  function
 * 
 * 
 * 
 */

const { setTimeout } = require("sdk/timers");
const { emit } = require("sdk/event/core");

var async_emit = function ( target,message,param){
	
// when calling emit , the listener are notified before the end of the call to emit. if the listener emit another message 
// the second handler will  end before the first
// async emit_ ensure that the handler of the father is called before the handler of the son.


		var fct = function() {
			emit(target,message,param);
		} ;
		// use set timeout so that listener receive the vent in the same order
		setTimeout(fct, 0);


};


exports.async_emit = async_emit;

