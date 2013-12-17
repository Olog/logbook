/*
 * Script specific to modify_log.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

// Log that is being modified
var log = null;

// And Log's database id
var logId = null;

$(document).ready(function(){
	// Activate resize manager
	resizeManager();

	// Initialize tooltip
	$('#tooltip').tooltip({placement: "bottom"});

	// Get log id parameter from url
	logId = $.url().param("id");

	// Check url parameters
	checkUrlParameters(logId);

	// Wait for dataselected
	$('#load_tags_m').on('dataselected', function(e, data){

		$("#tags_input").tagsManager('empty');

		$('#load_tags_m span[class*=multilist_clicked]').each(function(){
			$("#tags_input").tagsManager('pushTag', $(this).text());
		});
	});

	// Wait for dataselected
	$('#load_logbooks_m').on('dataselected', function(e, data){

		$("#logbooks_input").tagsManager('empty');

		$('#load_logbooks_m span[class*=multilist_clicked]').each(function(){
			$("#logbooks_input").tagsManager('pushTag', $(this).text());
		});
	});

	// Get Log object
	getLogNew(logId, function(data) {
		l(data);
		var log = [];
		log[0] = data;

		// Check if log object exists
		checkLogObject(log[0]);

			// Wait for dataload
		$('#load_tags_m').on('dataloaded', function(m) {
			autocompleteTags(savedTags);

			$("#tags_input").tagsManager('empty');

			if(log[0].tags !== undefined) {
				$.each(log[0].tags, function(i, element){
					$('#load_tags_m span:textEquals("' + element.name + '")').addClass('multilist_clicked');
					$('#load_tags_m span:textEquals("' + element.name + '")').parent().removeClass('display_none');
					$("#tags_input").tagsManager('pushTag',element.name);
				});
			}
		});

		// Load Tags
		loadTags("load_tags_m", true, false, false);

		// Wait for dataload
		$('#load_logbooks_m').on('dataloaded', function(m) {
			autocompleteLogbooks(savedLogbooks);

			$("#logbooks_input").tagsManager('empty');

			if(log[0].logbooks !== undefined) {
				$.each(log[0].logbooks, function(i, element){
					$('#load_logbooks_m span:textEquals("' + element.name + '")').addClass('multilist_clicked');
					$('#load_logbooks_m span:textEquals("' + element.name + '")').parent().removeClass('display_none');
					$("#logbooks_input").tagsManager('pushTag',element.name);
				});
			}
		});

		// Load Logbooks
		loadLogbooks("load_logbooks_m", true, false, false);

		// Load properties
		if(log[0].properties !== undefined && log[0].properties.length !== 0) {
			// Load properties
			$('.log_properties').find('div').remove();

			var template = getTemplate("template_modify_log_property");
			var html = "";
			var attrIndexes = [];
			var nameIndex = 0;

			$.each(log[0].properties, function(i, property){

				var newProperty = property;
				newProperty.attrs = [];

				var attrIndex = {"name":newProperty.name, "attrs":[]};

				$.each(newProperty.attributes, function(attributeKey, attributeValue){
					var attribute = {"key": attributeKey, "name":prepareInput(attributeKey) + nameIndex, "value":removeHtmlTags(checkIfLink(attributeValue))};
					attrIndex.attrs.push({"key": attributeKey, "name": prepareInput(attributeKey) + nameIndex});
					nameIndex ++;
					newProperty.attrs.push(attribute);
				});

				attrIndexes.push(attrIndex);

				html = Mustache.to_html(template, newProperty);
				$('.log_properties').append(html);
			});

			l(attrIndexes);
			$('#modifyForm input[name=properties]').val(JSON.stringify(attrIndexes));
			startListeningForPropertyClicks();

		} else {
			$('.log_properties').hide("fast");
		}

		// Fill in the modify form
		fillInForm(log[0]);

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
	});

	// Listen for new Log form submit
	$('#modifyForm').on('submit', function(e){
		e.preventDefault();

		var log = generateLogObject();
		l(log[0]);

		// Append id
		var logParts = logId.split("_");
		log[0].id = logParts[0];

		if(isValidLog(log) === true) {
			modifyLog(log);
			$('#files div').addClass('upload-progress');
			$('#files div p button').remove();
			$('#files div button').remove();
			$('.upload-progress-loader').show();
		}
	});

	// Redirect only if changes took place
	$(document).on('successfully_modified', function(e){

		setTimeout(function(){
			var logParts = logId.split("_");
			uploadFiles(logParts[0], uploadData, "#fileupload2");
			uploadPastedFiles(logParts[0], firefoxPastedData);
			window.location.href = firstPageName;
		}, 500);
	});

	initialize(logId);

	$('#new_log').addClass("disabled");
	$('#new_log').attr("disabled", true);
	$('#new_logbook_and_tag').addClass("disabled");
	$('#new_logbook_and_tag').attr("disabled", true);

	// Upload
	upload('fileupload2');

	// Start listening for Firefox paste events
	startListeningForPasteEvents("#files");
});

/**
 * Show delete attachment modal window for deleting image attachments
 * @param {type} element image element
 * @returns {undefined}
 */
function showDeleteAttachmentModal(element) {
	$('#modal_container').load(modalWindows + ' #deleteExistingAttachmentModal', function(response, status, xhr){
		$('#deleteExistingAttachmentModal').find('#url').val($(element).parent().find('img').attr('src'));
		$('#deleteExistingAttachmentModal').find('#element').val(element);
		$('#deleteExistingAttachmentModal').modal('toggle');
	});
}

/**
 * Show delete attachment modal window for deleting attachments that are not images.
 * @param {type} element element that holds the link to the file
 * @returns {undefined}
 */
function showDeleteAttachmentNotImageModal(element) {
	$('#modal_container').load(modalWindows + ' #deleteExistingAttachmentModal', function(response, status, xhr){
		$('#deleteExistingAttachmentModal').find('#url').val($(element).parent().find('a').attr('href'));
		$('#deleteExistingAttachmentModal').find('#element').val(element);
		$('#deleteExistingAttachmentModal').modal('toggle');
	});
}

/**
 * When user clicks on in Delete Attachment Modal window, this function is called.
 * Function reads parameters from hidden inputs and calls delete attachment function.
 * @returns {undefined}
 */
function deleteAttachmentHandler(){
	var url = $('#url').val();
	var newUrl = url.replace(':thumbnail', '');
	var uniqueId = url;

	deleteAttachment(newUrl, uniqueId);
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
 * @param {type} log object with log entry data
 */
function fillInForm(log) {
	$("#log_body").val(log.description);
	var notImages = new Array();

	if(log.attachments.length !== 0) {
		var template = getTemplate("template_existing_attachment_item");
		var html = "";

		$('#list_existing_attachments').html("");
		$.each(log.attachments, function(index, file){
			var img = serviceurl + 'attachments/' + log.id + '/' + file.fileName + ':thumbnail';
			var file_url = serviceurl + 'attachments/' + log.id + '/' + file.fileName;

			var item = {
				img: img,
				file_url: file_url,
				img_name: file.fileName
			};

			if(!isImage(file.contentType)){
				notImages = notImages.concat(item);
				return;
			}

			$.get(img, function(data, status, xhr){
				html = Mustache.to_html(template, item);
				$('#list_existing_attachments').append(html);

			}).fail(function(){
				l("404");
			});
		});

		// Append elements that are not images
		template = getTemplate("template_existing_attachment_not_image");

		$.each(notImages, function(i, file){
			html = Mustache.to_html(template, file);

			$('#list_existing_attachments').append(html);
		});
	}
}