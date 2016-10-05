"use strict";

/*
 * 
 * 
 *  manage al the state of the appli
 * 
 * 
 * 
 * 
 */
const {Cc, Ci } = require("chrome");
const { Class } = require('sdk/core/heritage');
var { EventTarget } = require("sdk/event/target");
var { merge } = require("sdk/util/object");
 
const Controller = require("./Controller.js").getController();


let StateManager=Class({


	extends: EventTarget,
	 initialize: function (options){
		EventTarget.prototype.initialize.call(this, options);
		merge(this, options);
		
		// set the logger
		var wrapper = Cc['@montrigen/Logger;1'].getService(Ci.nsISupports);
		this.lg = wrapper.wrappedJSObject;

		
		
		this.on('stateChange', this.onStateChange.bind(this));
		
		this.state="STOP";
		this.printState("STOPPED");
		Controller.updateGUI('ready2play');
		
	 },
	 onStateChange:function(newstate){
		 if(newstate === this.state) {
			 return;}
		 //nothing has change
		 
		 this.lg.info("------------ StateManager - State has Changed from  "+ this.state + " to  "  + newstate);
		 switch(newstate){
		 
		 case 'STOP': this.state="STOP";
		 this.printState("STOPPED");
		 Controller.updateGUI('ready2play'); 
			 
			 break;
		 
		 case 'PLAYING': this.state="PLAYING";
		 this.printState("PLAYING");
	
			 
			 break;
		 
		 case 'RECORDING': this.state="RECORDING";
		 this.printState("RECORDING");
			 
			 
			 break;
		 
		 
		 }
		 
	 },
	 printState : function(state){
		 var s = require('./sideBar.js').sidebar;
			s.title='montrigen ('+ state + ')' ;
		 
	 },
	 isRecording : function(){
		 var ret = this.state === "RECORDING"? true: false ;
		 return ret;
		 
	 },
	 isPlaying : function(){
		 var ret = this.state === "PLAYING"? true: false ;
		 return ret;
		 
	 },
	 
	 isStopped : function(){
		 var ret = this.state === "STOP"? true: false ;
		 return ret;
		 
	 }
	 
});





var theStateManager = new StateManager();


exports.theStateManager = theStateManager ;