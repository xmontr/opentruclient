"use strict";


var selectedStep = [];


addon.port.on('addContainer', addContainer ); 
addon.port.on('addStep2container', addStep2container );
addon.port.on('addStepAndContainer', addStepAndContainer );
addon.port.on('addTempStep', addTempStep );
addon.port.on('displayStatus', displayStatus );
addon.port.on('displaySettings', displaySettings );
addon.port.on('mask', mask );
addon.port.on('maskStep', maskStep );
addon.port.on('unmask', unmask );
addon.port.on('unmaskStep', unmaskStep );
addon.port.on('showPopUp', showPopUp ); 
addon.port.on('showXpathPicker', showXpathPicker ); 
addon.port.on('reorder', reorder );
addon.port.on('updateStep', updateStep ); // update of end event
addon.port.on('updateFullStepDetail', updateFullStepDetail ); // change in the action of the step
addon.port.on('cleanAllStatus', hideAllStatus ); 
addon.port.on('cleanall', cleanall ); 
addon.port.on('deletestep', deletestep ); 
addon.port.on('updateWindowList', updateWindowList );  
addon.port.on('scrollToStep', scrollToStep ); 
addon.port.on('disablestep', disablestep ); 
addon.port.on('enablestep', enablestep ); 
addon.port.on('closeDialog', closeDialog ); 
addon.port.on('showCloseMessage', showCloseMessage ); 
addon.port.on('updateStepSelector', updateStepSelector );  
addon.port.on('refreshTransactions', refreshTransactions );
addon.port.on('populateStepList', populateStepList );
/* return dom object  that show the step model       */ 
function generateStepAndContainer( theStep,container,pos) {
	
	// the container itself
	var divcontainer = generateBasicContainer(container);

	
	// the step inside the basic container
	var divportlet = generateStep(theStep, pos);
	
	//add the child step
	divcontainer.appendChild(divportlet);
	
	

	return divcontainer;
	
}

/**
 *  create The dom element for one step
 * 
 */
function generateStep(theStep ,pos){
var divportlet = document.createElement('div');
	
	
	divportlet.setAttribute('class','portlet');
	divportlet.setAttribute('id',theStep.id);
	var divportletheader = document.createElement('div');
	var spanNumber=document.createElement('span');
	spanNumber.setAttribute('class','numbering');
	var imgplay = document.createElement('img');
	imgplay.setAttribute('src','images/media-playback-start-2.png');
	imgplay.setAttribute('onclick',"playStep('" + theStep.id  + "');" );
	divportletheader.setAttribute('class','portlet-header');
	var divportletcontent = document.createElement('div');
	divportletcontent.setAttribute('class','portlet-content');
	
	
	var headertext = document.createTextNode(theStep.action.displayName );
	
	//var contentText= document.createTextNode(JSON.stringify(theStep));
	
		var progressstep=document.createElement('div');
		progressstep.setAttribute('class','progressbar');
	divportlet.appendChild(progressstep);
	divportlet.appendChild(divportletheader);
	divportletheader.appendChild( spanNumber);
	spanNumber.appendChild(document.createTextNode(pos));
	divportletheader.appendChild(imgplay);
	divportletheader.appendChild(headertext);
	divportlet.appendChild(divportletcontent);
	divportletcontent.appendChild(StepDetail(theStep));
	if(theStep.action.endEventConfigurable === true) {
		divportletcontent.appendChild(stepEndDetail(theStep));
	}
	
	if(theStep.type==="Element"){
		divportletcontent.appendChild(StepElementDetail(theStep));
		
	}
	divportletcontent.appendChild(stepArgsDetail(theStep));
	
	return divportlet;
	
}



//generate DOM element for basicContainer
function generateBasicContainer(container) {
	var divcontainer = document.createElement('div');
	divcontainer.setAttribute('id',container.id);
	var progresscontainer=document.createElement('div');
	progresscontainer.setAttribute('class','progressbarcontainer');
	divcontainer.appendChild(progresscontainer);
	divcontainer.setAttribute('class','container');	
	
	
	return divcontainer ;
}


