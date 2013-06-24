
function createLogbookHandler() {
	var errorBlock = $('#new_logbook_error_block');
	var errorX = $('#new_logbook_error_x');
	var errorBody = $('#new_logbook_error_body');

	errorX.click(function(e){
		errorBlock.hide("fast");
	});

	var name = $('#new_logbook_name').val();
	var owner = $('#new_logbook_owner').val();

	var errorString = "";

	// Check data
	if(name.length === 0) {
		errorString += "Logbook name should not be empty!<br/>";
	}

	if(owner.length === 0) {
		errorString += "Logbook owner should not be empty!<br/>";
	}

	if(errorString.length === 0) {
		createLogbook(name, owner);

	} else {
		errorBody.html(errorString);
		errorBlock.show("fast");
	}
}

/**
 * Show error in specific error block
 * @param {type} string string that describes an error
 * @param {type} blockId id of the error block
 * @param {type} blockBody id of the error block body
 * @returns {undefined}
 */
function showError(string, blockId, blockBody) {
	var errorBlock = $(blockId);
	var errorBody = $(blockBody);

	errorBody.html(string);
	errorBlock.show("fast");
}