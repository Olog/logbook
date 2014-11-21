/*
 * All REST calls and other helper functions can be found in this file
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

// Create object for saving logs
var savedLogs = {};

// Array of all the Tags
var savedTags = new Array();

// Array of all the Logbooks
var savedLogbooks = new Array();

// Current page number (REST responses can be loaded page by page)
var page = 1;

/**
 * Get Logbooks from REST service
 * @param targetId id of the element Logbooks will be placed in
 * @param {type} showByDefault should logbooks be shown by default or not
 * @param {type} saveSelectedItemsIntoACookie only save current selected data into a cookie if this flag is set to true
 * @param {type} showSelectedItemsFromACookie should selected items from a cookie be displayed or not
 */
function loadLogbooks(targetId, showByDefault, saveSelectedItemsIntoACookie, showSelectedItemsFromACookie){
	$('#' + targetId).find("li:gt(1)").remove();

	// Load Logbooks
	$.getJSON(serviceurl + 'logbooks/', function(books) {
		repeat("template_logbook", targetId, books, "logbook", showByDefault, showSelectedItemsFromACookie);
		multiselect("list", saveSelectedItemsIntoACookie);
		filterListItems("logbooks_filter_search", "list");
		startListeningForToggleFilterClicks();

		$('#'+targetId).trigger('dataloaded', selectedElements);

	}).fail(function(){
		$('#modal_container').load(modalWindows + ' #serverErrorModal', function(response, status, xhr){
			$('#serverErrorModal').modal('toggle');
		});
	});
}

/**
 * Get Tags from REST service
 * @param targetId id of the element Tags will be placed in
 * @param {type} showByDefault should tags be shown by default or not
 * @param {type} saveSelectedItemsIntoACookie only save current selected data into a cookie if this flag is set to true
 * @param {type} showSelectedItemsFromACookie should selected items from a cookie be displayed or not
 */
function loadTags(targetId, showByDefault, saveSelectedItemsIntoACookie, showSelectedItemsFromACookie){
	$('#' + targetId).find("li:gt(1)").remove();

	// Load tags
	$.getJSON(serviceurl + 'tags/', function(tags) {
		repeat("template_tag", targetId, tags, "tag", showByDefault, showSelectedItemsFromACookie);
		multiselect("list2", saveSelectedItemsIntoACookie);
		filterListItems("tags_filter_search", "list2");
		startListeningForToggleFilterClicks();

		$('#'+targetId).trigger('dataloaded', selectedElements);
	});
}

/**
 * Load particular page of Logs and display them.
 * @param {type} page number of logs per page is defined in configuration, page
 * @param {type} ignorePreviousSearchString ignore attributes in previous search query
 * number is increased when user scrolls down the list
 */
function loadLogs(page, ignorePreviousSearchString){
	// Remo all the logs if we are starting from the beginning
	if(page === 1){
		$(".log").remove();
	}

	var searchQuery = serviceurl + "logs?";

	// Generate a search query
	if(searchURL === "" || ignorePreviousSearchString === true) {
		searchQuery = serviceurl + 'logs?limit=' + numberOfLogsPerLoad + '&page=' + page + '&';

	} else {
		var queryString = $.url(searchURL).param();

		// Parse current query and generate a new one
		for(querykey in queryString){

			if(querykey === "limit") {
				queryString[querykey] = numberOfLogsPerLoad;

			} else if(querykey === "page") {
				queryString[querykey] = page;
			}
			searchQuery += querykey + "=" + queryString[querykey] + "&";
		}
	}

	// Append history paramater if it is not yet appended
	if(ologSettings.includeHistory && !("history" in $.url(searchQuery).param())) {
		searchQuery += historyParameter + "=&";
	}

	// Save query to global var
	searchURL = searchQuery;
	l(searchURL);

	$.getJSON(searchQuery, function(logs) {
		$(".log-last").remove();
		repeatLogs(logs, false);
		appendAddMoreLog("load_logs");
		startListeningForLogClicks();
		scrollToLastLog();

		$('.log img').last().load(function(){
			scrollToLastLog();
		});

		// Trigger event when all the logs are loaded
		$('#load_logs').trigger('logsloaded');
	});
}

/**
 * Load more logs when user scrolls to the ed of current Log list.
 */
function loadLogsAutomatically(){

	var scrollLock = false;

	$('#load_logs').on('logsloaded', function() {
		scrollLock = false;
	});

	// Automatically load new logs when at the end of the page
	$('#load_logs').scroll(function(e){
		var scrollDiv = $('#load_logs');

		if((scrollDiv.scrollTop() + scrollDiv.innerHeight() >= scrollDiv.prop('scrollHeight') - 2) && limit === true){
			l('scroll locked? ' + scrollLock);

			if(!scrollLock) {
				scrollLock = true;
				page = page  + 1;
				loadLogs(page, false);
			}
		}
	});
}

