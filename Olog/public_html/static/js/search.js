/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function(){
	// Wait for dataselect
	$('#load_logbooks').on('dataselected', function(e, data){
		//parseSearchQuery();
		generateSearchQuery(data);
	});

	// Wait for dataselect
	$('#load_tags').on('dataselected', function(e, data){
		//parseSearchQuery();
		generateSearchQuery(data);
	});
});

/*
 * Start listening for Search button clicks. When button is pressed, parse input and create search query
 * @returns {undefined}
 */
function activateSearch(){
	// Simple search
	$("#search-button").click(function(e){
		var searchQuery = $("#search-query").val();
		console.log(searchQuery);
		parseSearchQuery();

		if(searchQuery === ""){
			page = 1;
			loadLogs(page);

		} else {
			searchForLogs('search=' + searchQuery, false);
		}
	});
}

/**
 * Input search query and request data from the server
 * @param {type} searchQuery prebuilt search query
 * @param {type} resetPageCouner on some occasions we want page counter to be reset
 */
function searchForLogs(searchQuery, resetPageCouner) {

	// Reset pagecouner if new filters are selected
	if(resetPageCouner === true) {
		page = 1;
	}

	searchQuery = serviceurl + 'logs?' + searchQuery + 'limit=' + numberOfLogsPerLoad + '&page=' + page;
	searchURL = searchQuery;
	console.log(searchQuery);

	// Load logs
	$.getJSON(searchQuery, function(logs) {
		$(".log-last").remove();
		$(".log").remove();
		repeatLogs("template_log", "load_logs", logs);
		startListeningForLogClicks();
	});
}

// TODO: not really useful but it is a start
function buildSearchLanguage(value){

	var searchString = "";
	var filterType = "";
	var remainder = "";

	var re = new RegExp("(tag:|logbook:|from:|to:)(.*)", "i");
	var searchParts = re.exec(value);

	if(searchParts === null) {
		searchString = value;

	} else {
		filterType = searchParts[1];
		searchString = value.split(filterType)[0];
		remainder = searchParts[2];
	}

	return [searchString, filterType, remainder];
}

// TODO: not really useful but it is a start
function parseSearchQuery(){
	var value = $("#search-query").val();

	var parsedStringParts = buildSearchLanguage(value);
	console.log(parsedStringParts);

	while (parsedStringParts[1] !== "") {
		parsedStringParts = buildSearchLanguage(parsedStringParts[2]);
	}
}

/**
 * Generate search input string and search query
 * @param {type} dataArray currently selected logbooks and tags
 * @returns {undefined}
 */
function generateSearchQuery(dataArray) {
	var value = $("#search-query").val();
	var queryString = "";

	var parsedStringParts = buildSearchLanguage(value);

	var newValue = parsedStringParts[0];

	// Append general search to a search query
	if(newValue !== ""){
		queryString += "search=" + newValue + '&';
	}

	// If at least one logbook is selected, append logbook part to a search query
	if(dataArray['list'] !== undefined && dataArray['list'].length !== 0){
		newValue += "logbook: " + dataArray['list'] + ' ';
		queryString += "logbook=" + dataArray['list'] + '&';
	}

	// If at least one tag is selected, append tag part to a search query
	if(dataArray['list2'] !== undefined && dataArray['list2'].length !== 0){
		newValue += "tag: " + dataArray['list2'] + ' ';
		queryString += "tag=" + dataArray['list2'] + '&';
	}

	$("#search-query").val(newValue);
	searchForLogs(queryString, true);
}