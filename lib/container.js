"use strict";
/*


 management of container for step i.e for loop, if that group a set of step.
 the basic container is always used for a single step and manage just the step



*/


const {Class} = require('sdk/core/heritage');
const { emit } = require("sdk/event/core");
const { EventTarget } = require("sdk/event/target");
const { merge } = require("sdk/util/object");
const Controller = require("./Controller.js").getController();
const { async_emit } = require('./Util.js');
const {Cc, Ci, Cu,Cm } = require("chrome");


let AbstractContainerStep=Class({


extends: EventTarget,
 initialize: function (options){
	EventTarget.prototype.initialize.call(this, options);
    merge(this, options);

 }

});

let ContainerStep = Class({
	extends: AbstractContainerStep,
	   initialize: function (type) {
		   var tempid=require('sdk/util/uuid').uuid().toString();
		this.id = require('sdk/util/uuid').uuid().toString().substring(1,tempid.length-1); 

		var wrapper = Cc['@montrigen/Logger;1'].getService(Ci.nsISupports);
		this.lg = wrapper.wrappedJSObject;
		// array of step id 
		this.linkedSteps=[];
		this.type=type;
		this.status={status:"ok",message:""};
		this.containerTimeout=20000; //timeout in ms
		
		// to enable a call inside a evnet handler
		this._manageError=this.manageError.bind(this);
	
  
    },
    getChildSteps : function() {
      return this.linkedSteps;
    },
	
	addStep: function( stepid){
		
		this.linkedSteps.push(stepid);
		Controller.getStepById(stepid).addContainerRef(this.id);
		
	},
		
		
	removeStep:function(stepid){
		var oldarray = this.linkedSteps;
		var newarray = [];
		for ( var i =0; i < oldarray.length ; i++){
			if( oldarray[i] !== stepid ){
				newarray.push( oldarray[i]);
			}
		}
		this.linkedSteps = newarray;
		Controller.getStepById(stepid).removeContainerRef(this.id);
		this.lg.info("p container id=" + this.id + " removing step id =" + stepid);
	},
	
    hasStepRef : function(){
    	var ret = false;
    	if( this.linkedSteps.length === 0){
    		ret =true;
    	}
    	
    	
    	return ret;
    },
	

	triggerExecutionTimeout:function(){
		emit(this,'error',new Error("Container Timeout Exception") );
		
		
	},
	playContainer : function() {
		
		
		var { setTimeout } = require("sdk/timers");
	
		this.lg.info("playing container " + this.type + "  id=" + this.id);
		
		// tle timeout d'exec
		this.timeoutId = setTimeout( this.triggerExecutionTimeout.bind(this)	      ,this.containerTimeout );
		this.lg.debug(" container timeoutid is " + this.type + "  id=" + this.timeoutId );
		
		this.on('error', this._manageError)	;
		try{
			this.resetStatus();
		this.doAction(); // call abstract methof
		
		
		} catch (e){
			this.dispatchError(e);
			
		}		
		
	},
	
	manageError: function(e){


	this.lg.debug("container managing error " + e + ":file:" + e.fileName + "line:" + e.lineNumber+ " in container "  + this.id );
			this.setErrorStatus(e);
			
		this.notifyEnd({stepId:null,event:'error'});
		
		
	},
	dispatchError : function ( e){
	emit(this,'error',e);
	},
	
	
	notifyEnd: function({stepId:stepId ,event:event}){		
		var {  clearTimeout } = require("sdk/timers");
		this.lg.debug("container " + this.id +"  clear timeout "   +this.timeoutId );
		clearTimeout(this.timeoutId);
		this.lg.log("container "  + this.id + " receive step completion eventfrom stepid = " + stepId + " evt= "  + event ,this.lg.LOGDEBUG);		 		
	this.lg.log("container notify event  container/stepCompleted "  + this.id + "",this.lg.LOGDEBUG);
		
	/*	var fct = function() {
			emit(this,'container/stepCompleted',this.id);
		} ;
		// use set timeout so that listener receive the vent in the same order
		setTimeout(fct.bind(this), 1);
		*/
			
async_emit(this,'container/stepCompleted',{containerId:this.id,messageType:'container/stepCompleted'});		

			this.removeListener('error', this._manageError)	;
	},

setErrorStatus:function(err){
	this.status.status="fail";
	this.status.message=err.message;
	
	
	
},
isOnError:function() {
	if(this.status.status==="fail"){
		return true;
	} else {
			return false;
		}
	
	
},

resetStatus:function(){
	// fail
		this.status.status="ok";
	this.status.message="pass";
	
}
	
	
	
});


let BasicContainerStep = Class({
	extends:ContainerStep,
    initialize: function ( ) {
		ContainerStep.prototype.initialize.call(this,"Basic");
		
        
  
    },
    	toXml : function(doc) {
		var element= doc.createElementNS("http://model.montrigenplug",'containerstep'); 
		element.setAttribute("id",this.id);
		element.setAttribute("type",this.type);
		for( var i=0;i<this.linkedSteps.length;i++){
			var fils= doc.createElementNS("http://model.montrigenplug",'stepref'); 
			fils.setAttribute("id",this.linkedSteps[i]);
			element.appendChild(fils);
		}		
		return element;		
	},
	fromDom : function(domElement){
	
	this.id=domElement.getAttribute('id');
	var stepid = domElement.firstChild.getAttribute('id');
	this.addStep(stepid);
	
	
	},
	doAction: function() {
		
		var theStepid = this.linkedSteps[0];
		var theStep = Controller.getStepById(theStepid);
		
		if(!theStep.isEnable()){
			this.lg.debug("disabled step id= " + theStepid + "  SKIPPED ");
			
			
			this.notifyEnd({stepId:theStepid,event:'stepCompleted',messageType:'stepCompleted'});
			return;
			
		}
		
		 		
	this.lg.debug("registering end callback stepCompleted  before playing step " + theStep.action.displayName  + "id=  " + theStep.id + "");
		
		theStep.action.on('stepCompleted', this.notifyEnd.bind(this) );
		// error manageemnt on step
		theStep.action.on('error', this.dispatchError.bind(this));
		
		require('./Controller.js').getController().playStep(theStepid);
		
		
		
		
		
		
	}
	
});


exports.BasicContainerStep = BasicContainerStep;