/**
 * Get log from json object or from REST if it does not exist.
 * @param {type} id log id
 * @return Array with log data and logId
 */
function getLog(id){
	var logData = null;
	var logId = id;

	// Load log
	if(id in savedLogs){
		logData = savedLogs[id];

	} else {
		$.ajaxSetup({async:false});
		var idParts = id.split("_");
		var url = serviceurl + 'logs?id=' + idParts[0];

		// Append include history parameter because we can get old version from
 		// URL but have history disabled
		if(!("history" in $.url(url).param())) {
			url += '&' + historyParameter + '=&';
		}

		// Get log/logs data
		$.getJSON(url, function(logs) {
			$.each(logs, function(i, log) {
 				savedLogs[log.id + '_' + log.version] = log
 			});
			logData = savedLogs[id];
		});
	}

	return [logData, logId];
}

/**
 * Get log from json object or from REST if it does not exist.
 * @param {type} id log id
 * @param {type} myFunction function that is called after data is loaded
 * @return Array with log data and logId
 */
function getLogNew(id, myFunction){
	var logData = null;

	// Load log
	if(id in savedLogs){
		logData = savedLogs[id];
		myFunction(logData);

	} else {
		var idParts = id.split("_");
		var url = serviceurl + 'logs?id=' + idParts[0];

		// Append include history parameter because we can get old version from
 		// URL but have history disabled
		if(!("history" in $.url(url).param())) {
			url += '&' + historyParameter + '=&';
		}

		l(url);

		// Get log/logs data
		$.getJSON(url, function(logs) {
			$.each(logs, function(i, log) {
 				savedLogs[log.id + '_' + log.version] = log;
 			});
			myFunction(savedLogs[id]);
		});
	}
}

/**
 * Show log that was read from json object or from REST
 * @param {type} log log object
 * @param id id of the log in saved logs array
 */
function showLog(log, id){
	$('#load_log').show("fast");

	var desc = log.description;

	$("#log_description").html(multiLineHtmlEncode(desc));
	//$("#log_description").attr("rows", lines.length);

	$("#log_owner").html(log.owner);
	$("#log_date").html(formatDate(log.modifiedDate));
	$("#log_level").html(log.level);

	$("#modify_log_link").attr("href", "modify_log.html?id=" + id);
	$("#print_log_link").attr("href", "print_log.html?id=" + id);

	var item = undefined;
	var html = "";
	var template = undefined;

	// Show date modified
	if(log.createdDate !== log.modifiedDate){
		template = getTemplate("template_log_details_edited");

		item = {
			editedDate: formatDate(log.modifiedDate)
		};

		html = Mustache.to_html(template, item);

		$('#log_details_edited').html(html);

	} else {
		$('#log_details_edited').html("");
	}

	// Show date created
	template = getTemplate("template_log_details_created");

	item = {
		createdDate: formatDate(log.createdDate)
	};

	html = Mustache.to_html(template, item);
	$('#log_details_created').html(html);

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
		showAttachmentSizeDropdown(log.attachments, log.id);
		repeatAttachments("template_log_attachment", "load_log_attachments", log.attachments, log.id);

	} else {
		$('.log_attachments').hide("fast");
	}

	// Load properties
	$('.log_properties').find('div').remove();

	if(log.properties.length !== 0) {
		$('.log_properties').show("fast");
		repeatProperties(log.properties);
		startListeningForPropertyClicks();

	} else {
		$('.log_properties').hide("fast");
	}
}

/**
 * When Log details and with them properties are loaded, start listening for
 * clicks on property headers.
 * @returns {undefined}
 */
function startListeningForPropertyClicks() {

	$('.property_header').unbind('click');
	$('.property_header').click(function(e){
		l(e.target);

		var tbody = undefined;
		var arrow = undefined;

		if($(e.target).is('th')) {
			tbody = $(e.target).parent().parent().parent().find('tbody');
			arrow = $(e.target).find('i');

		} else {
			tbody = $(e.target).parent().parent().parent().parent().find('tbody');
			arrow = $(e.target);
		}

		tbody.toggle();

		if(tbody.is(':visible')) {
			arrow.removeClass('icon-chevron-right');
			arrow.addClass('icon-chevron-down');

		} else {
			arrow.removeClass('icon-chevron-down');
			arrow.addClass('icon-chevron-right');
		}
	});
}

/*
 * Show attachment size dropdown and set list items
 */
function showAttachmentSizeDropdown(attachments, id) {
	$('#attachments_size_dropdown').show("fast");

	var template = getTemplate("template_attachments_size_dropdown");
	var html = "";

	// Set current selected size
	if(imageSizes.current === -1) {
		imageSizes.current = imageSizes.defaultSize;
	}

	$('#attachments_size_dropdown ul').html("");

	$.each(imageSizes.list, function(index, item){

		var listItem = {
			name: item.name,
			active: ""
		};

		// Select current item
		if(index === imageSizes.current) {
			listItem.active = "class=active";
		}

		html = Mustache.to_html(template, listItem);
		$('#attachments_size_dropdown ul').append(html);
	});

	$('#attachments_size_dropdown ul li').unbind('click');
	$('#attachments_size_dropdown ul li').click(function(e){
		l($(e.target).text());
		imageSizes.current = backwardImageSizesMap[$(e.target).text()];
		repeatAttachments("template_log_attachment", "load_log_attachments", attachments, id);
		showAttachmentSizeDropdown(attachments, id);
	});
}