/*   build the gui element part for an elementStep   */
function StepElementDetail(theStep) {

		var elementfieldset= document.createElement('fieldset');
		elementfieldset.setAttribute('class','mainfieldset');
		
	var label=document.createElement('label');
	label.setAttribute('class','mainlabel');
	var labeltxt=document.createTextNode('ELEMENT');
	label.appendChild(labeltxt);
	elementfieldset.setAttribute('name','element');
	elementfieldset.appendChild(label);	
	// js/txt selector
	var divSelectorChooser = document.createElement('div'); 
	divSelectorChooser.setAttribute('name' , 'selectorchooser');
	divSelectorChooser.appendChild(getSelectorChooser(theStep ));
	elementfieldset.appendChild(divSelectorChooser);

	
	elementfieldset.appendChild(getdivSelectorChoice(theStep));
	return(elementfieldset);
	
}


function getdivSelectorChoice(theStep) {

	
	var divSelectorChoice = document.createElement('div');
	divSelectorChoice.setAttribute('name' , 'selectorchoice');	
	
	if(theStep.action.selector === "xp"){
		divSelectorChoice.appendChild(getXpathSelector(theStep));
		
	}else {		
		divSelectorChoice.appendChild(getJsSelector(theStep));
	}
 return(divSelectorChoice);	
}


// return the node ythat manage the js/txt selector
function getSelectorChooser(theStep ){
	var jsid= theStep.id+ '*js';
	var xpid= theStep.id+ '*xp';
	var selectionchooser = document.createElement('div');
	
	
	selectionchooser.setAttribute('name','codeselector');
	
	var jsbutton = document.createElement('input');
	jsbutton.setAttribute('type','radio') ;
	jsbutton.setAttribute('name','codeselector') ;
	jsbutton.setAttribute('id',jsid) ;
	
	var jslabel = document.createElement('label');
	jslabel.setAttribute('for',jsid) ;
	jslabel.appendChild(document.createTextNode('Javascript'));
	var xpbutton = document.createElement('input');
	xpbutton.setAttribute('type','radio') ;
	xpbutton.setAttribute('name','codeselector') ;
	
	jsbutton.setAttribute('onchange',"chooseSelector( this.id)") ;
	xpbutton.setAttribute('onchange',"chooseSelector( this.id)") ;
	xpbutton.setAttribute('id',xpid) ;
	var xplabel = document.createElement('label');
	var xpspan=document.createElement('span'); xpspan.appendChild(document.createTextNode('Xpath'));
	xplabel.appendChild(xpspan);
	xplabel.setAttribute('for',xpid) ;
	if(theStep.action.selector === "js"){
		jsbutton.setAttribute('checked','true') ;
		
	}else {
		
		xpbutton.setAttribute('checked','true') ;
	}
	
	selectionchooser.appendChild(jsbutton);	selectionchooser.appendChild(jslabel);
	selectionchooser.appendChild(xpbutton);	selectionchooser.appendChild(xplabel);
	return(selectionchooser);
	
	
	
	
	
	
	
}


// manage the event of change xpath - js as a selector
function chooseSelector(val){
	
	var data = val.split("*");
	var stepid= data[0];
	var selector = data[1];
	
	updateStepArgs(stepid, 'selector',selector);
	
	
	
	
}


/// return the node managing the js selection of one element
function getJsSelector(theStep) {
	
	//js selector
	var xpathselection= document.createElement('div');
	xpathselection.setAttribute('name','xpathselector');
	var spanelement= document.createElement('span');
	var imghighlightelement= document.createElement('img');
	var imgreplaceelement= document.createElement('img');
	var inpuelement= document.createElement('input');
	
	xpathselection.appendChild(spanelement);
	xpathselection.appendChild(inpuelement);
	xpathselection.appendChild(imghighlightelement);
	xpathselection.appendChild(imgreplaceelement);
	spanelement.appendChild(document.createTextNode('js:'));
	xpathselection.setAttribute('style','position:relative');
	inpuelement.setAttribute('onclick',"showJsEditor('" +theStep.id + "','js', this.value )");
	//inpuelement.setAttribute('onchange',"updateStepArgs('" +theStep.id + "','js'," + "this.value)");
	inpuelement.setAttribute('type','text');inpuelement.setAttribute('name','js');inpuelement.setAttribute('value',theStep.action.element.js);inpuelement.setAttribute('class','inputarg');
	imghighlightelement.setAttribute('src','images/system-search-6.png');
	imghighlightelement.setAttribute('style','position:absolute; right:-5px;');
	imgreplaceelement.setAttribute('src','images/gears.png');
	imgreplaceelement.setAttribute('title','pick up js');
	imgreplaceelement.setAttribute('onclick',"pickupJs('"+ theStep.id+"');");
	imghighlightelement.setAttribute('title','highlight');
	imghighlightelement.setAttribute('onclick',"highLightStepJS( this.previousSibling.value);" );
	return xpathselection;
	
	
	
	
	
	
	
}


