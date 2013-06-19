/*
 * Load tada on dom ready
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

var modalWindows = "static/html/modal_windows.html";
var templates = "static/html/templates.html";

// Create object for saving logs
var savedLogs = {};
var savedTags = new Array();
var savedLogbooks = new Array();
var page = 1;

/**
 * Get Logbooks from REST service
 */
function loadLogbooks(){
	// Load Logbooks
	$.getJSON(serviceurl + 'logbooks/', function(books) {
		repeat("template_logbook", "load_logbooks", books, "logbook");
		multiselect("list");
		filterListItems("logbooks_filter_search", "list");
	});
}

/**
 * Get Tags from REST service
 * @returns {undefined}
 */
function loadTags(){
	// Load tags
	$.getJSON(serviceurl + 'tags/', function(tags) {
		repeat("template_tag", "load_tags", tags, "tag");
		multiselect("list2");
		filterListItems("tags_filter_search", "list2");
	});
}

/**
 * Load Logs on the specific page from the rest service.
 * @param {type} page number of logs per page is defined in configuration, page number is increased when user scrolls down the list
 */
function loadLogs(page){
	// Remo all the logs if we are starting from the beginning
	if(page === 1){
		$(".log").remove();
	}

	var searchQuery = serviceurl + "logs?";

	if(searchURL === "") {
		searchQuery = serviceurl + 'logs?limit=' + numberOfLogsPerLoad + '&page=' + page;

	} else {

		var queryString = $.url(searchURL).param();

		// Parse current query and generate a new one
		for(querykey in queryString){
			console.log(querykey);

			if(querykey === "limit") {
				queryString[querykey] = numberOfLogsPerLoad;

			} else if(querykey === "page") {
				queryString[querykey] = page;
			}
			searchQuery += querykey + "=" + queryString[querykey] + "&"
		}
	}

	// Save query to global var
	searchURL = searchQuery;

	//var searchQuery = serviceurl + 'logs?limit=' + numberOfLogsPerLoad + '&page=' + page;
	console.log(searchQuery);

	$.getJSON(searchQuery, function(logs) {
		$(".log-last").remove();
		repeatLogs("template_log", "load_logs", logs);
		appendAddMoreLog("load_logs");
		startListeningForLogClicks();
	});
}

/**
 * Load more logs when user scrolls to the ed of current Log list.
 */
function loadLogsAutomatically(){
	// Automatically load new logs when at the end of the page
	$('#load_logs').scroll(function(e){
		var scrollDiv = $('#load_logs');

		//console.log(scrollDiv.prop('scrollHeight') + " - " + scrollDiv.scrollTop() + " - " + scrollDiv.height());

		if(scrollDiv.prop('scrollHeight') - scrollDiv.scrollTop() <= scrollDiv.height()){
			page = page  + 1;
			console.log('increate to ' + page)
			loadLogs(page);
		}
	});
}

/**
 * Get log from json object or from REST if it does not exist.
 * @param {type} id log id
 */
function getLog(id){

	// Load log
	if(id in savedLogs){
		showLog(savedLogs[id]);

	} else {
		$.getJSON(serviceurl + 'logs/' + id, function(log) {
			showLog(log);
		});
	}

}

/**
 * Show log that was read from json object or from REST
 * @param {type} log log object
 */
function showLog(log){
	$('.container-right').show("fast");

	$("#log_description").html(log.description);
	$("#log_owner").html(log.owner);
	$("#log_date").html(formatDate(log.createdDate));

	// Show date edited
	if(log.createdDate !== log.modifiedDate){
		var template = getTemplate("template_log_details_edited");

		var item = {
			editedDate: formatDate(log.modifiedDate)
		};

		var html = Mustache.to_html(template, item);

		$('#log_details_edited').html(html);

	} else {
		$('#log_details_edited').html("");
	}

	// Load log logbooks
	$("#load_log_logbooks").html("");
	repeat("template_log_logbook", "load_log_logbooks", log, "logbooks");

	// Load log tags
	$("#load_log_tags").html("");

	if(log.tags.length !== 0){
		repeat("template_log_tag", "load_log_tags", log, "tags");
	}

	// Load attachments
	$('#load_log_attachments').html("");

	if(log.attachments.length !== 0){
		$('.log_attachments').show("fast");
		repeatAttachments("template_log_attachment", "load_log_attachments", log.attachments, log.id);

	} else {
		$('.log_attachments').hide("fast");
	}
}

/**
 * Repeat function that can load a list of various data
 * @param {type} source_id id attribute of template tag
 * @param {type} target_id id attribute of container tag (where data will be placed)
 * @param {type} data data in JSON format
 * @param {type} property data.property object
 * @returns replaces template with data and puts it in the right place
 */
function repeat(source_id, target_id, data, property){
	var template = getTemplate(source_id);
	var html = "";

	$.each(data[property], function(i, item) {

		var customItem = item;
		customItem.clicked = "";

		if(property === "tag") {
			savedTags = savedTags.concat(item.name);

			// Check cookie content and select tags that need to be selected
			if($.cookie(filtersCookieName) !== undefined) {
				var obj = $.parseJSON($.cookie(filtersCookieName))["list2_index"];

				if(obj !== undefined && obj[item.name] !== undefined) {
					customItem.clicked = "multilist_clicked";
				}
			}

		} else if(property === "logbook") {
			savedLogbooks = savedLogbooks.concat(item.name);

			// Check cookie content and select tags that need to be selected
			if($.cookie(filtersCookieName) !== undefined) {
				var obj = $.parseJSON($.cookie(filtersCookieName))["list_index"];

				if(obj !== undefined && obj[item.name] !== undefined) {
					customItem.clicked = "multilist_clicked";
				}
			}
		}

		html = Mustache.to_html(template, customItem);

		$('#'+target_id).append(html);
	});

	$('#'+target_id).trigger('dataloaded', null);
}