/**
 * Repeat function that can load a list of various data
 * @param {type} source_id id attribute of template tag
 * @param {type} target_id id attribute of container tag (where data will be placed)
 * @param {type} data data in JSON format
 * @param {type} property data.property object
 * @param {type} showByDefault should tags be shown by default or not
 * @param {type} showSelectedItemsFromACookie should selected items from a cookie be displayed or not
 * @returns replaces template with data and puts it in the right place
 */
function repeat(source_id, target_id, data, property, showByDefault, showSelectedItemsFromACookie){
	var template = getTemplate(source_id);
	var html = "";

	$.each(data[property], function(i, item) {

		var customItem = item;
		customItem.clicked = "";

		// Should Tags be shown by default or not
		if(showByDefault !== undefined && showByDefault === true) {
			customItem.show = "";

		} else {
			customItem.show = "display_none";
		}

		// Alternate background colors
		if(i%2 === 0) {
			customItem.color = "log_dark";

		} else {
			customItem.color = "log_light";
		}

		if(property === "tag") {
			savedTags = savedTags.concat(item.name);

			// Check cookie content and select tags that need to be selected
			if($.cookie(filtersCookieName) !== undefined) {
				var obj = $.parseJSON($.cookie(filtersCookieName))["list2_index"];

				if(
					obj !== undefined && obj[item.name] !== undefined && obj[item.name] !== "false"
					&& (showSelectedItemsFromACookie === undefined || (showSelectedItemsFromACookie !== undefined && showSelectedItemsFromACookie === true))
				) {
					customItem.clicked = "multilist_clicked";
					customItem.show = "";
				}
			}

		} else if(property === "logbook") {
			savedLogbooks = savedLogbooks.concat(item.name);

			// Check cookie content and select tags that need to be selected
			if($.cookie(filtersCookieName) !== undefined) {
				var obj = $.parseJSON($.cookie(filtersCookieName))["list_index"];

				if(
					obj !== undefined && obj[item.name] !== undefined && obj[item.name] !== "false"
					&& (showSelectedItemsFromACookie === undefined || (showSelectedItemsFromACookie !== undefined && showSelectedItemsFromACookie === true))
				) {
					customItem.clicked = "multilist_clicked";
					customItem.owner = item.owner;
					customItem.show = "";
				}
			}
		}

		html = Mustache.to_html(template, customItem);
		$('#'+target_id).append(html);
	});

	// Open or close filter group
	if(ologSettings.filtersOpened !== undefined && ologSettings.filtersOpened[target_id] === true) {
		openFilterGroup($('#'+target_id));

	} else {
		closeFilterGroup($('#'+target_id));
	}
}

/*
 * Prepare parent (active) and children (inactive) log version to be displayed
 * @param {type} i current index of parent log element
 * @param {type} children array of children together with parent
 * @param {type} prepend should new logs be appended or prepended
 * @param {type} logOwners dictionary which holds logs' owners
 */