/// return the node managing the xpath selection of one element
function getXpathSelector(theStep){
	
	//xpath selector
	var xpathselection= document.createElement('div');
	xpathselection.setAttribute('name','xpathselector');
	var spanelement= document.createElement('span');
	var imghighlightelement= document.createElement('img');
	var imgreplaceelement= document.createElement('img');
	var inpuelement= document.createElement('input');
	
	xpathselection.appendChild(spanelement);
	xpathselection.appendChild(inpuelement);
	xpathselection.appendChild(imghighlightelement);
	xpathselection.appendChild(imgreplaceelement);
	spanelement.appendChild(document.createTextNode('xpath:'));
	xpathselection.setAttribute('style','position:relative');
	inpuelement.setAttribute('onchange',"updateStepArgs('" +theStep.id + "','xpath'," + "this.value)");
	inpuelement.setAttribute('type','text');inpuelement.setAttribute('name','xpath');inpuelement.setAttribute('value',theStep.action.element.xpath);inpuelement.setAttribute('class','inputarg');
	imghighlightelement.setAttribute('src','images/system-search-6.png');
	imghighlightelement.setAttribute('style','position:absolute; right:-5px;');
	imgreplaceelement.setAttribute('src','images/gears.png');
	imgreplaceelement.setAttribute('title','pick up xpath');
	imgreplaceelement.setAttribute('onclick',"pickupXpath('"+ theStep.id+"');");
	imghighlightelement.setAttribute('title','highlight');
	imghighlightelement.setAttribute('onclick',"highLightStepXpath( this.previousSibling.value);" );
	return xpathselection;
	
	
	
}





//show the part that define the end event for the step
function stepEndDetail(theStep){
	var stepfieldset= document.createElement('fieldset');
	stepfieldset.setAttribute('class','mainfieldset');
	stepfieldset.setAttribute('name','endofevent');
	var label=document.createElement('label');
	var labeltxt=document.createTextNode('End Of Event');
	label.appendChild(labeltxt);
		var selectaction=document.createElement('select');
	selectaction.setAttribute('name','endofevent');
	selectaction.setAttribute('class','mainselect');
	stepfieldset.appendChild(label);
	stepfieldset.appendChild(selectaction);
	var opt= document.createElement('option');
	opt.setAttribute('value',"Action Completed");
	 if(theStep.action.endEvent === 'Action Completed'){			
			opt.setAttribute('selected',true);
		}
	var optTxt=document.createTextNode( "Action Completed");
	opt.appendChild(optTxt);
	selectaction.appendChild(opt);
	//
	 opt= document.createElement('option');
	 	 if(theStep.action.endEvent === 'network/completed'){
			
			opt.setAttribute('selected',true);
		}
	opt.setAttribute('value','network/completed');
	 optTxt=document.createTextNode( "Network Completed");
	opt.appendChild(optTxt);
	selectaction.appendChild(opt);
	//
	
	 opt= document.createElement('option');
 	 if(theStep.action.endEvent === 'tabload'){
		
		opt.setAttribute('selected',true);
	}
opt.setAttribute('value','tabload');
 optTxt=document.createTextNode( "tab loaded");
opt.appendChild(optTxt);
selectaction.appendChild(opt);
	
	
	
	//
	 opt= document.createElement('option');
	 if(theStep.action.endEvent === 'navigation/completed'){			
			opt.setAttribute('selected',true);
		}		
	opt.setAttribute('value',"navigation/completed");
	 optTxt=document.createTextNode( "Nav ended");
	opt.appendChild(optTxt);
	selectaction.appendChild(opt);
	
	
	return(stepfieldset);
	
}