/**
 * Show logs in the middle section. Some of the data must be formated to be shown properly
 * @param {type} source_id id attribute of template tag
 * @param {type} target_id id attribute of container tag (where data will be placed)
 * @param {type} data data in JSON format
 * @returns replaces template with data and puts it in the right place
 */
function repeatLogs(source_id, target_id, data){
	var template = getTemplate(source_id);
	var html = "";

	// Go through all the logs
	$.each(data, function(i, item) {
		savedLogs[item.id] = item;

		// Build customized Log object
		var newItem = {
			description: returnFirstXWords(item.description, 40),
			owner: item.owner,
			createdDate: formatDate(item.createdDate),
			id: item.id,
			attachments : []
		};

		// Append attachments
		if(item.attachments.length !== 0){

			$.each(item.attachments, function(j, attachment) {

				// Skip non-image attachments
				if(!isImage(attachment.contentType)){
					return;
				}

				// Create custom attribute thumbnail object
				newItem.attachments.push(
					{imageUrl: serviceurl + "attachments/" + item.id + "/" + attachment.fileName + ":thumbnail"}
				);
			});
		}

		html = Mustache.to_html(template, newItem);
		$('#'+target_id).append(html);

	});
}

/*
 * Append the last log that enables us to load more logs
 * @param {type} target_id div id where last log will be appended
 * @returns {undefined}
 */
function appendAddMoreLog(target_id){
	// Create load more Log
	var template = getTemplate("template_log_add_more");

	var loadMoreLog = {
		page: page + 1
	};

	var html = Mustache.to_html(template, loadMoreLog);
	$('#'+target_id).append(html);
}

/**
 * Get all attachments from specific log, put them in template and append them to the end of the log
 * @param {type} source_id div id where template is positioned
 * @param {type} target_id div id where attachments will be placed
 * @param {type} data JSON object that holds attachments
 * @param {type} logId id of the log we want attach attachments to
 */
function repeatAttachments(source_id, target_id, data, logId){

	var template = getTemplate(source_id);
	var html = "";
	var notImages = new Array();

	$.each(data, function(i, item) {

		// Create customized Attachment object
		var newItem = {
			imageUrl: serviceurl + "attachments/" + logId + "/" + item.fileName,
			fileName: item.fileName,
			imageWidth: 200,
			imageHeight: 200
		};

		// Add items that are not images to array
		if(!isImage(item.contentType)){
			notImages = notImages.concat(newItem);
			return;
		}

		html = Mustache.to_html(template, newItem);

		$('#'+target_id).append(html);
	});

	// Append elements that are not images
	template = getTemplate("template_log_attachment_not_image");

	$.each(notImages, function(i, file){
		html = Mustache.to_html(template, file);

		$('#'+target_id).append(html);
	});
}

/**
 * Return raw template
 * @param {type} id div id that holds the template
 * @returns template as a string
 */
function getTemplate(id){
	$.ajaxSetup({async:false});
	var template = "";

	$('#template_container').load(templates + ' #' + id, function(response, status, xhr){
		template = $('#' + id).html();
	});

	return template;
}

/*
 * Get Add modal windows from remote site, copy it to index and then show it
 * @param {type} modalId id of the modal windows
 * @param {type} name name of the element to be deleted
 */
function showAddModal(modalId){
	$('#modal_container').load(modalWindows + ' #' + modalId, function(response, status, xhr){
		$('#' + modalId).modal('toggle');
	});
}

/*
 * Get Edit Logbook modal windows from remote site, copy it to index and then show it
 * @param {type} modalId id of the modal windows
 * @param {type} name name of the Logbook
 */
function showEditLogbookModal(modalId, name){
	$('#modal_container').load(modalWindows + ' #' + modalId, function(response, status, xhr){
		$('#' + modalId + ' [name=name]').val(name);
		$('#' + modalId + ' [name=owner]').val("boss");
		$('#' + modalId).modal('toggle');
	});
}

/*
 * Get Edit Tag modal windows from remote site, copy it to index and then show it
 * @param {type} modalId id of the modal windows
 * @param {type} name name of the Tag
 */
function showEditTagModal(modalId, name){
	$('#modal_container').load(modalWindows + ' #' + modalId, function(response, status, xhr){
		$('#' + modalId + ' [name=name]').val(name);
		$('#' + modalId).modal('toggle');
	});
}

/*
 * Get Delete modal windows from remote site, copy it to index and then show it
 * @param {type} modalId id of the modal windows
 * @param {type} name name of the element to be deleted
 */
function showDeleteModal(modalId, name){
	$('#modal_container').load(modalWindows + ' #' + modalId, function(response, status, xhr){
		$('#' + modalId + ' [name=id]').val(name);
		$('#' + modalId).modal('toggle');
	});
}