function prepareParentAndChildren(i, children, prepend, logOwners) {
	var logTemplate = getTemplate("template_log");
	var historyTemplate = getTemplate("template_log_history");
	var html = "";

	var item = children[0];

	// Original owner
	var originalOwner = logOwners[item.id + '_1'];

	if(originalOwner === undefined) {
		originalOwner = item.owner;
	}

	// Build customized Log object
	var newItem = {
		description: returnFirstXWords(item.description, 40),
		owner: originalOwner,
		modifiedOwner: item.owner,
		createdDate: formatDate(item.createdDate),
		modifiedDate: formatDate(item.modifiedDate),
		modified: false,
		id: item.id + '_' + item.version,
		rawId: item.id,
		attachments : [],
		non_image_attachments: false
	};

	// Was log entry modified?
	if(item.createdDate !== item.modifiedDate) {
		newItem.modified = true;
	}

	// Append history show/hide link
	if(children.length > 1) {
		newItem.history = true;

	} else {
		newItem.history = false;
	}

	// Alternate background colors
	if(i%2 === 0) {
		newItem.color = "log_dark";

	} else {
		newItem.color = "log_light";
	}

	// Check if we have an URL and select selected Log
	if(selectedLog !== -1 && parseInt(item.id) === selectedLog) {
		newItem.click = "log_click";

	} else {
		newItem.click = "";
	}

	// Append image attachments
	if(item.attachments.length !== 0){

		$.each(item.attachments, function(j, attachment) {

			// Skip non-image attachments
			if(!isImage(attachment.contentType)){
				newItem.non_image_attachments = true;
				return;
			}

			// Create custom attribute thumbnail object
			newItem.attachments.push(
				{imageUrl: serviceurl + "attachments/" + item.id + "/" + attachment.fileName + ":thumbnail"}
			);
		});
	}

	html = Mustache.to_html(logTemplate, newItem);

	// Append or prepend html
	if(prepend === false) {
		$("#load_logs").append(html);

	} else {
		$(".log").first().before(html);
	}

	// Append children
	$.each(children, function(i, child) {

		// Skip the first log
		if(i === 0) {
			return;
		}

		// Build customized Log object
		var childItem = {
			description: returnFirstXWords(child.description, 40),
			owner: logOwners[child.id + '_1'],
			modifiedOwner: child.owner,
			createdDate: formatDate(child.createdDate),
			modifiedDate: formatDate(child.modifiedDate),
			modified: false,
			id: child.id + '_' + child.version,
			rawId: child.id,
			attachments : [],
			non_image_attachments: false,
			parent_color: newItem.color
		};

		// Was log entry modified?
		if(child.createdDate !== child.modifiedDate) {
			childItem.modified = true;
		}

		// Alternate background colors
		if(i%2 === 0) {
			childItem.color = "log_history_light";

		} else {
			childItem.color = "log_history_dark";
		}

		// Check if we have an URL and select selected Log
		if(selectedLog !== -1 && parseInt(child.id) === selectedLog) {
			childItem.click = "log_click";

		} else {
			childItem.click = "";
		}

		html = Mustache.to_html(historyTemplate, childItem);
		$("#load_logs").append(html);

	});
}

/**
 * Show logs in the middle section. Some of the data must be formated to be shown properly
 * @param {type} data data in JSON format
 * @param {type} prepend prepend or append new log entry
 * @returns replaces template with data and puts it in the right place
 */
function repeatLogs(data, prepend){
	var children = [];

	var logId = "";
	var logIndex = 0;
	var logOwners = {};
	l(data);

	// HACK: Get owner of the first version of log entry
	$.each(data, function(i, item) {
		logOwners[item.id + "_" + item.version] = item.owner;
	});
	l(logOwners);

	// If we are prepending new data, reverse the order of logs so the will be prepended correctly
	if(prepend) {
		data.reverse();
	}

	// Go through all the logs
	$.each(data, function(i, item) {
		logIndex = i;
		savedLogs[item.id + "_" + item.version] = item;
		var currentLogId = item.id;

		// If id has changed, show logs and clean children array
		if(logId !== currentLogId) {

			if(children.length > 0) {

				// Reverse the order of children
				if(ologSettings.logVersionOrder) {
					children = children.reverse();
				}

				prepareParentAndChildren(i, children, prepend, logOwners);
			}

			children = [];
		}

		children.push(item);
		logId = currentLogId;
	});

	// Print the last element (with children)
	if(children.length > 0) {
		logIndex ++;
		prepareParentAndChildren(logIndex, children, prepend, logOwners);
	}
}

/*
 * Append the last log that enables us to manually load more logs
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
	$('#'+target_id).html("");

	var scale = parseFloat(imageSizes.list[imageSizes.current].scale);
	var correction = parseInt(imageSizes.list[imageSizes.current].correction);
	var containerWidth = $(document).width() * 0.5 * scale - correction;

	$.each(data, function(i, item) {

		// Create customized Attachment object
		var newItem = {
			imageUrl: serviceurl + "attachments/" + logId + "/" + item.fileName,
			fileName: item.fileName,
			imageWidth: containerWidth,
			imageHeight: containerWidth
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
 * Go through Log entry's properties, prepare and display them.
 * @param {Array} properties Attay of properties attached to a Log entry
 */
function repeatProperties(properties) {
	var template = getTemplate("template_log_property");
	var html = "";

	$.each(properties, function(i, property){

		var newProperty = property;
		newProperty.attrs = [];

		$.each(newProperty.attributes, function(attributeKey, attributeValue){
			var attribute = {"key": attributeKey, "value":checkIfLink(attributeValue)};
			newProperty.attrs.push(attribute);
		});

		html = Mustache.to_html(template, newProperty);
		$('.log_properties').append(html);
	});
}

/**
 * Return raw template
 * @param {type} id div id that holds the template
 * @returns template as a string
 */
var templateCache = {};

function getTemplate(id){
	var template = "";

	if(id in templateCache) {
		return templateCache[id];

	} else {
		$.ajaxSetup({async:false});

		$('#template_container').load(templates + ' #' + id, function(response, status, xhr){
			template = $('#' + id).html();
			templateCache[id] = template;
		});

		return template;
	}
}

/*
 * Get Add modal windows from remote site, copy it to index and then show it
 * @param {type} modalId id of the modal windows
 * @param {type} name name of the element to be deleted
 */
