/* 
 * Load tada on dom ready
 * 
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

// Create object for saving logs
var savedLogs = {};

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
	
	// Load logs
	$.getJSON(serviceurl + 'logs?limit=' + numberOfLogsPerLoad + '&page=1', function(logs) {
		repeatLogs("template_log", "load_logs", logs);
		startListeningForLogClicks();
	});
});

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
		repeatAttachments("template_log_attachment", "load_log_attachments", log.attachments, log.id);
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
	
	$.each(data, function(i, item) {
		savedLogs[item.id] = item;
		
		var newItem = {
			description: returnFirstXWords(item.description, 40),
			owner: item.owner,
			createdDate: formatDate(item.createdDate),
			id: item.id
		};
		
		html = Mustache.to_html(template, newItem);
		
		// Append attachments
		if(item.attachments.length !== 0){
			var attachmentTemplate = getTemplate("template_log_list_attachment");
			
			$.each(item.attachments, function(j, attachment) {
				
				// Skip non-image attachments
				if(attachment.contentType === "text/plain"){
					return;
				}
				
				var newAtt = {
					imageUrl: serviceurl + "attachments/" + item.id + "/" + attachment.fileName + ":thumbnail"
				};

				attachmentHtml = Mustache.to_html(attachmentTemplate, newAtt);
				html += attachmentHtml;
			});
			
			html += "</div>";
		}
	
		$('#'+target_id).append(html);
	});
}

function repeatAttachments(source_id, target_id, data, logId){
	
	var template = getTemplate(source_id);
	var html = "";
	
	$.each(data, function(i, item) {
		
		var newItem = {
			imageUrl: serviceurl + "attachments/" + logId + "/" + item.fileName,
			imageWidth: 200,
			imageHeight: 200
		};
		
		html = Mustache.to_html(template, newItem);
	
		$('#'+target_id).append(html);
	});
}

function getTemplate(id){
	return $('#'+id).html();
}