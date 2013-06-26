/*
 * Script specific to modify_log.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){

	// Load Logbooks
	loadLogbooks();

	// Load Tags
	loadTags();

	var logId = $.url().param("id");
	logId = parseInt(logId);

	// Check url parameters
	checkUrlParameters(logId);

	// Get Log object
	var log = getLog(logId);

	// Check if log object exists
	checkLogObject(log[0]);

	// Fill in the modify form
	fillInForm(log[0]);

	// Wait for dataload
	$('#load_tags').on('dataloaded', function(m){
		autocompleteTags(savedTags);
	});

	// Load tags
	$('#tags_input').on('tagsManager_initialized', function(){
		if(log[0].tags !== undefined) {
			$.each(log[0].tags, function(i, element){
				$("#tags_input").tagsManager('pushTag',element.name);
			});
		}
	});

	// Wait for dataload
	$('#load_logbooks').on('dataloaded', function(m){
		autocompleteLogbooks(savedLogbooks);
	});

	// Load logbooks
	$('#logbooks_input').on('tagsManager_initialized', function(){
		if(log[0].logbooks !== undefined) {
			$.each(log[0].logbooks, function(i, element){
				$("#logbooks_input").tagsManager('pushTag',element.name);
			});
		}
	});

	// Listen for new Log form submit
	$('#modifyForm').on('submit', function(e){
		e.preventDefault();

		var log = generateLogObject();

		// Append id
		log[0].id = logId;

		if(isValidLog(log) === true) {
			modifyLog(log);
		}
	});

	// Load levels
	var template = getTemplate('template_level_input');
	$('#level_input').html("");

	$.each(levels, function(index, name) {

		var selected = "";

		if(name === log[0].level) {
			selected = "selected=selected";
		}

		var html = Mustache.to_html(template, {"name": name, "selected":selected});
		$('#level_input').append(html);
	});

	initialize();

	$('#new_log').addClass("disabled");
	$('#new_log').attr("disabled", true);
	$('#new_logbook_and_tag').addClass("disabled");
	$('#new_logbook_and_tag').attr("disabled", true);
});

/**
 * Check URL parameters and redirect user to a home page if parameters are not set
 * @param {type} logId id of the log got from the URL
 */
function checkUrlParameters(logId) {

	if(logId === undefined) {
		window.location.href = firstPageName;
	}
}

/**
 * Check Log object and redirect user to a home page if something is wrong with it
 * @param {type} log log object
 */
function checkLogObject(log) {

	if(log === null) {
		window.location.href = firstPageName;
	}
}

/**
 * Fill in the form with log data
 * @param {type} log
 * @returns {undefined}
 */
function fillInForm(log) {
	l(log);
	$("#log_body").val(log.description);
}