function showAddModal(modalId){
	$('#modal_container').load(modalWindows + ' #' + modalId, function(response, status, xhr){
		$('#' + modalId).modal('toggle');

		$('#' + modalId).on('shown', function(){
			$('#' + modalId).find('input[name=name]').focus();
		});
	});
}

/*
 * Get Edit Logbook modal windows from remote site, copy it to index and then show it
 * @param {type} modalId id of the modal windows
 * @param {type} name name of the Logbook
 * @param {type} owner owner of the Logbook
 */
function showEditLogbookModal(modalId, name, owner){
	$('#modal_container').load(modalWindows + ' #' + modalId, function(response, status, xhr){
		$('#' + modalId + ' [name=name]').val(name);
		$('#' + modalId + ' [name=owner]').val(owner);
		$('#' + modalId + ' [name=name_original]').val(name);
		$('#' + modalId).modal('toggle');

		$('#' + modalId).on('shown', function(){
			$('#' + modalId + ' [name=name]').focus();
		});
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
		$('#' + modalId + ' [name=name_original]').val(name);
		$('#' + modalId).modal('toggle');

		$('#' + modalId).on('shown', function(){
			$('#' + modalId + ' [name=name]').focus();
		});
	});
}

/*
 * Get Delete modal windows from remote site, copy it to index and then show it
 * @param {type} modalId id of the modal windows
 * @param {type} name name of the element to be deleted
 */
function showDeleteModal(modalId, name){
	$('#modal_container').load(modalWindows + ' #' + modalId, function(response, status, xhr){
		$('#' + modalId + ' [name=name_original]').val(name);
		$('#' + modalId).modal('toggle');
	});
}

/**
 * Generate Log object from the data in the new Log form
 * @returns Log object
 */
function generateLogObject() {
	var log = [{
		"description":"",
		"logbooks":[],
		"tags":[],
		"properties":[],
		"attachments":[],
		"level":""
	}];

	// Set description
	log[0].description = $('#log_body').val();

	// Set logbooks
	var logbooksString = $('input[name=hidden-logbooks]').val();

	if(logbooksString !== undefined && logbooksString.length > 1) {
		$.each(logbooksString.split(','), function(index, logbook){
			log[0].logbooks.push({"name":logbook});
		});
	}

	// Set tags
	var tagsString = $('input[name=hidden-tags]').val();

	if(tagsString !== undefined && tagsString.length > 1) {
		$.each(tagsString.split(','), function(index, tag){
			log[0].tags.push({"name":tag});
		});
	}

	// Set properties
	var input = $('input[name=properties]');

	// Check if we are adding a new property or if we modified one
	if(input.is("input") && input.val() !== ""){
		l("input");

		var propertiesString = input.val();
		var properties = JSON.parse(propertiesString);
		l(properties);

		$.each(properties, function(i, property) {
			var propertyElement = {"name":property.name, "attributes":{}};

			$.each(property.attrs, function(j, attr){
				l(attr);
				var key = attr.key;
				var value = $('input[name=' + attr.name + ']').val();
				propertyElement.attributes[key] = removeHtmlTags(value);
			});

			log[0].properties.push(propertyElement);
		});

	// We have a new property, parse Property tables, extract values and add
	// them to the Log object
	} else {
		var data = $('.new_property');

		$.each(data, function(i, element){
			var name = $(element).find('input[name=name]').val();
			l(name);
			var propertyElement = {"name":prepareInput(name), "attributes":{}};

			var map = $(element).find('.new_property_body tr');

			$.each(map, function(j, keyValue){

				// Return when we have the last row
				if($(keyValue).children().length < 2) {
					return;
				}

				var key = $(keyValue).find('input[name=key]').val();
				var value = $(keyValue).find('input[name=value]').val();
				propertyElement.attributes[prepareInput(key)] = removeHtmlTags(value);
				l(key + ' - ' + value);
			});

			log[0].properties.push(propertyElement);
		});

	}

	// Set Level
	log[0].level = $('#level_input').find(":selected").val();

	return log;
}

/**
 * Create a Property before you assign it to the Log entry
 * @param {type} properties Array of Log's properties
 */
function createProperty(properties) {

	$.each(properties, function(index, property){
		var json = JSON.stringify(property);

		var userCredentials = $.parseJSON($.cookie(sessionCookieName));

		$.ajax( {
			type: "PUT",
			url : serviceurl + 'properties/' + property.name,
			contentType: 'application/json; charset=utf-8',
			data: json,
			async: false,
			beforeSend : function(xhr) {
				var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
				xhr.setRequestHeader("Authorization", "Basic " + base64);
			},
			statusCode: {
				403: function(){
					showError("You do not have permission to create this Log!", "#error_block", "#error_body", "#new_logbook_error_x");
				},
				500: function(){
					showError("Something went wrong!", "#error_block", "#error_body", "#new_logbook_error_x");
				}
			},
			error : function(xhr, ajaxOptions, thrownError) {

			},
			success : function(xml) {
				l("Log sent to the server");
			}
		});
	});
}

