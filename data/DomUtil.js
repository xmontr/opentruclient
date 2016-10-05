"use strict";

var Utils = {

	getSrcObjectFromDomEvent : function (evt) {
		return (this.getSrcObjectFromDomObject(evt.target) );
	},
	
	getSrcObjectFromDomObject : function(domObject) {
			var ret = {} ;
			ret.tagName=domObject.tagName;	
			ret.desc=this.generateDesc(domObject);
			ret.xpath=this.getXpathForObject(domObject);
			ret.isTextAble = this.isKeyboardListenable(domObject);
			
		return (ret);	
	
	},
	
	generateDesc: function(domObject){ // build a readeable name for domobject
		var ret = domObject.tagName.toLowerCase() + " element ";
		switch(domObject.tagName.toLowerCase()){
		case 'a': 
		if(typeof(domObject.innerHTML ) !== "undefined"){
			ret = 	domObject.innerHTML + " Link ";
		}
			
			break;
		case 'button': 
			if(typeof(domObject.innerHTML ) !== "undefined"){
				ret = 	domObject.innerHTML + " button";
			}			
			
			break;
		case 'input':
			if( domObject.type === 'submit'){
				ret = 	domObject.value + " input";
			}
			else {if(typeof(domObject.name) !== "undefined"){
				ret = 	domObject.name + " input";
			}	
			}	
			break;
		case 'textarea':
			if(typeof(domObject.name) !== "undefined"){
				ret = 	domObject.name + " textarea ";
			}
			break;
		
		}
		
		return ret ;
		
	},
	
	
	
		getMethodFromDomEvent : function (evt) {
		var ret = "click";	
		return (ret);
	},
	
	
	getArgsMethodFromDomEvent : function (evt) {		
		var ret = {};
		ret.type = evt.type;
		ret.bubbles = evt.bubbles;
		ret.cancelable=evt.cancelable;
		ret.detail=evt.detail;
		ret.screenX=evt.screenX;
		ret.screenY=evt.screenY;
		ret.clientX =evt.clientX;
		ret.clientY=evt.clientY;
		ret.button = evt.button;
		ret.ctrlKey= evt.ctrlKey;
		ret.shiftKey=evt.shiftKey		;
		ret.altKey=evt.altKey ;
		ret.metaKey=evt.metaKey;
		return (ret);
	},
	
	getXpathForObject : function (ob ) {	
	var ret= "", predicats = [] ; 
	
	function addPredicat ( predname, predval  ) {
		var thePred = {};
		thePred.name= predname;
		thePred.value= predval;
		predicats.push(thePred);
	
	}
	
	
	function generatePredicat() {
	var ret="",
		index=0;
		if (predicats.length === 0  ){ return ret;}
		ret = " [ " + predicats[0].name + " = \"" +    predicats[0].value +"\"" ;		
		for( index=1; index < predicats.length ; index++ ) {
			ret = ret + " and " + predicats[index].name + " = \"" +    predicats[index].value +"\"" ;	
		}
		ret = ret + " ] " ;
	return ret;
	}
	
	var nam, te;
	switch (ob.tagName.toLowerCase()) {
		case "input":
		ret += "//input";
		var typ = ob.getAttribute("type");
		nam = ob.getAttribute("name");
		if(nam !== null ) {
			addPredicat("@name",nam) ;
			}
		if(typ !== null ) {
			addPredicat("@type",typ) ;
			}			
		ret+= generatePredicat()  ;		
		
		break;
		
		case "a":
		ret += "//a";
		nam = ob.getAttribute("name");
		if(nam !== null ) {
			addPredicat("@name",nam) ;
			}
		te = this.getTextForObject(ob);
			if(te !== null ) {
				addPredicat("text()",te) ;
			}
			ret+= generatePredicat()  ;
		
		break;
		
		case "img":
		var alt = ob.getAttribute("alt");
		var tit = ob.getAttribute("title");
		ret += "//img";
		if(alt !== null ) {
			addPredicat("alt",alt) ;
			}
		if(tit !== null ) {
			addPredicat("title",tit) ;
		}		
		ret+= generatePredicat()  ;
		break;
		default:
			ret += "//" + ob.tagName ;
			te = this.getTextForObject(ob);
			nam = ob.getAttribute("name");
			if(te !== null &&  te !== "" ) {
				addPredicat("text()",te) ;
			}
			if(nam !== null) { addPredicat("@name" , nam ); } 
			
		ret+= generatePredicat()  ;
		
	
	}
	
	// calcul de la position 
	ret = this.calculatePosition(ob, ret);
	
	return ret;	
	
	},
	
	
	getTextForObject : function (obj){
	//calculate document	
		var xpathResult = obj.ownerDocument.evaluate(
				"text()", 
				obj, 
				null, 
				XPathResult.STRING_TYPE, 
				null
			);
	return xpathResult.stringValue;
	},
	
	// if xpath generated can return several obj, add the position of the obj in xpath proposed
	calculatePosition : function (obj, xpath ) {
		var ret=xpath ,
			foundedobject ,
			position=0,
			xpathResult = obj.ownerDocument.evaluate(
				xpath, 
				obj.ownerDocument, 
				null, 
				XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
				null
			);
			
			foundedobject = xpathResult.iterateNext();	
	while(foundedobject ) {
		position = position +1 ;
		if( foundedobject.isEqualNode(obj)) {
			
			break;
			}		
		foundedobject = xpathResult.iterateNext();
	}
	if(position > 0 ) {
		ret = "(" + xpath + ")[" + position + "]";
	}	
	
		return ret;
	},
	
	
	
	getObjectsFromXpath : function (win, xpath ) {
		var ret = [];
		//search recursive in  sub document ie inside frames and iframes 
		var liframes = win.document.getElementsByTagName( "iframe" ) ;
		var frs =  win.document.defaultView.frames;
		if( win.document.defaultView !== win.document.defaultView ){
		for( var i =0; i< frs.length ;i++){ // search in all frames
			var currentFrame= frs[i];
			
			var subretframes = this.getObjectsFromXpath ( currentFrame.window, xpath  );
			for(var z =0;  z<subretframes.length ;z++){
				
				ret.push(subretframes[z]  );
				
				
			}
			
			

		}

		}
		for( var j =0; j< liframes.length ;j++){ //search in all iframes
			var currentIframe = liframes[j];
			
			var subretiframes = this.getObjectsFromXpath ( currentIframe.contentDocument.defaultView, xpath  );
			
			for(var h = 0; h <subretiframes.length; h++){
			
			ret.push(subretiframes[h]);
			
			} 
			
		}


		// search in the document	
		
	var foundedobject,
		xpathResult = win.document.evaluate(
				xpath, 
				win.document, 
				null, 
				XPathResult.ANY_TYPE, 
				null
			); 
	foundedobject = xpathResult.iterateNext();	
	while(foundedobject ) {
		ret.push(foundedobject);
		foundedobject = xpathResult.iterateNext();
	}
			
			
	return ret;
	},
	/***  return true if the object is htmlinput ***/
	isFileInput : function ( obj){
		if(     obj.tagName.toLowerCase() == "input"  &&  obj.type.toLowerCase() === "file" ){
			return true;
			
		}	else {
			
			return false;
		}
		
	},

	
	
	// if the dom object nedds to add a keyboard listener
	isKeyboardListenable : function(obj) {
	var ret = false;
	
	switch(obj.tagName.toLowerCase()){
		case "input":
			if(obj.type === "text" ||  obj.type === "password" )
			{	ret= true;}
		
					break;
		case "textarea": ret= true; break;
		
	
	}
	
	return ret;
	}, // end of isKeyboardListenable
	
	
	// if dom object trigger change event
		isChangeable : function(obj) {
	var ret = false;
	
	switch(obj.tagName.toLowerCase()){
		case "select": ret= true; break;
		
	
	}
	
	return ret;
	}, // end of isChangeable
	
	isOptioneable : function(obj){
		var ret = false;
		if( obj.tagName.toLowerCase() === "option" ) {ret= true;}
		return ret;
	} // end of isOptioneable 
	
	
	
	
	
	
	
		
	
	
	





};// end of testcentre.utils






