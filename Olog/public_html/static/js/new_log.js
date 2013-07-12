/*
 * Script specific to edit_log.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){

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

		if(isValidLog(log) === true) {
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
});