/**
 * After Log ovject is created, send it to the server
 * @param log Log object to be inserted into database
 */
function createLog(log) {
	var logId = null;

	var json = JSON.stringify(log);
	l(json);

	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "POST",
		url : serviceurl + 'logs',
		contentType: 'application/json; charset=utf-8',
		data: json,
		async: false,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
			xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to create this Log!", "#error_block", "#error_body", "#new_logbook_error_x");
			},
			500: function(){
				showError("Something went wrong!", "#error_block", "#error_body", "#new_logbook_error_x");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {

		},
		success : function(xml) {
			l("Log sent to the server");

			$log = $(xml).find("log");
			logId = $log.attr('id');
		}
	});

	return logId;
}

/**
 * Upload all files except pasted ones.
 * @param {type} logId id of a newly created or existing Log entry
 * @param {type} uploadData Array of images to be uploaded
 * @param {type} uploadTargetId upload input element id
 */
function uploadFiles(logId, uploadData, uploadTargetId) {
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	for(var i=0; i<uploadData.length; i++){
		var data = uploadData[i];

		// If file was added and then deleted, data will be null
		if(data === null) {
			return;
		}

		var file = data.files[0];

		if(data !== null) {
			$.ajaxSetup({async:false});

			$(uploadTargetId).fileupload('send', {
				files: file,
				formData: {file: file},
				url: serviceurl + 'attachments/' + logId,
				beforeSend : function(xhr) {
					var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
					xhr.setRequestHeader("Authorization", "Basic " + base64);
				}
			}).success(function(result, textStatus, jqXHR) {
				l("ok");


			}).error(function (jqXHR, textStatus, errorThrown) {
				l(errorThrown);
			});
		}
	};
}

/**
 * After Log object is created, send it to the server
 * @param log Log object to be inserted into database
 */
function modifyLog(log) {
	l(log);
	var logId = log[0].id;
	var json = JSON.stringify(log[0]);
	l(json);

	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "PUT",
		url : serviceurl + 'logs/' + logId,
		contentType: 'application/json; charset=utf-8',
		data: json,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to modify this Log!", "#error_block", "#error_body", "#new_logbook_error_x");
			},
			500: function(){
				showError("Something went wrong!", "#error_block", "#error_body", "#new_logbook_error_x");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {

		},
		success : function(model) {
			l("Log sent to the server");
			$(document).trigger('successfully_modified');
		}
	});
}

/**
 * This code was written by Tyler Akins and has been placed in the
 * public domain.  It would be nice if you left this header intact.
 * Base64 code from Tyler Akins -- http://rumkin.com
 *
 * @param {type} input input string that will be converted to base64
 * @returns {Boolean|encode64.output}
 */
function encode64(input) {
	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	if (!String(input).length) return false;
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;

	do {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}

		output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
			keyStr.charAt(enc3) + keyStr.charAt(enc4);
	} while (i < input.length);

	return output;
}

/**
 * Function converts base64 encoded string to ASCII format
 * @param {type} input base64 input string
 * @returns {decode64.output}
 */
function decode64(input) {
	var base64_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;

	// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	while (i < input.length) {
		enc1 = base64_keyStr.indexOf(input.charAt(i++));
		enc2 = base64_keyStr.indexOf(input.charAt(i++));
		enc3 = base64_keyStr.indexOf(input.charAt(i++));
		enc4 = base64_keyStr.indexOf(input.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		output = output + String.fromCharCode(chr1);

		if (enc3 !== 64) {
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 !== 64) {
			output = output + String.fromCharCode(chr3);
		}
	}
	return output;
}

/**
 * Start listening to form submit and when submit happens, extract data from
 * the form and check user credentials by analysing server response.
 */
function login() {

	/**
	* Disable closing the login dropdown if user clicks on login form elements
	*/

	// Setup drop down menu
	$('.dropdown-toggle').dropdown();

	// Fix input element click problem
	$('.dropdown-menu form').click(function(e) {
		e.stopPropagation();
	});

	$('#user_login_dropdown').click(function(){
		$('.user_dropdown_menu').ready(function(){
			$('#user_username').focus();
		});
	});

	$('#user_submit_form').on('submit', function(e){
		e.preventDefault();

		var username = $('#user_username').val();
		var password = $('#user_password').val();

		$.ajax( {
			type: "POST",
			url : serviceurl + 'logs',
			contentType: 'application/xml; charset=utf-8',
			dataType: 'xml',
			data: '',
			beforeSend : function(xhr) {
				var base64 = encode64(username + ":" + password);
				xhr.setRequestHeader("Authorization", "Basic " + base64);
			},
			statusCode: {
				400: function(){
					saveUserCredentials(username, password);
					l("User logged in");
				},
				404: function(){
					$('#login_error').show('fast');
				}
			},
			error : function(xhr, ajaxOptions, thrownError) {

			},
			success : function(model) {

			}
		});
		window.location.href = firstPageName;
	});
}

