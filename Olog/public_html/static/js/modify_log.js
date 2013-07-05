/*
 * Script specific to modify_log.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

// Log that is being modified
var log = null;
var logId = null;

$(document).ready(function(){

	// Load Logbooks
	loadLogbooks("load_logbooks_m");

	// Load Tags
	loadTags("load_tags_m");

	// Wait for dataload
	$('#load_tags_m').on('dataloaded', function(m) {
		autocompleteTags(savedTags);
	});

	// Wait for dataload
	$('#load_logbooks_m').on('dataloaded', function(m) {
		autocompleteLogbooks(savedLogbooks);
	});

	logId = $.url().param("id");
	logId = parseInt(logId);

	// Check url parameters
	checkUrlParameters(logId);

	// Get Log object
	log = getLog(logId);

	// Check if log object exists
	checkLogObject(log[0]);

	// Fill in the modify form
	fillInForm(log[0]);

	// Load tags
	$('#tags_input').on('tagsManager_initialized', function() {
		$("#tags_input").tagsManager('empty');

		if(log[0].tags !== undefined) {
			$.each(log[0].tags, function(i, element){
				$("#tags_input").tagsManager('pushTag',element.name);
			});
		}
	});

	// Load logbooks
	$('#logbooks_input').on('tagsManager_initialized', function(){
		$("#logbooks_input").tagsManager('empty');

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
			$('#files div').addClass('upload-progress');
			$('#files div p button').remove();
			$('#files div button').remove();
			$('.upload-progress-loader').show();
			setTimeout(function(){
				uploadFiles(logId, uploadData, "#fileupload2");
				uploadPastedFiles(logId, firefoxPastedData);
				window.location.href = firstPageName;
			}, 500);
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

	// Upload
	upload('fileupload2');

	// Start listening for Firefox paste events
	startListeningForPasteEvents("#files");
});

function showDeleteAttachmentModal(element) {
	$('#modal_container').load(modalWindows + ' #deleteExistingAttachmentModal', function(response, status, xhr){
		$('#deleteExistingAttachmentModal').find('#url').val($(element).parent().find('img').attr('src'));
		$('#deleteExistingAttachmentModal').modal('toggle');
	});
}

function deleteAttachmentHandler(){
	var url = $('#url').val();
	var newUrl = url.replace(':thumbnail', '');
	l(newUrl);

	deleteAttachment(newUrl, log[0]);
}

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

	if(log.attachments.length !== 0) {
		var template = getTemplate("template_existing_attachment_item");
		var html = "";

		$('#list_existing_attachments').html("");
		$.each(log.attachments, function(index, file){
			var img = serviceurl + 'attachments/' + log.id + '/' + file.fileName + ':thumbnail';

			$.get(img, function(data, status, xhr){

				var item = {
					img: img,
					img_name: file.fileName
				};

				html = Mustache.to_html(template, item);
				$('#list_existing_attachments').append(html);

			}).fail(function(){
				l("404");
			});
		});
	}
}