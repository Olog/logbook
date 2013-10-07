/*
 * Script specific to edit_log.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){

	// Activate resize manager
	resizeManager();

	// Initialize tooltip
	$('#tooltip').tooltip({placement: "bottom"});

	// Wait for dataload
	$('#load_tags_m').on('dataloaded', function(e){
		autocompleteTags(savedTags);
	});

	// Load Tags
	loadTags("load_tags_m", true, false, true);

	// Wait for dataselected
	$('#load_tags_m').on('dataselected', function(e, data){

		$("#tags_input").tagsManager('empty');

		$.each(data['list2'], function(i, element){
			$("#tags_input").tagsManager('pushTag',element);
		});
	});

	// Wait for dataload
	$('#load_logbooks_m').on('dataloaded', function(e){
		autocompleteLogbooks(savedLogbooks);
	});

	// Load Logbooks
	loadLogbooks("load_logbooks_m", true, false, true);

	// Wait for dataselected
	$('#load_logbooks_m').on('dataselected', function(e, data){

		$("#logbooks_input").tagsManager('empty');

		$.each(data['list'], function(i, element){
			$("#logbooks_input").tagsManager('pushTag',element);
		});
	});

	// Listen for new Log form submit
	var submitting = false;

	$('#createForm').on('submit', function(e){
		e.preventDefault();

		if(submitting === true) {
			return;
		}

		submitting = true;

		var log = generateLogObject();
		l("submit log");

		if(isValidLog(log) === true) {

			// Create properties
			if(log[0].properties.length !== 0) {
				createProperty(log[0].properties);
			}

			var newLogId = createLog(log);
			l(newLogId);

			if(newLogId !== null) {
				$('#files div').addClass('upload-progress');
				$('#files div p button').remove();
				$('#files div button').remove();
				$('.upload-progress-loader').show();
				setTimeout(function(){
					uploadFiles(newLogId, uploadData, "#fileupload");
					uploadPastedFiles(newLogId, firefoxPastedData);
					window.location.href = firstPageName;
				}, 500);
			}

		} else {
			submitting = false;
		}
	});

	// Load levels
	var template = getTemplate('template_level_input');
	$('#level_input').html("");

	$.each(levels, function(index, name) {
		var html = Mustache.to_html(template, {"name": name, "selected":""});
		$('#level_input').append(html);
	});

	// Initialize common Log functionality
	initialize(null);

	// Upload
	upload('fileupload');

	// Start listening for Firefox paste events
	startListeningForPasteEvents("#files");

	// Add new propery table
	$('#add_a_property').click(function(e){
		var template = getTemplate("template_add_log_property");
		var html = Mustache.to_html(template);
		$('#add_a_property').before(html);

		// Start listening for Remove Property icon clicks
		startListeningForRemovePropertyClicks();

		// Add a key - value pair to property
		$('.add_a_key_value_pair').unbind('click');
		$('.add_a_key_value_pair').click(function(e){
			var dockingTr = $(e.target).parent().parent();
			var template = getTemplate("template_add_key_value_pair_to_property");
			var html = Mustache.to_html(template);
			dockingTr.before(html);
		});
	});

	// Focus the textarea when starting to add new log entry
	$('#log_body').focus();
});

/**
 * Remove property from new Log entry
 */
function startListeningForRemovePropertyClicks() {
	// Remove property table
	$('.remove_property').unbind('div');
	$('.remove_property').click(function(e){
		l($(e.target).parents('div'));
		$($(e.target).parents('div')[0]).remove();
	});
}