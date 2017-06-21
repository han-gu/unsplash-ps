/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
    'use strict';

    var csInterface = new CSInterface();
    var isFound=false;
    var pageNumber=1;
    var totalPages;
    var query;
    var url;
    var unsplash = require('unsplash-api');
	var clientId = '56fcfe94d94b71208dce8473c036ab331902feb9d897c37976e0dc56bf1f7d84';
	unsplash.init(clientId);
	var DELAY = 700, clicks = 0, timer = null;

	$(document).on({
	    ajaxStart: function() {
	    	$("body").addClass("loading");
	    },
		ajaxStop: function() {
			$("body").removeClass("loading");
		}    
	});


	//Add event listeners and differentiate between single and double click events
	for(var i=0;i<30;i++){
		var temp = "#thumb"+i;
		
		$(temp).on("click", function(e){
			url = $(this).attr("value");
        	clicks++;  //count clicks

        	if(clicks === 1) {

            	timer = setTimeout(function() {

                	openInPhotoshopCanvas(url);    
                	clicks = 0;             

            	}, DELAY);

        	} else {

            	clearTimeout(timer);    
            	openInPhotoshop(url); 
            	clicks = 0;             
        	}

	    }).on("dblclick", function(e){
	        e.preventDefault();  
	    });	
	}

	/*

	for(var i=0;i<30;i++){
		var temp = "thumb"+i;
		document.getElementById(temp).addEventListener('click',function(){
			url = $(this).attr("value");
			openInPhotoshopCanvas(url);
		});
	}
	*/

    function openInPhotoshopCanvas(url) {
    	$('#loader').show();
    	$('#maindiv').css("opacity","0.5");
		//Local destination filepath
		var destination = csInterface.getSystemPath(SystemPath.EXTENSION) + '/img/';
		
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';

		xhr.onload = function(e) {

			//Convert unicode array to array of binary 
			var uInt8Array = new Uint8Array(this.response);
			var i = uInt8Array.length;
			var binaryString = new Array(i);
			while (i--) {
				binaryString[i] = String.fromCharCode(uInt8Array[i]);
			}

			//Combine array elements into one string
			var data = binaryString.join('');

			// Creates base-64 encoded ASCII string from binary data.
			var base64 = window.btoa(data);

			var tempName = "tempImage";
			var downloadedFile = destination + tempName + '.jpg';
			$('#maindiv').css("opacity","1.0");
			$('#loader').hide();
			// Write the file as Base64 encoded
			window.cep.fs.writeFile(downloadedFile, base64, cep.encoding.Base64);

			csInterface.evalScript("placeEmbeddedPicture('"+downloadedFile+"')", 
				function(res) {
					if (res != "EvalScript_ErrMessage") {
						//Delete File afterwards
						window.cep.fs.deleteFile(downloadedFile);
					}
				}
			);
		};


		xhr.send();
	};

	function openInPhotoshop(url) {
		$('#loader').show();
    	$('#maindiv').css("opacity","0.5");
		console.log("hi")
		//Local destination filepath
		var destination = csInterface.getSystemPath(SystemPath.EXTENSION) + '/img/';
		
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';

		xhr.onload = function(e) {

			//Convert unicode array to array of binary 
			var uInt8Array = new Uint8Array(this.response);
			var i = uInt8Array.length;
			var binaryString = new Array(i);
			while (i--) {
				binaryString[i] = String.fromCharCode(uInt8Array[i]);
			}

			//Combine array elements into one string
			var data = binaryString.join('');

			// Creates base-64 encoded ASCII string from binary data.
			var base64 = window.btoa(data);

			var tempName = "tempImage";
			var downloadedFile = destination + tempName + '.jpg';
			$('#maindiv').css("opacity","1.0");
			$('#loader').hide();
			// Write the file as Base64 encoded
			window.cep.fs.writeFile(downloadedFile, base64, cep.encoding.Base64);

			csInterface.evalScript("addPictureToObject('"+downloadedFile+"')", 
				function(res) {
					if (res != "EvalScript_ErrMessage") {
						//Delete File afterwards
						window.cep.fs.deleteFile(downloadedFile);
					}
				}
			);
		};
		xhr.send();

	};

    function getFirst30Pictures(event){
    	//If enter key is pressed
    	if (event.which == 13) {
    		pageNumber=1;
    		$("#pagenum").text(pageNumber);
    		$("#prevButton").attr('disabled','disabled');

    		query = $(this).val();

			unsplash.searchPhotos(query, null, 1, 30, function(error, photos, link) {

				//No pictures matching query
				if(link==null){
					csInterface.evalScript("alert('Nothing found!\\nPlease try a different keyword')");
					return;
				}
				else{
					totalPages=link[45];
					if(totalPages==1){
						$("#nextButton").attr('disabled','disabled');
					}
					else{
						$("#nextButton").removeAttr('disabled');
					}
					$('#totalpages').text(totalPages);
				}
				for(var i=0;i<photos.length;i++){
					var thumb = "#thumb" + i;
					$(thumb).attr("src", photos[i].urls.thumb);
					$(thumb).attr("value", photos[i].urls.full);
					//somehow save photos[i].thumb
				}
				//Make the rest of the pics empty if not 30 on the page
				for(var k=photos.length;i<30;i++){
					var thumb = "#thumb" + i;
					$(thumb).attr("src", "img/transparent.png");
				}

				isFound=true;
				pageNumber++;
			});
			
				
		}
    }



	function getNext30Pictures(){
		//If no more pictures
		if(pageNumber==totalPages){
			$("#nextButton").attr('disabled','disabled');
			$("#prevButton").removeAttr('disabled');
		}
		
		unsplash.searchPhotos(query, null, pageNumber, 30, function(error, photos, link) {
			for(var i=0;i<photos.length;i++){
				var thumb = "#thumb" + i;
				$(thumb).attr("src", photos[i].urls.thumb);
			}
			for(var k=photos.length;i<30;i++){
				var thumb = "#thumb" + i;
				$(thumb).attr("src", "img/transparent.png");
				//somehow save photos[i].thumb
			}
			$("#pagenum").text(pageNumber);
			pageNumber++;
		});
		
		
    }

    function getLast30Pictures(){
		//If no more pictures
		$("#nextButton").removeAttr('disabled');
		pageNumber--;
		pageNumber--;
		if(pageNumber==1){
			$("#prevButton").attr('disabled','disabled');
		}
		if(pageNumber<1){
			pageNumber=2;
			return;
		}
		else{
			unsplash.searchPhotos(query, null, pageNumber, 30, function(error, photos, link) {
				for(var i=0;i<photos.length;i++){
					var thumb = "#thumb" + i;
					$(thumb).attr("src", photos[i].urls.thumb);
				}
				for(var k=photos.length;i<30;i++){
					var thumb = "#thumb" + i;
					$(thumb).attr("src", "img/transparent.png");
					//somehow save photos[i].thumb
				}
				$("#pagenum").text(pageNumber);
				pageNumber++;
			});
		}	
		
    }


    $("#searchbox").on('keyup', getFirst30Pictures);

	$("#nextButton").on('click',getNext30Pictures);
    $("#prevButton").on('click',getLast30Pictures);

}());
    