function StepDetail(theStep){
	var stepfieldset= document.createElement('fieldset');
	stepfieldset.setAttribute('class', 'mainfieldset');
	stepfieldset.setAttribute('name','StepDetail');
	var label=document.createElement('label');
	var labeltxt=document.createTextNode('STEP');
	label.setAttribute('class','mainlabel');
	label.appendChild(labeltxt);
	var selectaction=document.createElement('select');
	selectaction.setAttribute('name','action');
	selectaction.setAttribute('class','mainselect');
	stepfieldset.appendChild(label);
	stepfieldset.appendChild(selectaction);
	for( var i=0; i<theStep.actions.length;i++){
		var opt= document.createElement('option');
		if(theStep.actions[i] === theStep.action.name){
			
			opt.setAttribute('selected',true);
		}
		opt.setAttribute('value',theStep.actions[i]);
		var optTxt=document.createTextNode( theStep.actions[i]);
		opt.appendChild(optTxt);
		selectaction.appendChild(opt);
	}
	return(stepfieldset);
}



/***
 * 
 *  build the dom element that edit an argument in a tag <input type=text >
 * 
 * 
 */
function rendertextInputEditor(theStep ,  argsaction){
	var ret = document.createElement('div');
	var sp = document.createElement('span');
	var sptxt= document.createTextNode(argsaction.name +':');
	sp.appendChild(sptxt);
	var input = document.createElement('input');
	input.setAttribute('type','text');
	input.setAttribute('class','inputarg');
	input.setAttribute('value',argsaction.value);
	input.setAttribute('onchange',"updateStepArgs('" +theStep.id + "','" + argsaction.name + "'," + "this.value)");
	ret.appendChild(sp);
	ret.appendChild(input);
	ret.appendChild(document.createElement('br'));
	
	
	
return ret;	
}


function renderListEditor(theStep ,  argsaction, arrayval) {
	var ret = document.createElement('div');
	var selectedval = argsaction.value ;
	var sp = document.createElement('span');
	var sptxt= document.createTextNode(argsaction.name +':');
	sp.appendChild(sptxt);
	var input = document.createElement('select');
	input.setAttribute('class','inputarg');
	input.setAttribute('onchange',"updateStepArgs('" +theStep.id + "','" + argsaction.name + "'," + "this.value)");
	for( var i=0; i<arrayval.length; i++ ){
		var option = document.createElement('option');
		option.setAttribute('value',arrayval[i].key);
		var txtopt = document.createTextNode(arrayval[i].val) ;
		option.appendChild(  txtopt );
		if( selectedval === arrayval[i].key ){
			option.setAttribute('selected',true);
			
			
		}
		input.appendChild(option);
		
	}
	
	
	
	ret.appendChild(sp);
	ret.appendChild(input);
	ret.appendChild(document.createElement('br'));
	
	return ret;
	
	
}





function renderJSInputEditor(theStep ,  argsaction){
	var ret = document.createElement('div');
	var sp = document.createElement('span');
	var sptxt= document.createTextNode(argsaction.name +':');
	sp.appendChild(sptxt);
	var input = document.createElement('input');
	input.setAttribute('type','text');
	input.setAttribute('class','inputarg');
	input.setAttribute('value',argsaction.value);
	
	input.setAttribute('onclick',"showJsEditor('" +theStep.id + "','" + argsaction.name + "', this.value )");
	ret.appendChild(sp);
	ret.appendChild(input);
	ret.appendChild(document.createElement('br'));
	
	
	
return ret;	
}





function stepArgsDetail(theStep){
	var argsfieldset= document.createElement('fieldset');
	argsfieldset.setAttribute('class', 'mainfieldset');
	argsfieldset.setAttribute('name','stepArgsDetail');
		var label=document.createElement('label');	
		label.setAttribute('class', 'mainlabel');
	var labeltxt=document.createTextNode('Arguments');
	label.appendChild(labeltxt);
	argsfieldset.appendChild(label);
	for (var i=0; i< theStep.action.args.length; i++ ){
		
		var argsaction = theStep.action.args[i];
		switch( argsaction.editor.name){
		
		case 'textInputEditor':argsfieldset.appendChild(rendertextInputEditor(theStep, argsaction)) ;break;
		case 'jsEditor':argsfieldset.appendChild(renderJSInputEditor(theStep, argsaction)) ;break;
		case 'listInputEditor':  argsfieldset.appendChild( renderListEditor(theStep, argsaction,argsaction.editor.values)); break;
		
		default: throw ( new Error(" EditorNotFoundException - unknown editor " + argsaction.editor.name));
		
		
		
		}
		

	}
	
	
	return(argsfieldset);
}


 /* set style for new dom element that show a step */
