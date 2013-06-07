/* 
 * Load tada on dom ready
 * 
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */
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
}