"use strict";

const { Class } = require('sdk/core/heritage');

const {Step} = require('./step.js');


let ElementStep = Class({
	extends:Step,
    initialize: function ( oaction) {
		Step.prototype.initialize.call(this,"Element",oaction);
       
      
  
    },
	

	updatexpath : function ( newpath){
		this.action.updatexpath(newpath);
		
	},
	
	updatejs : function ( newjs){
		this.action.updatejs(newjs);
		
	},
	updateStepSelector : function(val) {
		
		this.action.setSelector(val);
			
			
			
		},
	
	
	getActions : function() {
		
		return['mouseEvent','typeText','keypress','setFile'];
	},
	

});



let waitStep = Class({
	extends:Step,
	 initialize: function ( oaction) {
			Step.prototype.initialize.call(this,"Wait",oaction);
			

			
	 },
	 	getActions : function() {
		
		return['Wait'];
	},
	
	

	
});





let BrowserStep = Class({
	extends:Step,
    initialize: function ( oaction) {
		Step.prototype.initialize.call(this,"Browser",oaction);
		this.endEventConfigurable=false;

		
        
  
    },

	

	getActions : function() {
		
		return['open tab', 'close tab','activate tab','navigate','dialog','Javascript','activate window'];
	},


	

});








// the steps
exports.BrowserStep = BrowserStep;
exports.ElementStep = ElementStep;
exports.waitStep = waitStep ;


