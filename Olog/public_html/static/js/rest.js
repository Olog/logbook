/* 
 * Load tada on dom ready
 * 
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

// Create object for saving logs
var savedLogs = {};
var page = 1;

$(document).ready(function(){
	
	// Load Logbooks
	$.getJSON(serviceurl + 'logbooks/', function(books) {
		repeat("template_logbook", "load_logbooks", books, "logbook");
		multiselect("list");
	});
	
	// Load tags
	$.getJSON(serviceurl + 'tags/', function(tags) {
		repeat("template_tag", "load_tags", tags, "tag");
		multiselect("list2");
	});
	
	singleselect("list3");
	
	// Load logs
	loadLogs(1);
	
	// Simple search
	$("#search-button").click(function(e){
		var searchQuery = $("#search-query").val();
		
		if(searchQuery === ""){
			page = 1;
			loadLogs(page);
		
		} else {
		
			// Load logs
			$.getJSON(serviceurl + 'logs?search=' + searchQuery, function(logs) {
				$(".log-last").remove();
				$(".log").remove();
				repeatLogs("template_log", "load_logs", logs);
				startListeningForLogClicks();
			});
		}
	});
});

function loadLogs(page){
	// Remo all the logs if we are starting from the beginning
	if(page === 1){
		$(".log").remove();
	}

	$.getJSON(serviceurl + 'logs?limit=' + numberOfLogsPerLoad + '&page=' + page, function(logs) {
		$(".log-last").remove();
		repeatLogs("template_log", "load_logs", logs);
		appendAddMoreLog("load_logs");
		startListeningForLogClicks();
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
		html = Mustache.to_html(template, item);
	
		$('#'+target_id).append(html);
	});
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

function appendAddMoreLog(target_id){
	// Create load more Log
	var template = getTemplate("template_log_add_more");
	page = page + 1;

	var loadMoreLog = {
		page: page
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
	return $('#'+id).html();
}