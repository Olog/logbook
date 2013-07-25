/*
 * Script specific to edit_log.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){

	// Activate resize manager
	resizeManager();

	// Load Logbooks
	loadLogbooks("load_logbooks");

	// Load Tags
	loadTags("load_tags");

	// Wait for dataload
	$('#load_tags').on('dataloaded', function(e){
		autocompleteTags(savedTags);
	});

	// Wait for dataselected
	$('#load_tags').on('dataselected', function(e, data){

		$("#tags_input").tagsManager('empty');

		$.each(data['list2'], function(i, element){
			$("#tags_input").tagsManager('pushTag',element);
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
			$("#logbooks_input").tagsManager('pushTag',element);
		});
	});

	// Listen for new Log form submit
	$('#createForm').on('submit', function(e){
		e.preventDefault();

		var log = generateLogObject();
		l(log);

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
});

function startListeningForRemovePropertyClicks() {
	// Remove property table
	$('.remove_property').unbind('div');
	$('.remove_property').click(function(e){
		l($(e.target).parents('div'));
		$(e.target).parents('div')[0].remove();
	});
}