function styleStep  (theStep,element) {
	$(element).addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
.find( ".portlet-header" )
.addClass( "ui-widget-header ui-corner-all" )
.prepend( "<span class='ui-icon ui-icon-minusthick portlet-toggle'></span><input type='checkbox' class='myCheckbox' onchange='updateStepSelection(this);'  />");
	if(theStep.enable === false ){
		$(element).addClass("disabledstep");
		$(element).find( ".portlet-header" ).addClass("disabledstep");
		
	} else {
		
		$(element).addClass("enabledstep");
		$(element).find( ".portlet-header" ).addClass("enabledstep");	
		
	}
	
$(element).find( " .portlet-toggle" ).click(function() {
var icon = $( this );
icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
icon.closest( ".portlet" ).find( ".portlet-content" ).toggle();
});

$(element).find( "select[name='action']" ).selectmenu();
$(element).find( "select[name='endofevent']" ).selectmenu();

// for the end event
var endofeventChangeHandler=function( event, ui ) {
	updateStepArgs(theStep.id ,'endevent',this.value);
	
};

$(element).find( "select[name='endofevent']" ).on( "selectmenuchange",endofeventChangeHandler); 
// for the choose of action
var actionChangeHandler = function(event, ui) {
	updateStepArgs(theStep.id ,'action',this.value);	
	
};
$(element).find( "select[name='action']" ).on( "selectmenuchange",actionChangeHandler);


$(element).find("div[name='codeselector']").buttonset(); 


}  

/* draw a new step at the end of the list
 * 
 *   add 1 step in one basic container from recording 
 *  
 *  */
function  addStepAndContainer (step, container,pos) {

var element = generateStepAndContainer(step,container,pos);
	styleStep(step,element.childNodes[1]);

	$( "#steplist" ).append(element);
	

	
	
}
/***
 *  add single container ( without step - this  generate the dom for container
 * 
 * @param container
 */
function addContainer( container){
	var contype = container.type;
	var cont2add=null;
	switch(contype){
	case 'Basic': cont2add = generateBasicContainer(container);break;
	
	default:throw new Error("unknown container type " + contype);
	}
	$( "#steplist" ).append(cont2add);
	
}

/***
 * 
 *  add a a step to a container referenced by id at the position pos - this generate thedom for the step
 *   the dom for the container is supposed already existing
 * 
 */
//pos not correctly used for the moment
function addStep2container(step, containerid, pos){
	
	var domstep = generateStep(step,pos);
	
	$("#"+containerid).append(domstep);
	
	
	styleStep(step,domstep);
	
}


/*diplay the status of step after run an retrieve of the status*/
function displayStatus(status){
	var selector =document.getElementById(status.id);
	var im = document.createElement('img');
	im.setAttribute('name','statusstep');	
	im.setAttribute('src',status.status==="fail"?'images/dialog-cancel.png':'images/dialog-accept.png');
	im.setAttribute('title',status.message);	
	
	if(status.status==="fail"){
		$(im).tooltip();		
		
	}
	$(selector).find( ".portlet-header" ).prepend(im);	
		
	
}


function hideAllStatus(){
	$("img[name='statusstep']").remove();
	
}


/** scroll the step on top of the list **/
function scrollToStep( stepid){
	var stringto = "#" + stepid ;
	var container = $('#tabs');
	   var  scrollTo = $(stringto);
	   var prop = {	    scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()	};
		container.animate(prop);
	
	
	
}


/* play a single step interactive */
function playStep(stepid) {
	var stringto = "#" + stepid ;
	hideAllStatus();
	//ensure visibility of the step
	var container = $('#tabs');
   var  scrollTo = $(stringto);
   var prop = {	    scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()	};
	container.animate(prop);
	addon.port.emit('playStep',stepid);
	
}


