/*
 * Script specific to edit_log.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */


$(document).ready(function(){

	// Create new comparator
	jQuery.expr[':'].Contains = function(a, i, m){
		return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
	};

	// Load Logbooks
	loadLogbooks();

	// Load Tags
	loadTags();

	// Wait for dataload
	$('#load_tags').on('dataloaded', function(e){
		autocompleteTags(savedTags);
	});

	// Wait for dataselected
	$('#load_tags').on('dataselected', function(e, data){

		$("#tags_input").tagsManager('empty');

		$.each(data['list2'], function(i, element){
			$("#tags_input").tagsManager('pushTag',element)
		});
	});

	// Wait for dataload
	$('#load_logbooks').on('dataloaded', function(e){
		autocompleteLogbooks(savedLogbooks);
	});

	// Wait for dataselected
	$('#load_logbooks').on('dataselected', function(e, data){

		$("#logbooks_input").tagsManager('empty');

		$.each(data['list'], function(i, element){
			$("#logbooks_input").tagsManager('pushTag',element)
		});
	});

	// Add upload field
	addAttachmentField();

	// Listen for add attachment link click
	$('#add_attachment').click(function(e){
		addAttachmentField();
	});

	// Listen for new Log form submit
	$('#createForm').on('submit', function(e){
		e.preventDefault();
		checkLog();
	});

	// Hide error block when user clicks on the X
	$('#error_x').click(function(e){
		$('#error_block').hide("fast");
	});

	// Check if user is logged in and act accordingly
	if(getUserCreadentials() === null) {
		window.location.href = firstPageName;

		var template = getTemplate('template_logged_out');
		var html = Mustache.to_html(template, {"user": "User"});
		$('#top_container').html(html);
		login();

		$('#new_log').addClass("disabled");
		$('#new_log').attr("disabled", true);
		$('#new_logbook_and_tag').addClass("disabled");
		$('#new_logbook_and_tag').attr("disabled", true);

	} else {
		var credentials = getUserCreadentials();

		var template = getTemplate('template_logged_in');
		var html = Mustache.to_html(template, {"user": firstLetterToUppercase(credentials["username"])});
		$('#top_container').html(html);

		$('#new_log').removeClass("disabled");
		$('#new_log').attr("disabled", false);
		$('#new_logbook_and_tag').removeClass("disabled");
		$('#new_logbook_and_tag').attr("disabled", false);
	}
});

/**
 * Add attachment field below the already existing one
 */
function addAttachmentField(){
	var template = getTemplate("template_new_add_attachment");

	var addAtachment = {};

	var html = Mustache.to_html(template, addAtachment);
	$('#list_add_attachments').append(html);

	$('.new_attachment').unbind("change");
	$('.new_attachment').on("change", function(e){
		alert($(e.target).val());
	});
}

/**
 * Initialize Tags autocompletion input. Get already selected data from cookie and fill the autocompletion list with all the Tags.
 * @param {type} tagsArray array of all the tags
 */
function autocompleteTags(tagsArray){
	var selectedTagsArray = [];

	if($.cookie(filtersCookieName) !== undefined){
		selectedTagsArray = $.parseJSON($.cookie(filtersCookieName))["list2"];
	}
	initiateAutocompleteInput("tags_input", selectedTagsArray, tagsArray);
}

/**
 * Initialize Logbooks autocompletion input. Get already selected data from cookie and fill the autocompletion list with all the Logbooks.
 * @param {type} logbooksArray array of all the tags
 */
function autocompleteLogbooks(logbooksArray){
	var selectedLogbooksArray = [];

	if($.cookie(filtersCookieName) !== undefined){
		selectedLogbooksArray = $.parseJSON($.cookie(filtersCookieName))["list"];
	}
	initiateAutocompleteInput("logbooks_input", selectedLogbooksArray, logbooksArray);
}

/**
 * Prepare autocompletion object and fill it with given data.
 * @param {type} targetId id of the input on which we want to enable aoutcompletion
 * @param {type} preselectedArray array of preselected items (usually from the cookie)
 * @param {type} dataArray array of all the object available for autocompletion
 */
function initiateAutocompleteInput(targetId, preselectedArray, dataArray) {
	$("#" + targetId).tagsManager({
		prefilled: preselectedArray,
		typeahead: true,
		typeaheadSource: dataArray,
		onlyTagList: true
	});
}

/**
 * Check if Log form is filled in correctly
 * @returns {undefined}
 */
function checkLog() {
	var logbooksString = $('input[name=hidden-logbooks]').val();
	var errorString = "";

	// Check description length
	if($('#new_log_body').val() === "") {
		errorString += "Log description cannot be empty!<br />";
	}

	// Check if there is at least one Logbook selected
	if(logbooksString.length === 0) {
		errorString += "At least one Logbook should be selected!<br />";
	}

	// Check if user is logged in
	if(getUserCreadentials() === null) {
		errorString += "User is not logged in!<br />";
	}

	if(errorString.length === 0) {
		createLog();

	} else {
		$('#error_body').html(errorString);
		$('#error_block').show("fast");
	}
}