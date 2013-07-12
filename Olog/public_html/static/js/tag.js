/**
 * File contains functions for creating, updating and deleting a Tag.
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

/**
 * Generate a Tag object, check if object is valid and create it.
 */
function createTagHandler() {
	var tag = generateTagObject();

	if(isValidTag(tag) === true) {
		createTag(tag);
	}
}

/**
 * Generate a Tag object, check if object is valid and modify it.
 */
function modifyTagHandler() {
	var tag = generateTagObject();
	var originalName = $('#new_tag_name_original').val();

	if(isValidTag(tag) === true) {
		modifyTag(tag, originalName);
	}
}

/**
 * Generate a Tag object, check if object is valid and delete it.
 */
function deleteTagHandler() {
	var originalName = $('#name_original').val();
	deleteTag(originalName);
}

/**
 * Generate a Tag object and set data from create/modify modal window
 */
function generateTagObject() {
	var tag = {"tag":[{
		"name":"",
		"state":"Active"
	}]};

	var name = $('#new_tag_name').val();

	// Set name
	tag.tag[0].name = name;

	return tag;
}

/**
 * Check if Tag object is valid and show error if it is not
 * @param {type} tag current Logbook object
 */
function isValidTag(tag){
	var errorBlock = $('#new_logbook_error_block');
	var errorX = $('#new_logbook_error_x');
	var errorBody = $('#new_logbook_error_body');

	errorX.click(function(e){
		errorBlock.hide("fast");
	});

	var errorString = "";

	// Check data
	if(tag.tag[0].name.length === 0) {
		errorString += "Tag name should not be empty!<br/>";
	}

	if(errorString.length === 0) {
		return true;

	} else {
		errorBody.html(errorString);
		errorBlock.show("fast");
		return false;
	}
}