"use strict";


function highlightStep(xpath) {


	
	var elementarray = Utils.getObjectsFromXpath(document.defaultView, xpath);
	if(elementarray.length === 0){

		throw new Error(" No Item Founded  " ) ;
	
		
	}
	

	
	for( var i=0;i<elementarray.length;i++){
		var element = elementarray[i];
		$(element).effect( "highlight", {color:"red"}, 2000  ); 
		//$(element).remove();
		
	}
	





}


function dispatchKeyboardEvent (param){	
	

	var elementarray = Utils.getObjectsFromXpath(param.element.xpath);
	if(elementarray.length > 1){

		throw new Error(" Multiple Selection Founded  " ) ;		
		
	}
		if(elementarray.length ==  0){
		throw new Error(" No Item Founded  " ) ;		
		
	}	
	
	var theKeyboardEvent = Utils.generateKeyboardEvent(param.args  ) ; 
	elementarray[0].focus();
   var ret = elementarray[0].dispatchEvent(theKeyboardEvent);	
  
  
   
   return ret;
	


}


function dispatchText(param){
	

	var elementarray = Utils.getObjectsFromXpath(param.element.xpath);
	if(elementarray.length > 1){

		throw new Error(" Multiple Selection Founded  " ) ;		
		
	}
		if(elementarray.length ==  0){
		throw new Error(" No Item Founded  " ) ;		
		
	}	
	

	elementarray[0].focus();	
   //elementarray[0].value+=param.args;

  


}

















function dispatchMouseEvent (param){
	
	

	var elementarray = Utils.getObjectsFromXpath(param.element.xpath);
	if(elementarray.length > 1){

		throw new Error(" Multiple Selection Founded  " ) ;
		
		
		
	}
		if(elementarray.length ===  0){

		throw new Error(" No Item Founded  " ) ;
		
		
		
	}
	
	
	
	
	var theMouseEvent = Utils.generateMouseEvent(param.args  ) ; 
	elementarray[0].focus();
	var ret = elementarray[0].dispatchEvent(theMouseEvent);	
	
	
	return ret;

}


function manageError (e){
console.log( "xxxxxxxxxxxxxxxxxxxxxxxxx managed error"+e.message);	
	
}


self.port.on('highLight', highlightStep);
self.port.on('dispatchMouseEvent', dispatchMouseEvent); 
self.port.on('dispatchKeyboardEvent', dispatchKeyboardEvent); 
self.port.on('dispatchText', dispatchText); 
self.port.on('error',manageError);
self.on('error',manageError);

