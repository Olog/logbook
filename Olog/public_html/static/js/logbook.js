/**
 * File contains functions for creating, updating and deleting a Logbook.
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

/**
 * Generate Logbook object, check if object is valid and create it.
 */
function createLogbookHandler() {
	var logbook = generateLogbookObject();

	if(isValidLogbook(logbook) === true) {
		createLogbook(logbook);
	}
}

/**
 * Generate Logbook object, check if object is valid and modify it.
 */
function modifyLogbookHandler() {
	var logbook = generateLogbookObject();
	var originalName = $('#new_logbook_name_original').val();

	if(isValidLogbook(logbook) === true) {
		modifyLogbook(logbook, originalName);
	}
}

/**
 * Generate Logbook object, check if object is valid and delete it.
 */
function deleteLogbookHandler() {
	var originalName = $('#name_original').val();
	deleteLogbook(originalName);
}

/**
 * Generate Logbook object and set data from create/modify modal window
 */
function generateLogbookObject() {
	var logbook = {"logbook":[{
		"name":"",
		"owner":"",
		"state":"Active"
	}]};

	var name = $('#new_logbook_name').val();
	var owner = $('#new_logbook_owner').val();

	// Set name
	logbook.logbook[0].name = name;

	// Set owner
	logbook.logbook[0].owner = owner;

	return logbook;
}

/**
 * Check if Logbook object is valid and show error if it is not
 * @param {type} logbook current Logbook object
 */
function isValidLogbook(logbook){
	var errorBlock = $('#new_logbook_error_block');
	var errorX = $('#new_logbook_error_x');
	var errorBody = $('#new_logbook_error_body');

	errorX.click(function(e){
		errorBlock.hide("fast");
	});

	var errorString = "";

	// Check data
	if(logbook.logbook[0].name.length === 0) {
		errorString += "Logbook name should not be empty!<br/>";
	}

	if(logbook.logbook[0].owner.length === 0) {
		errorString += "Logbook owner should not be empty!<br/>";
	}

	if(errorString.length === 0) {
		return true;

	} else {
		errorBody.html(errorString);
		errorBlock.show("fast");
		return false;
	}
}