/**
 * When user clicks on Sign out link, delete a session cookie and redirect user
 * to the first page.
 */
function logout() {
	l("logged out");
	deleteUserCredentials();
	window.location.href = firstPageName;
}

/**
 * Save user credentials to the cookie with 1 day of expiration time.
 * @param {type} username user's username
 * @param {type} password user's password
 */
function saveUserCredentials(username, password) {
	var credentials = {"username": username, "password": password};
	$.cookie(sessionCookieName, JSON.stringify(credentials), {expires: 1});
}

/**
 * Delete session cookie when user loggs out
 */
function deleteUserCredentials() {
	$.removeCookie(sessionCookieName);
}

/**
 * Get user credentials from session cookie when needed
 * @returns {JSON} object with username and password
 */
function getUserCreadentials() {
	var credentials = null;

	if($.cookie(sessionCookieName) !== undefined) {
		credentials = $.parseJSON($.cookie(sessionCookieName));
	}

	return credentials;
}

/**
 * Create Logbook
 * @param logbook current Logbook object
 */
function createLogbook(logbook) {

	var json = JSON.stringify(logbook);
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "POST",
		url : serviceurl + 'logbooks',
		contentType: 'application/json; charset=utf-8',
		data: json,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to create this Logbook!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			},
			500: function(){
				showError("Server error!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			l("something went wrong");
		},
		success : function(model) {
			l("Logbook sent to the server");
			$('#myModal').modal("hide");

			// Are we in main onr create/modify view
			if($('#load_logbooks').doesExist()) {
				loadLogbooks("load_logbooks");

			}else {
				loadLogbooks("load_logbooks_m");
			}
		}
	});
}

/**
 * Modify Logbook
 * @param logbook current Logbook object
 * @param name original name of the Logbook
 */
function modifyLogbook(logbook, name) {

	var json = JSON.stringify(logbook.logbook[0]);
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "POST",
		url : serviceurl + 'logbooks/' + name,
		contentType: 'application/json; charset=utf-8',
		data: json,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to modify this Logbook!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			},
			500: function(){
				showError("Server error!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			l("something went wrong");
		},
		success : function(model) {
			l("Logbook modify command sent to the server");
			$('#editLogbookModal').modal("hide");

			// Are we in main onr create/modify view
			if($('#load_logbooks').doesExist()) {
				loadLogbooks("load_logbooks");

			}else {
				loadLogbooks("load_logbooks_m");
			}
		}
	});
}

/**
 * Delete Logbook and reload filters
 * @param name original name of the Logbook
 */
function deleteLogbook(name) {
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "DELETE",
		url : serviceurl + 'logbooks/' + name,
		contentType: 'application/json; charset=utf-8',
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to delete this Logbook!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			},
			500: function(){
				showError("Server error!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			l("something went wrong");
		},
		success : function(model) {
			l("Logbook delete command sent to the server");
			$('#deleteLogbookModal').modal("hide");

			// Are we in main onr create/modify view
			if($('#load_logbooks').doesExist()) {
				loadLogbooks("load_logbooks");

			}else {
				loadLogbooks("load_logbooks_m");
			}
		}
	});
}

/**
 * Create Tag
 * @param tag current Tag object
 */
function createTag(tag) {

	var json = JSON.stringify(tag);
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "POST",
		url : serviceurl + 'tags',
		contentType: 'application/json; charset=utf-8',
		data: json,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to create this Tag!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			},
			500: function(){
				showError("Server error!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			l("something went wrong");
		},
		success : function(model) {
			l("Tag sent to the server");
			$('#myTagModal').modal("hide");

			// Are we in main or in create/modify view
			if($('#load_tags').doesExist()) {
				loadTags("load_tags");

			} else {
				loadTags("load_tags_m");
			}
		}
	});
}

/**
 * Modify Tag
 * @param tag current Tag object
 * @param name original name of the Logbook
 */
function modifyTag(tag, name) {

	var json = JSON.stringify(tag.tag[0]);
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "POST",
		url : serviceurl + 'tags/' + name,
		contentType: 'application/json; charset=utf-8',
		data: json,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to modify this Tag!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			},
			500: function(){
				showError("Server error!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			l("something went wrong");
		},
		success : function(model) {
			l("Tag modify command sent to the server");
			$('#editTagModal').modal("hide");

			// Are we in main or in create/modify view
			if($('#load_tags').doesExist()) {
				loadTags("load_tags");

			} else {
				loadTags("load_tags_m");
			}
		}
	});
}

/**
 * Delete Tag
 * @param name original name of the Tag
 */
function deleteTag(name) {
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "DELETE",
		url : serviceurl + 'tags/' + name,
		contentType: 'application/json; charset=utf-8',
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to delete this Tag!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			},
			500: function(){
				showError("Server error!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			l("something went wrong");
		},
		success : function(model) {
			l("Logbook delete command sent to the server");
			$('#deleteTagModal').modal("hide");

			// Are we in main or in create/modify view
			if($('#load_tags').doesExist()) {
				loadTags("load_tags");

			} else {
				loadTags("load_tags_m");
			}
		}
	});
}

