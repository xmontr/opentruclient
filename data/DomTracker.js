"use strict";

var FileChangeListener = {
		
		onChange:function(evt){
			var srcObj =  Utils.getSrcObjectFromDomEvent(evt);
			var filelist = evt.target.files;

			if(filelist.length > 0) {
				self.port.emit('fileInput',srcObj );
				
			}
			
		}
		
		
		
}

var KeyboardListener = {
		
			typedText : "",
			
			getTypedText : function() {
				return this.typedText;
			} ,
			
			onKeyPress : function ( evt) {
				
				/*
				 *  separate type enter tab ... from typr text
				 * 
				 * 
				 * 
				 */
			
				switch (evt.keyCode) {
				//case 27 :trackKeyboardEnd(evt); 	self.port.emit('keyPress', Utils.getSrcObjectFromDomEvent(evt),13);   break; // press enter
				case 13 :trackKeyboardEnd(evt);  	self.port.emit('keyPress', Utils.getSrcObjectFromDomEvent(evt),13);   break; // press enter
				case 9 :  trackKeyboardEnd(evt);   self.port.emit('keyPress', Utils.getSrcObjectFromDomEvent(evt),9);break; // press tab
				default: if(evt.type == "keypress"){
					var newchar = String.fromCharCode(  evt.which );
					this.typedText += newchar ;
					
				}

					
					
					break;
				
				
			
				}
				
				
				

			
			},
			
			onKeyDown: function(evt){
				
			
				
			},
	onKeyUp: function(evt){
				
			
				
			}
		
			
		
		
		
		};






var trackKeyboardEnd=function (evt) {
	if(KeyboardListener.typedText !==""){
	var srcObj =  Utils.getSrcObjectFromDomEvent(evt);
	var args = KeyboardListener.getTypedText();
	
		self.port.emit('typetext',srcObj,args);
		KeyboardListener.typedText="";
		
	}

};






/**

js that track dom evnt on the target page */


var trackClick  = function(evt) {

	try{
	var srcObj =  Utils.getSrcObjectFromDomEvent(evt);
	var args = Utils.getArgsMethodFromDomEvent(evt);
	 var meth = Utils.getMethodFromDomEvent(evt);
	 if(    Utils.isFileInput(evt.target)){
		 var changelistener = FileChangeListener.onChange.bind(FileChangeListener);
		 evt.target.addEventListener("change", changelistener,false );
	 }else {		 
		
		self.port.emit('click',srcObj,args,meth);
		
			
	 }
		

	
	//initiate keyboard listener if target type input
			if(Utils.isKeyboardListenable(evt.target) ){
				
				var presslistener = KeyboardListener.onKeyPress.bind(KeyboardListener);
				evt.target.addEventListener("keypress", presslistener,false );
				evt.target.addEventListener("keydown", presslistener,false );
				evt.target.addEventListener("blur",trackKeyboardEnd ,false );
				
			
			}
	//helper to calculate the position
			
	}
	catch (e){
		
		/// launched from event handler, exception manually redirected to error channel 
		var err = {
				message :" RECORDING ERROR " +  e.message,	
				fileName: e.fileName,
				lineNumber: e.lineNumber
				
		}
		self.port.emit('error', err );
		
	}
};

var trackFramesAndIframes = function ( window){ // track recursively frames and iframes

	window.document.addEventListener('click',trackClick);
	var liframes = window.document.getElementsByTagName( "iframe" ) ;
	
	for(var i =0; i< liframes.length ; i++){
		
		liframes[i].contentDocument.addEventListener('click',trackClick);
		
	}
	
	var frs =  window.frames;
	for ( var j=0;j< frs.length;j++ ){
		
		trackFramesAndIframes(frs[j].window);
		
		
	}
	
};



trackFramesAndIframes(window);



