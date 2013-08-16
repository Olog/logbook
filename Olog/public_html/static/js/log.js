/*
 * Functions specfic to editing and modifying logs
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

// Dropped and chosen images are storred in this array to be uploaded
var uploadData = [];

// Firefox and chrome pasted file data is saved into this array.
var firefoxPastedData = [];

/**
 * Check user credentials and start listening for events that are important for
 * adding a new log and for modifying existing one.
 * @param {type} logId
 * @returns {undefined}
 */
function initialize(logId) {

	// Hide error block when user clicks on the X
	$('#error_x').click(function(e) {
		$('#error_block').hide("fast");
	});

	// Check if user is logged in and act accordingly
	if (getUserCreadentials() === null) {
		window.location.href = firstPageName + '?reason=not_logged_in';

		var template = getTemplate('template_logged_out');
		var html = Mustache.to_html(template, {"user": "User"});
		$('#top_container').html(html);
		login();
		disableCreatingNewAndModifying();

	// Load user name and show sing out link
	} else {
		var credentials = getUserCreadentials();

		var template = getTemplate('template_logged_in');
		var html = Mustache.to_html(template, {"user": firstLetterToUppercase(credentials["username"])});
		$('#top_container').html(html);
		enableCreatingAndModifying();
	}

	// Listen to cancel or close clicks
	$('#cancel_editing_button').click(function(e){
		showCancelEditingLogModal(logId);
	});

	$('#cancel_editing_x').click(function(e){
		showCancelEditingLogModal(logId);
	});

	$('#back_button').click(function(e){
		showCancelEditingLogModal(logId);
	});
}

/**
 * Add attachment field below already existing one
 */
function addAttachmentField() {
	var template = getTemplate("template_new_add_attachment");

	var addAtachment = {
		'url': serviceurl
	};

	var html = Mustache.to_html(template, addAtachment);
	$('#list_add_attachments').append(html);
}

/**
 * Initialize Tags autocompletion input. Get already selected data from cookie
 * and fill the autocompletion list with all the Tags.
 * @param {type} tagsArray array of all the tags
 */
function autocompleteTags(tagsArray) {
	var selectedTagsArray = [];

	if ($.cookie(filtersCookieName) !== undefined) {
		selectedTagsArray = $.parseJSON($.cookie(filtersCookieName))["list2"];
	}
	initiateAutocompleteInput("#tags_input", selectedTagsArray, tagsArray);
}

/**
 * Initialize Logbooks autocompletion input. Get already selected data from
 * cookie and fill the autocompletion list with all the Logbooks.
 * @param {type} logbooksArray array of all the tags
 */
function autocompleteLogbooks(logbooksArray) {
	var selectedLogbooksArray = [];

	if ($.cookie(filtersCookieName) !== undefined) {
		selectedLogbooksArray = $.parseJSON($.cookie(filtersCookieName))["list"];
	}
	initiateAutocompleteInput("#logbooks_input", selectedLogbooksArray, logbooksArray);
}

/**
 * Prepare autocompletion object and fill it with given data.
 * @param {type} targetId id of the input on which we want to enable aoutcompletion
 * @param {type} preselectedArray array of preselected items (usually from the cookie)
 * @param {type} dataArray array of all the object available for autocompletion
 */
function initiateAutocompleteInput(targetId, preselectedArray, dataArray) {
	$(targetId).tagsManager({
		prefilled: preselectedArray,
		typeahead: true,
		typeaheadSource: dataArray,
		onlyTagList: true
	});
	$(targetId).trigger("tagsManager_initialized");
}

/**
 * Check if Log form is filled in correctly
 * @param log created or modified log object
 * @returns {undefined}
 */
