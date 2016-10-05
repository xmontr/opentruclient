"use strict";



var remoteController =  function() {
	
	
	this.remoteUri = null;
	this.websocket=null;
	
	
	
	
};

var rc = new remoteController();



remoteController.prototype.setRemoteURI=function(sUrl){
	

	this.remoteUri = sUrl;
	this.buffer = [];
	
	
};

remoteController.prototype.onopen= function(event){
	
	console.log("remoteController opening websocket to" + this.remoteUri);
	var mess = "remoteController opening websocket to" + this.remoteUri   +"}";
	addon.port.emit("remoteMessage",  mess );
	//flush buffered message if needed
	while( this.buffer.length >0){
		this.sendMessage(this.buffer.pop() );
		
	}
	
};

remoteController.prototype.onmessage= function(event){	
	console.log("remoteController receiving message" +event.data);
	addon.port.emit("remoteMessage", event.data);	
};

remoteController.prototype.onerror= function(event){
	
	console.log("remoteController in error" +event);
	
};


remoteController.prototype.onclose= function(event){
	
	console.log("---- remoteController websocket has been closed" +event);
	
};




remoteController.prototype.connect = function(){
	if(this.remoteUri === null ){
		throw new Error("illegalStateException  - remotecontroller not initialised");
		
	} else {
		//console.log("remoteController : uri for socket:" + this.remoteUri);
		this.websocket = new WebSocket(this.remoteUri);
		this.websocket.onopen = this.onopen.bind(this);
		this.websocket.onmessage = this.onmessage.bind(this);
		this.websocket.onerror = this.onerror.bind(this);
		this.websocket.onclose = this.onclose.bind(this);
		addon.port.emit("remoteMessage", "connected to" +this.remoteUri );
		
		
		
	}
	
	
	
};


remoteController.prototype.sendMessage= function(smessage){
	console.log("---- remoteController send message " +smessage);
	if(this.websocket===null){
		throw new Error("illegalStateException  - remotecontroller has no websocket");
		
	}
	var thestate =this.websocket.readyState;
	switch (thestate){
	case 0: this.buffer.push(smessage);break; // socket not yet open, also bufferize
	case 1: this.websocket.send(smessage); break;
	case 2:throw new Error("illegalStateException  - remotecontroller  websocket closing"); 
	case 3:throw new Error("illegalStateException  - remotecontroller   websocket closed");  
	
	}
	
	
	
	
	
};



remoteController.prototype.initremotecontroller = function (surl) { 
	//"ws:158.167.25.62:8081/websocket/test"
	
		rc.setRemoteURI(surl);
		rc.connect();
	
		
		

		
		
	
	
};


addon.port.on('sendToRemoteController', rc.sendMessage.bind(rc))	; 
addon.port.on('initRemoteControl', rc.initremotecontroller.bind(rc))	;