/* highlight the step */

function highLightStepXpath(xpath) {
	addon.port.emit('highLightxpath',xpath);
	
}

function highLightStepJS(js) {
	addon.port.emit('highLightJs',js);
	
}





// 
function displaySettings(objSettings){
	for ( var prop in objSettings ) {
		document.getElementById(prop).value=objSettings[prop];
		
	}
	
	
}

// mask all the gui
function mask() {
	
	$( "#load" ).show();
	
}

// mask the step when running
function maskStep(stepid){
	var selector= '#' + stepid;
	$(selector).find( ".progressbar" ).progressbar({
value: false
});
	
}


// unmask the step when running
function unmaskStep(stepid){
		var selector= '#' + stepid;
		$(selector).find( ".progressbar" ).progressbar({
value: 0
});
	
}

 // unmask all the gui
function unmask(){
	
	$( "#load" ).hide();
}












/*
create the dom structure for the popup use in highlight
*/
function  createPopup  (e,add) {
	
	var ret = document.createElement('div');
	ret.setAttribute("id","dialog-message");
	ret.setAttribute("title","Alert");
	var p = document.createElement('p');
	var sp = document.createElement('span');
	sp.setAttribute('class',"ui-icon ui-icon-circle-check");
	sp.setAttribute('style',"float:left; margin:0 7px 50px 0;");
	
	p.appendChild(sp);
	p.appendChild(document.createTextNode(add));
	p.appendChild(document.createTextNode(e)); 
	ret.appendChild(p);
	return ret;
}





/*
create the dom structure for the popup use in close application
*/
function  createPopupClose  (add) {
	
	var ret = document.createElement('div');
	ret.setAttribute("id","dialog-message");
	ret.setAttribute("title","Alert");
	var p = document.createElement('p');
	var p2 = document.createElement('p');
	var sp = document.createElement('span');
	sp.setAttribute('class',"ui-icon ui-icon-circle-check");
	sp.setAttribute('style',"float:left; margin:0 7px 50px 0;");
	var saveinput =  document.createElement('input');
	saveinput.setAttribute('checked', true);
	saveinput.setAttribute('type', "checkbox");
	saveinput.setAttribute('name', "doSave");
	
	p2.appendChild(saveinput);
	p2.appendChild(document.createTextNode("save the script"));
	p.appendChild(sp);
	p.appendChild(document.createTextNode(add));
	 
	ret.appendChild(p);
	ret.appendChild(p2);
	return ret;
}




/***

display alert dialog on the gui 

*/
function showPopUp(e,add){
	
	$("#dialog-message").remove();
		$("body").append(createPopup(e,add));
		
	
	
			$("#dialog-message").dialog({
			modal: true,
			buttons:{
			Ok: function() {
				$( this ).dialog("close");
			}
		}
		}).dialog( "open" );
	
	
}



/***
 * 
 *  cancel the xpath picker
 * 
 * 
 */

function cancelXpathPicker() {
	
	addon.port.emit('cancelXpathPicker');	
	
	
	
}


function closeAndSave( dosave){
	
	addon.port.emit('closeAndSave', dosave);
	
	
}


/***
 * 
 *  show the xpath picker  message when user pickup a xpth in the content window
 * 
 */

function showXpathPicker(){
	var message =" click on one html element in the content window or cancel";
$("#dialog-message").remove();
		$("body").append(createPopup("",message));
		
	
	
	$("#dialog-message").dialog({
		modal: true,
		buttons:{
		Cancel: function() {
			$( this ).dialog("close");
			cancelXpathPicker();
		}
	}
	}).dialog( "open" );
	
	
}


/*****
 * 
 * 
 *  showCloseMessage : propose the user to save the script before exiting
 */

function showCloseMessage(){
	var message =" Do you want to quit the application";
	$("#dialog-message").remove();
		$("body").append(createPopupClose(message));
		
	
	
	$("#dialog-message").dialog({
		modal: true,
		buttons:{
		Cancel: function() {
			$( this ).dialog("close");
			
		},
		Ok:function(){
		var needsave = 	$( this ).find("input[name='doSave']").is(":checked");
			closeAndSave(needsave);	
			$( this ).dialog("close");
			
		}
	}
	}).dialog( "open" );
	
	
}