/**
 * Delete Attachment
 * @param url url of the Attachment to be deleted
 * @param uniqueId src of and image or href of an anchor that uniquely define attachment
 */
function deleteAttachment(url, uniqueId) {
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "DELETE",
		url : url,
		contentType: 'application/json; charset=utf-8',
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to delete this attachment!", "#new_logbook_error_block", "#new_logbook_error_body", "#new_logbook_error_x");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			l("something went wrong");
		},
		success : function(model) {
			l("Attachment delete command sent to the server");
			$('#deleteExistingAttachmentModal').modal("hide");

			var imgAtt = $('img[src="' + uniqueId + '"]');
			var fileAtt = $('a[href="' + uniqueId + '"]');

			if(fileAtt.is("a")) {
				fileAtt.parent().hide();

			} else {
				imgAtt.parent().hide();
			}
		}
	});
}

/**
 * Function for uploading files pasted in Firefox. Img data is in URI scheme
 * http://en.wikipedia.org/wiki/Data_URI_scheme
 *
 * Create custom xhr object and send img source to the server.
 *
 * @param {type} logId id of the Log entry we are creating
 * @param {type} pastedData array or pasted sources
 */
function uploadPastedFiles(logId, pastedData) {
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.each(pastedData, function(index, source){

		if(source !== null) {
			var sourceParts = source.split('base64,');

			var dataType = sourceParts[0].substring(5, sourceParts[0].length-1);
			var data = sourceParts[1];
			var ending = dataType.split('/')[1];

			var url = serviceurl + 'attachments/' + logId;

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, false);

			var boundary = '------multipartformboundary' + (new Date).getTime();
			var dashdash = '--';
			var crlf = '\r\n';

			var content = dashdash+boundary+crlf
					+'Content-Disposition: form-data; name="file"; filename="image_' + (new Date).getTime() + '.' + ending + '"'+crlf
					+'Content-Type: '+dataType+crlf
					+'Content-Transfer-Encoding: BASE64'+crlf
					+crlf
					+data
					+crlf+dashdash+boundary+dashdash
					+crlf;

			xhr.setRequestHeader("Content-type", "multipart/form-data; boundary="+boundary);
			var base64EncodedUsernameAndPassword = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64EncodedUsernameAndPassword);

			// execute
			xhr.send(content);
		}
	});
}

/**
 * When logs are loaded onto the page, start listening for mouse clicks on them
 * @returns {undefined}
 */
function startListeningForLogClicks(){
	var actionElement = null;

	// Toggle show details
	$('.log_show_details').unbind('click');
	$('.log_show_details').click(function(e){

		if($('.log_details').is(':visible')) {
			$('#show_details').text('Show details');
			l("show details");

		} else {
			$('#show_details').text('Hide details');
			l("hide details");
		}

		$('.log_details').toggle(400, 'swing');
	});

	// Select a log entry
	$('.log').unbind('click');
	$('.log').click(function(e){
		$('.log').removeClass("log_click");

		if($(e.target).is("div") && !$(e.target).hasClass("show_history")){
			actionElement = $(e.target);

		}else if($(e.target).parent().is("div") && !$(e.target).parent().hasClass("show_history")){
			actionElement = $(e.target).parent();

		} else {
			actionElement = $(e.target).parent().parent();
		}

		var id = actionElement.find('[name=id]').val();
		window.location.href = "#" + id;

		$('html, body').animate({
			scrollTop: $('.container-right').offset().top
		}, 100);

		actionElement.toggleClass("log_click");
		var log = getLog(actionElement.find("input[name=id]").val());
		showLog(log[0], log[1]);
	});
}

/**
 * Scroll to the last log if user clicked on the time filter
 * @returns {undefined}
 */
function scrollToLastLog() {

	// Scroll to the last log only if we are not limiting rest response
	if(limit === false) {
		var container = $('#load_logs');
		var scrollTo = $('.log').last();

		if(scrollTo !== undefined && scrollTo.offset() !== undefined) {
			container.scrollTop(scrollTo.offset().top - container.offset().top + container.scrollTop());
		}
	}
}

/**
 * Scroll to specific element
 * @param containerSelector id of container with scroller
 * @param scrollToSelector id of element we want to scroll to
 * @returns {undefined}
 */
function scrollToElement(containerSelector, scrollToSelector) {

	var container = $(containerSelector);
	var scrollTo = $(scrollToSelector);

	if(scrollTo !== undefined && scrollTo.offset() !== undefined) {
		container.scrollTop(scrollTo.offset().top - container.offset().top + container.scrollTop());

	} else if(scrollTo !== undefined) {
		container.scrollTop(scrollTo.offset().top);
	}
}