function isValidLog(log) {
	var errorString = "";

	// Check description length
	if (log[0]["description"] === "") {
		errorString += "Log description cannot be empty!<br />";
	}

	// Check if there is at least one Logbook selected
	if (log[0]["logbooks"].length === 0) {
		errorString += "At least one Logbook should be selected!<br />";
	}

	// Check if user is logged in
	if (getUserCreadentials() === null) {
		errorString += "User is not logged in!<br />";
	}

	// Check properties
	$.each(log[0]["properties"], function(index, property){

		if(property.name === "") {
			errorString += "Property should have a name!<br />";
			return;
		}

		// Check if Property attributes exist
		if(property.attributes === undefined || Object.keys(property.attributes).length === 0) {
			errorString += "Property " + property.name + " should have at least one key, value pair!<br />";

		} else {

			// Check all property attributes
			$.each(property.attributes, function(key, value){
				l(key + ' - ' + value);

				// Key should not be empty
				if(key === "") {
					errorString += "Property key should not be empty!<br />";
				}

				// Value should not be empty
				if(value === "") {
					errorString += "Property value should not be empty!<br />";
				}
			});
		}
	});

	// If there are no errors, return true
	if (errorString.length === 0) {
		$('#error_block').hide("fast");
		return true;

	// If there are errors, show error block and return false
	} else {
		$('#error_body').html(errorString);
		$('#error_block').show("fast");
		scrollToElement('#load_log_details', '#error_block');
		return false;
	}
}

/*
 * Get Cancel Editing or Creating a Log from remote site, copy it to index and
 * show it
 */
function showCancelEditingLogModal(logId){
	$('#modal_container').load(modalWindows + ' #cancelEditingLogModal', function(response, status, xhr){
		$('#cancelEditingLogModal').find('input[name=id]').val(logId);
		$('#cancelEditingLogModal').modal('toggle');
	});
}

/**
 * When user confirms canceling editing or creating a Log, redirect him to a
 * home page.
 * @returns {undefined}
 */
function deleteDraftAndReturnToHomePage() {
	var id = $('#cancelEditingLogModal').find('input[name=id]').val();
	var linkBack = firstPageName;

	if(id !== "") {
		linkBack += '#' + id;
	}

	window.location.href = linkBack;
}

/**
 * Initialize upload form with upload plugin
 * @param {type} elementId input field element id
 */
function upload(elementId) {
	// Upload url
	var url = serviceurl + "attachments/";

	// Remove button
	var removeButton = $('<button/>')
			.addClass('btn')
			.prop('disabled', true)
			.prop('className', 'btn btn-danger')
			.on('click', function () {
				var $this = $(this);
				var data = $this.data();
				l(data);
				uploadData[data.filePos] = null;

				$this.parent().parent().remove();
				data.abort();
			});

	var p = $('<p/>');

	$('#' + elementId).fileupload({
		url: url,
		dataType: 'json',
		autoUpload: false,
		//dropZone: null,
		pasteZone: null,
		//acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
		maxFileSize: 5000000, // 5 MB
		// Enable image resizing, except for Android and Opera,
		// which actually support image resizing, but fail to
		// send Blob objects via XHR requests:
		disableImageResize: /Android(?!.*Chrome)|Opera/
			.test(window.navigator && navigator.userAgent),
		previewMaxWidth: 100,
		previewMaxHeight: 100,
		previewCrop: true

	}).on('fileuploadadd', function (e, data) {
		data.context = $('<div/>').appendTo('#files');
		$.each(data.files, function (index, file) {
			var newP = p.clone(true);

			var node = newP.append($('<span/>').text(file.name));
			if (!index) {
				var count = uploadData.length;
				data.filePos = count;
				data.node = newP;
				uploadData.push(data);
				node
					.append('<br>')
					.append(removeButton.clone(true).data(data));
			}
			node.appendTo(data.context);
		});

	}).on('fileuploadprocessalways', function (e, data) {
		var index = data.index,
			file = data.files[index];
			var node = $(data.context.children()[index]);

		if (file.preview) {
			node
				.prepend('<br>')
				.prepend(file.preview);
		}
		if (file.error) {
			node
				.append('<br>')
				.append(file.error);
		}
		if (index + 1 === data.files.length) {
			data.context.find('button')
				.text('Remove')
				.prop('disabled', !!data.files.error);
		}
	});
}

/**
 * Creates a new image from a given source
 * @param source image source (blob in this case)
 * @param index index of the source in uploadData array
 * @param targetId id of element where attachments should be appended to
 */
function createImage(source, index, targetId) {
	var fileName = 'pasted image';

	// Show pasted image
	var template = getTemplate('template_attachment_item');
	var html = Mustache.to_html(template, {"img": source, "img_name":fileName, "array_id":index});
	$(targetId).append(html);
}

/**
 * Remove pasted attachments from DOM and from pastedData array.
 * @param {type} element attachment element
 * @param {type} id index of the position of attachment inside uploadedData array
 */
function removePastedAttachment(element, id) {
	firefoxPastedData[id] = null;
	$(element).parent().remove();
}