/***
 * 
 *  close the dialogbox
 * 
 */


function closeDialog() {
	
	$( "#dialog-message").dialog("close");
	
	
}


/**
 * 
 * 
 * 
 */

function createJsEditor(stepid, jsvalue) {
	
	var ret = document.createElement('div');
	
	ret.setAttribute("id","jsEditor" +stepid);
	ret.setAttribute("title","Javascript editor");
	
	var textarea = document.createElement('textarea');
	textarea.setAttribute('class',"jsclass");

	textarea.appendChild(document.createTextNode(jsvalue));
	ret.appendChild(textarea);

	 
	
	return ret;
	
	
}








/**
 * 
 * 
 * 
 */
function showJsEditor(stepid,argsname, jsvalue){
	
	if( document.getElementById('jsEditor'+stepid)    === null){
		
		$("body").append(createJsEditor(stepid, jsvalue) );
	}
		
	
	



		$("#jsEditor"+stepid).dialog({
		      height: 500,
		      width: 350,	
		modal: true,
		buttons:{
		Ok: function() {
			//$( this ).dialog("close");
			var ta = $( this ).find('.jsclass')[0] ;		
			
			updateStepArgs(stepid,argsname,ta.value);
			$( this ).dialog("close");		
		
		}
		}
	}).dialog( "open" );

		}
	
	
	






/*

when the list receive z new element by drag & drop

*/

var tempStep, tempContainer;
function onDrop(event, ui) {	
	var element = generateStepAndContainer(tempStep,tempContainer,null);
	styleStep(tempStep,element.childNodes[1]);
	ui.helper.replaceWith(element);
	
	
	addon.port.emit('storeTempstep');
}

/*

create the new item for the step list when drag start

*/

function onDrag(event, ui) {
	
	addon.port.emit('createNewElement', this.parentNode.id);
	
	

}


/// create a new empty temp step
function addTempStep(theNewStep,newcont){
	tempStep=theNewStep;
	tempContainer=newcont;
	
	
	
}


/**

recalculate the order of the step
*/

function reorder(aContainer){
	
	for( var index=0;index<aContainer.length; index++){
		var cid=aContainer[index];
		var selector="#"+cid;
		$(selector).find( ".numbering" ).html("" + index);
		
	}
	
}


/*** get thr position of the step ****/


function getPos(step) {
	
	var selector="#"+step.id;
	var ret =$(selector).find( ".numbering" ).text();
	
	return ret;
	
	
	
}



/*
update the end step  event of the step 

*/
function updateStep(stepid,newval){	
	var selector='#' + stepid ;
    var sel =  $(selector).find( "select[name='endofevent']" );
	sel.val(newval) ;
	sel.selectmenu('refresh');
	
}



/**** update the view of the step   container ***/

function updateFullStepDetail(step){
	
	var thepos = getPos(step)
	var newstep = generateStep(step,thepos);
	styleStep(step,newstep);
	var selector='#' + step.id ;
	$(selector).replaceWith(newstep);
}




/**

update the step argswhen gui updated **/

function updateStepArgs(stepid,argsname,newvalue){
	
		addon.port.emit('updateStepArgs',stepid,argsname,newvalue);

	
}

/**
 * 
 *  delete all the step from gui
 * 
 * 
 */

function cleanall() {
	
	$( "#steplist" ).empty();
	
	
}


/**
 * 
 *  
 *  delete a step from the gui param.stepid
 *  
 *  if param.containerid is set delete also the container param.containerid
 *  
 *  
 * 
 * 
 */

function deletestep(param) {
	
var id = "#" + param.stepid ;
$(id).remove();
if( typeof(param.containerid) !==  "undefined"){
	id="#" + param.containerid ;
	$(id).remove();
}
	
}


function disablestep (param) {
	var id = "#" + param.stepid ;
	$(id).addClass("disabledstep");
	$(id).removeClass("enabledstep");
	$(id).find( ".portlet-header" ).addClass("disabledstep");
	$(id).find( ".portlet-header" ).removeClass("enabledstep");
	

}



