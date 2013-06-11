/* 
 * Script specific to index.html
 * 
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){
	/**
	 * Disable closing the login dropdown if user clicks on login form elements
	 */
	// Setup drop down menu
	$('.dropdown-toggle').dropdown();
	// Fix input element click problem
	$('.dropdown-menu form').click(function(e) {
		e.stopPropagation();
	});
	
	$('#new_log').click(function(e){
		window.location.href = "new_log.html";
	});
});

function showEditLogbookModal(modalId, name){
	
	$('#modal_container').load('static/html/modal_windows.html #' + modalId, function(response, status, xhr){

		$('#' + modalId + ' [name=name]').val(name);
		$('#' + modalId + ' [name=owner]').val("boss");

		$('#' + modalId).modal('toggle');
		
	});
}

function showEditTagModal(modalId, name){
	$('#' + modalId + ' [name=name]').val(name);
	$('#' + modalId).modal('toggle');
}

function showDeleteModal(modalId, name){
	$('#' + modalId + ' [name=id]').val(name);
	$('#' + modalId).modal('toggle');
}

function returnFirstXWords(string, count){
	var words = string.split(" ");
	var summary = "";
	var append = "";
	
	if (count > words.length) {
		count = words.length;
	
	} else {
		append = " ...";
	}
	
	if(words.length > 0){
		summary = words[0];
		
		if(words.length > 1){
			for(i=1; i<count; i++) {
				summary += " " + words[i];
			}
		}
		return summary + append;
		
	}else {
		return summary;
	}
	
}

/**
 * When logs are loaded onto the page, start listening for mouse clicks on them
 * @returns {undefined}
 */
function startListeningForLogClicks(){
	var actionElement = null;
	
	$('.log_show_details').unbind('click');
	$('.log_show_details').click(function(e){
		$('.log_details').toggle(400, 'swing');
	});
	
	$('.log').unbind('click');
	$(".log").click(function(e){
		$('.log').removeClass("log_click");
		
		if($(e.target).is("div")){
			actionElement = $(e.target);
			//getLog($(e.target).find("input[name=id]").val());
		
		}else if($(e.target).parent().is("div")){
			actionElement = $(e.target).parent();
			//getLog($(e.target).parent().find("input[name=id]").val());
		}
		
		actionElement.toggleClass("log_click");
		getLog(actionElement.find("input[name=id]").val());
	});
}

/**
 * Format the date according to format specified in configuration.js file
 * @param {type} input datetime string
 * @returns {unresolved} formated datetime string
 */
function formatDate(input){
	var day = moment(input);
	var formatedDate = day.format(dateFormat);
	return formatedDate;
}

/**
 * Is file we want to upload image or not
 * @param {type} type MIME type string
 * @returns {Boolean} is mimetype an image or not
 */
function isImage(type) {
	typeParts = type.split("/");
	
	if(typeParts.length === 2 && typeParts[0] === "image"){
		return true;
	}else{
		return false;
	}
}