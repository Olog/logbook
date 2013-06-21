
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

function showError(string) {
	var errorBlock = $('#new_logbook_error_block');
	var errorX = $('#new_logbook_error_x');
	var errorBody = $('#new_logbook_error_body');

	errorBody.html(string);
	errorBlock.show("fast");
}