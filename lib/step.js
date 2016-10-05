"use strict";

/**

 step definitions


*/

const {theStepActionfactory} = require('./stepActionImpl.js');

const { Class } = require('sdk/core/heritage');

var { EventTarget } = require("sdk/event/target");
var { merge } = require("sdk/util/object");
const { argsActionFromObject } = require('./ArgsAction.js');
 



/***
 * 
 *  base class for allstep 
 * 
 */

	let AbstractStep=Class({


	extends: EventTarget,
	 initialize: function (options){
		EventTarget.prototype.initialize.call(this, options);
		merge(this, options);
	this.actions=this.getActions();

   

},


	getActions : function() {
		
		return[''];
	},
	
	


});






let Step = Class({
extends:AbstractStep,
    initialize: function (stype, oaction) {
		AbstractStep.prototype.initialize.call(this,{} );
		var tempid=require('sdk/util/uuid').uuid().toString();
		this.id = require('sdk/util/uuid').uuid().toString().substring(1,tempid.length-1);
		
		/**
		 * one step can be linked to  many container - store the in containerRef the array of containerid 
		 *  uwhen  containerRef.length = 0 the step is deletable
		 * 
		 */
		this.containerRef = []; 
		
        this.type = stype;
        if(typeof(oaction) !== "undefined"){
            this.action = oaction;            
            oaction.setId(this.id);
        }
        
        
        /***
         * 
         *  management of the state of the step  enable/disable
         * 
         */
        
        this.enable =true;

	

    },
    
    
    isEnable:function(){
    	
    	return   this.enable ;
    	
    	
    },
    
    
    setEnable:function( state){
    	
    	this.enable=state;
    	
    },
    
    
    
    isElementStep:function() {
    	var ret = false;
    	if(this.type === "Element"){
    			ret = true;
    	}
    	return ret;
    	
    },
    
    addContainerRef : function (containerid){
    	this.containerRef.push(containerid);
    	
    },
    
    removeContainerRef : function (containerid){
    	var olref = this.containerRef;
    	var newref = [];    	
    	for( var i=0; i< olref.length ; i++){
    		if( olref[i] !== containerid){
    			newref.push(olref[i]);
    		}
    	}
    	this.containerRef = newref;
    	
    	
    },
    
    hasContainerRef : function(){
    	var ret = false;
    	if( this.containerRef.length === 0){
    		ret =true;
    	}
    	
    	
    	return ret;
    },
	
	playInteractive : function(){
		this.action.playInteractive();
		
	},
	
	fromXml : function ( nodeElement) {
		var jscode,tmpob;
		var saction =nodeElement.getAttribute("action");
		var send =nodeElement.getAttribute("end");
		
		
		this.action=theStepActionfactory.getStepActionByName(saction);
		this.id = nodeElement.getAttribute("id");
		this.action.setId(this.id);
		this.action.setEndEvent(send);
		this.type=nodeElement.getAttribute("type");
		this.enable=nodeElement.getAttribute("enable") === 'true'? true: false ;
		
		//process subnode
		for( var index=0; index <nodeElement.childNodes.length; index++ ){
			switch(nodeElement.childNodes[index].nodeName ){
			case 'args' :
				//get args property
				 jscode = nodeElement.childNodes[index].firstChild.nodeValue;
				 tmpob = JSON.parse(jscode);
				 //recreation of array of argsaction
				 var argarray = [];
				 for(var j =0; j<tmpob.length ; j++){
					 argarray.push( argsActionFromObject(tmpob[j]) ); 
					 
				 }
				 
				this.action.setArgs( argarray );
				break;
			case 'contref' : 
			// get containerref
			 jscode = nodeElement.childNodes[index].firstChild.nodeValue;
			this.containerRef=JSON.parse(jscode);
			break;
			case 'elemnt' :
				// get element property
				if(this.isElementStep()){
				 jscode = nodeElement.childNodes[index].firstChild.nodeValue;
				 tmpob = JSON.parse(jscode);
				 var selector =nodeElement.getAttribute("selector");
				 this.action.setSelector(selector);
				this.action.setElement (tmpob);
				}
				
				break;
			
			
			}
			
			
		}//end for subnode
	


		
		

		
		
	},
	toXml : function(doc) {
		var root= doc.createElementNS("http://model.montrigenplug",'step');  
		root.setAttribute("id",this.id);
		
		root.setAttribute("type",this.type);
		root.setAttribute("enable",this.enable);
		root.setAttribute("action",this.action.getName());
		
		root.setAttribute("end",this.action.endEvent);
		//persist display nane. used by busines report process.
		var dname = doc.createElementNS("http://model.montrigenplug",'displayName');
		dname.appendChild( doc.createCDATASection( this.action.displayName         ));
		root.appendChild(dname);
		// persist this.args
		var args= doc.createElementNS("http://model.montrigenplug",'args');
		args.appendChild( doc.createCDATASection( JSON.stringify(this.action.getArgs())     )    );
		root.appendChild(args);
		//persist containerref
		var ref = doc.createElementNS("http://model.montrigenplug",'contref');
		ref.appendChild( doc.createCDATASection(JSON.stringify(this.containerRef)));
		root.appendChild(ref);
		
		// persist this.element
		if(this.isElementStep()){
			var element= doc.createElementNS("http://model.montrigenplug",'elemnt');
			element.appendChild( doc.createCDATASection(JSON.stringify(this.action.element)));
			root.appendChild(element);	
			root.setAttribute("selector",this.action.selector);
			
			
			
		}
		return root;
		
		
		
	},
	jsonreplacer : function(key,value){
		 if (key==="lg") {
			 return undefined;
		 }
		 return value;
		
	},
	toJS :  function(){
		
	return JSON.stringify(this, this.jsonreplacer);	
		
		
	}
	
	

	

	
});



exports.Step=Step;

	