function enablestep (param) {
	var id = "#" + param.stepid ;
	$(id).addClass("enabledstep");
	$(id).removeClass("disabledstep");
	$(id).find( ".portlet-header" ).addClass("enabledstep");
	$(id).find( ".portlet-header" ).removeClass("disabledstep");
	

}






/**
 * 
 *  set the select option of list of window
 * 
 */

function updateWindowList(options) {
	
	$("#activewindowid").empty();
	$("#activewindowid").append(options.join(""));

	$("#activewindowid").selectmenu().selectmenu('refresh');
	
}



/***
 * 
 *  lauch the one click xpath finder to select one xpath
 *  
 * 
 * 
 */
function pickupXpath(stepid){
	
	addon.port.emit('pickupxpath',stepid);
	
	
	
	
}


/***
 * 
 *   update the selector choice  for the step
 * 
 */

function updateStepSelector ( thestep){
	
	var id = "#" + thestep.id ;
	$(id).find("div[name='selectorchoice']").replaceWith( getdivSelectorChoice(thestep));
	
	
}


/***
 * 
 *  get array of selected stepid
 * 
 * 
 */


 
 
 
 function updateStepSelection( thecheckbox ){
	 
	 
	var relatedstepid= $(thecheckbox).closest( '.portlet' ).attr('id') ;
	if(thecheckbox.checked ) { // add to selection
		selectedStep.push(relatedstepid);
		
		
			} else { // remove from selection
				var pos = selectedStep.indexOf(relatedstepid);
				selectedStep.splice(pos, 1);
				
			}
	
	addon.port.emit('currentStepSelection',selectedStep);
	
	 
	 
 }
 
 
 function addTransaction() {
	 var selectorname= "#transid";
	 var selectorstart="#startingstepid";
	 var selectorend="#endingstepid";	
	 
	 var newtransaction = {
			name:$(selectorname).val(),
			startid:$(selectorstart).val(),
			endid:$(selectorend).val()
			 
			 
			 
	 };	 
	 addon.port.emit('addTransaction',newtransaction);
	 
	 $(selectorname).val('');
	 
 }
 
 
 
 function selectTransaction() {
	 
	var  txid=$("#transactionlistid").val()[0];
	 addon.port.emit('viewTransaction',txid);
	
	 
	 
 }
 
 
 
 function removeTransaction() {
	 
	 
	 
	 
 }
 
 /***
  * 
  *  show the transactions in the gui
  * 
  */
 function refreshTransactions(atx){
	var selector= "#transactionlistid"; 
	$(selector).empty();
	var options=[];
	for(var i = 0; i< atx.length; i++){
		var newopt="<option value=\"" + atx[i].id + "\" >" +atx[i].name + "</option>";
		options.push(newopt);
		
	}
	

	$(selector).append(options.join(""));
	 
 }
 
 
 function populateStepListSelector(selector,astep , selection="-1") {
	 var key, checked;
		$(selector).empty();
		var options=[];
		for(var i = 0; i< astep.length; i++){
			 key = astep[i].id ; 
			 checked = key ===selection ? "selected" : "" ;
			 
			var newopt="<option value=\"" + key + "\" "  + checked +">"+  astep[i].name + "</option>";
			options.push(newopt);
			
		}
		var defaultoption = "<option value=\"-1\" >--------------------------------</option>";
		options.push(defaultoption);
		
		$(selector).append(options.join(""));
	 
	 
 }
 
 
 function populateStepList( astep , selstart , selend){
		
		
		populateStepListSelector("#startingstepid" , astep,selstart);
		populateStepListSelector("#endingstepid" , astep, selend);	
	 
	 
 }
 
 function updateTransaction() {
	 var selectorname= "#transid";
		var  txid=$("#transactionlistid").val()[0];
		 var selectorstart="#startingstepid";
		 var selectorend="#endingstepid";	
	
	 
	 var newtransaction = {
				name:$(selectorname).val(),
				startid:$(selectorstart).val() ,
				endid:$(selectorend).val()
				 
				 
				 
		 };
		 
		 addon.port.emit('updateTransaction',newtransaction,txid);
	 
	 
	 
 }
 
 

