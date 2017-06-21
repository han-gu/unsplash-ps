/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/


function sayHello(){
    alert("hello from ExtendScript");
}

function addPictureToObject(selectedFile){
	
	var shapex = getCenterOfShapex(app.activeDocument.activeLayer);
	var shapey = getCenterOfShapey(app.activeDocument.activeLayer);

	var shapewidth=getShapeWidth(app.activeDocument.activeLayer);
	var shapeheight=getShapeHeight(app.activeDocument.activeLayer);

	placeEmbeddedPicture(selectedFile);
	resizeImage(app.activeDocument.activeLayer,shapewidth,shapeheight);
	var startx=app.activeDocument.width.value/2;
	var starty=app.activeDocument.height.value/2;

	movePicture(app.activeDocument.activeLayer,shapex-startx,shapey-starty);

	createClippingMask(app.activeDocument.activeLayer);
	//app.activeDocument.activeLayer.name="hi";
}

function placeEmbeddedPicture(selectedFile){
	var idPlc = charIDToTypeID( "Plc " ); 
	var desc11 = new ActionDescriptor();  
	var idnull = charIDToTypeID( "null" );

	desc11.putPath( idnull, new File(selectedFile) );
	var idFTcs = charIDToTypeID( "FTcs" ); 
	var idQCSt = charIDToTypeID( "QCSt" );   
	var idQcsa = charIDToTypeID( "Qcsa" ); 
	desc11.putEnumerated( idFTcs, idQCSt, idQcsa );
	var idOfst = charIDToTypeID( "Ofst" );     
	var desc12 = new ActionDescriptor();     
	var idHrzn = charIDToTypeID( "Hrzn" );    
	var idPxl = charIDToTypeID( "#Pxl" );      
	desc12.putUnitDouble( idHrzn, idPxl, 0.000000 );     
	var idVrtc = charIDToTypeID( "Vrtc" );    
	var idPxl = charIDToTypeID( "#Pxl" );    
	desc12.putUnitDouble( idVrtc, idPxl, 0.000000 );
	var idOfst = charIDToTypeID( "Ofst" );
	desc11.putObject( idOfst, idOfst, desc12 );
	executeAction( idPlc, desc11, DialogModes.NO );

}

function movePicture(selectedLayer,a,b){
	movex = new UnitValue(a, "in");
	movey = new UnitValue(b, "in");
	selectedLayer.translate(movex,movey);
}

function getShapeWidth(selectedLayer){
	return selectedLayer.bounds[2].value-selectedLayer.bounds[0].value;
}

function getShapeHeight(selectedLayer){
	return selectedLayer.bounds[3].value-selectedLayer.bounds[1].value;
}

function createClippingMask(selectedLayer){
	selectedLayer.grouped=true;
}

function getCenterOfShapex(selectedLayer){
	return ((selectedLayer.bounds[2].value-selectedLayer.bounds[0].value)/2)+selectedLayer.bounds[0].value;
}

function getCenterOfShapey(selectedLayer){
	return ((selectedLayer.bounds[3].value-selectedLayer.bounds[1].value)/2)+selectedLayer.bounds[1].value;
}

function getCenterOfRectx(selectedLayer){
	return selectedLayer.bounds[0].value+0.5*selectedLayer.bounds[2].value;
}

function getCenterOfRecty(selectedLayer){
	return ((selectedLayer.bounds[3].value-selectedLayer.bounds[1].value)/2)+selectedLayer.bounds[1].value;
}

function resizeImage(selectedLayer,shapewidth,shapeheight){
	var picwidth = selectedLayer.bounds[2].value-selectedLayer.bounds[0].value;
	var picheight = selectedLayer.bounds[3].value-selectedLayer.bounds[1].value;
	selectedLayer.resize(((shapewidth/picwidth)*100),((shapeheight/picheight)*100));
	
}


