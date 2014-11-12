/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

// Array of different search types
var searchTypes = [];

// Autocomplete object that can contain different arrays for autocompletion
var autocomplete = searchTypes;

$(document).ready(function(){

	// Listen to include history chenckbox change
	$('#search-query-clean').unbind('click');
	$('#search-query-clean').on('click', function(e) {
		deleteFilterData();
		window.location.reload();
	});

	// Create
	$.each(keyMap, function(key, value){
		searchTypes.push(key);
	});

	// Wait for dataselect on logbooks filter
	$('#load_logbooks').on('dataselected', function(e, data){
		generateSearchQuery(data);
	});

	// Wait for dataselect on tags filter
	$('#load_tags').on('dataselected', function(e, data){
		generateSearchQuery(data);
	});

	// Wait for dataselect on time from filter
	$('#load_time_from').on('dataselected', function(e, data){
		generateSearchQuery(data);
	});

	// Wait for dataselect on time to filter
	$('#load_time_to').on('dataselected', function(e, data){
		generateSearchQuery(data);
	});

	// Wait for dataselect on from-to filter
	$('#load_time_from_to').on('dataselected', function(e, data){
		generateSearchQuery(data);
	});

	// Activate search autocomplete functionality
	searchAutocomplete();
});

/**
 * When search event happens, parse input and search for Logs.
 */
function activateSearch(){
	// Simple search
	var searchQuery = buildSearchQuery();
	l("search query " + searchQuery);

	// If search query is empty just load first page of Logs
	if(searchQuery === ""){
		page = 1;
		loadLogs(page, true);

	// If search query is not empty, send this query to the server
	} else {
		searchForLogs(searchQuery, true);
	}
}

/*
 * Start listening for Search multiple events.
 */
function startListeningForSearchEvents() {
	// Listen to a click of a button
	$("#search-button").click(function(e){
		activateSearch();
	});

	// Listen to press of an Enter key
	$("#search-query").keypress(function(e){

		if(e.which === 13) {
			activateSearch();
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

	searchQuery = serviceurl + 'logs?' + searchQuery + 'page=' + page + '&limit=' + numberOfLogsPerLoad + '&';

	// Append include history parameter
	if(ologSettings.includeHistory && !("history" in $.url(searchQuery).param())) {
		searchQuery += historyParameter + "=&";
	}

	searchURL = searchQuery;

	l(searchURL);

	// Load logs
	$.getJSON(searchQuery, function(logs) {
		$(".log-last").remove();
		$(".log").remove();
		repeatLogs(logs, false);
		appendAddMoreLog("load_logs");
		startListeningForLogClicks();
		scrollToLastLog();

		$('.log img').last().load(function(){
			scrollToLastLog();
		});
	});
}

/**
 * Start parsing search input value from left to right and return type and search
 * value.
 * @param {type} value unparsed string part
 * @returns {Array} array that consists of search type, search value and remainder
 */
function parseSearchLanguage(value){

	var searchString = "";
	var filterType = "";
	var remainder = "";

	var re = new RegExp("(tag:|logbook:|from:|to:|^)(.*?)(tag:.*|logbook:.*|from:.*|to:.*|$)", "i");
	var searchParts = re.exec(value);

	if(searchParts === null) {
		searchString = value;

	} else {
		filterType = searchParts[1];
		searchString = searchParts[2];
		remainder = searchParts[3];
	}

	return [filterType, searchString, remainder];
}

/**
 * Build search query from search input
 * @returns {String} prepared search query
 */
function buildSearchQuery(){

	var value = $("#search-query").val();
	var query = "";

	var parsedStringParts = parseSearchLanguage(value);

	// Get custom part of search value
	if(parsedStringParts[0] === "") {

		// Prepend and append a star
		if(trim(parsedStringParts[1]) !== "") {
			query += keyMap['search:'] + "*" + trim(parsedStringParts[1]) + "*&";
		}

	} else {
		if(keyMap[parsedStringParts[0]] !== undefined) {

			if(parsedStringParts[0] === "from:" || parsedStringParts[0] === "start:") {
				query += keyMap[parsedStringParts[0]] + returnTimeFilterTimestamp(trim(parsedStringParts[1]), undefined)[0] + "&";

			} else if(parsedStringParts[0] === "to:" || parsedStringParts[0] === "end:") {
				query += keyMap[parsedStringParts[0]] + returnTimeFilterTimestamp(undefined, trim(parsedStringParts[1]))[1] + "&";

			} else {
				query += keyMap[parsedStringParts[0]] + trim(parsedStringParts[1]) + "&";
			}
		}
	}

	// Get tags, logbooks and time constraints that are present in search input
	while (parsedStringParts[2] !== "") {
		parsedStringParts = parseSearchLanguage(parsedStringParts[2]);

		if(keyMap[parsedStringParts[0]] !== undefined) {

			if(parsedStringParts[0] === "from:" || parsedStringParts[0] === "start:") {
				query += keyMap[parsedStringParts[0]] + returnTimeFilterTimestamp(trim(parsedStringParts[1]), undefined)[0] + "&";

			} else if(parsedStringParts[0] === "to:" || parsedStringParts[0] === "end:") {
				query += keyMap[parsedStringParts[0]] + returnTimeFilterTimestamp(undefined, trim(parsedStringParts[1]))[1] + "&";

			} else {
				query += keyMap[parsedStringParts[0]] + trim(parsedStringParts[1]) + "&";
			}
		}
	}
	return query;
}

/**
 * Generate search input string and search query when user clicks on filters
 * in the left pane.
 * @param {type} dataArray currently selected logbooks and tags
 * @returns {undefined}
 */
function generateSearchQuery(dataArray) {

	// If there is no data, try to get data from global variable
	if(dataArray === null) {
		dataArray = selectedElements;
	}

	var value = $("#search-query").val();
	var queryString = "";

	var parsedStringParts = parseSearchLanguage(value);

	var newValue = "";

	// Append general search to a search query
	if(parsedStringParts[0] === "" && value !== ""){
		newValue = parsedStringParts[1];
		queryString += "search=" + newValue + '&';

		if(newValue[newValue.length-1] !== " ") {
			newValue += " ";
		}
	}

	// If at least one logbook is selected, append logbook part to a search query
	if(dataArray['list'] !== undefined && dataArray['list'].length !== 0) {
		newValue += "logbook: " + dataArray['list'] + ' ';
		queryString += "logbook=" + dataArray['list'] + '&';
	}

	// If at least one tag is selected, append tag part to a search query
	if(dataArray['list2'] !== undefined && dataArray['list2'].length !== 0) {
		newValue += "tag: " + dataArray['list2'] + ' ';
		queryString += "tag=" + dataArray['list2'] + '&';
	}

	// From time filter is set, append time part to a search query
	if(dataArray['from'] !== undefined && dataArray['from'].length !== 0) {
		newValue += "from: " + dataArray['from'] + ' ';
		queryString += "start=" + returnTimeFilterTimestamp(dataArray['from'], undefined)[0] + '&';
	}

	// If to time filter is set, append time part to a search query
	if(dataArray['to'] !== undefined && dataArray['to'].length !== 0) {
		newValue += "to: " + dataArray['to'] + ' ';
		queryString += "end=" + returnTimeFilterTimestamp(undefined, dataArray['to'])[1] + '&';
	}

	// Append include history parameter
	if(ologSettings.includeHistory && !("history" in $.url(queryString).param())) {
		queryString += historyParameter + "=&";
	}

	// Set new search query to its place
	$("#search-query").val(newValue);
	searchForLogs(queryString, true);
}

/**
 * Split search input value by space
 * @param val current input value
 */
function split(val) {
	return val.split(/ \s*/);
}

/**
 * Extract last item when input is split by custom devider
 * @param {type} term devider for spliting input value
 * @returns last item that is result of slpit
 */
function extractLast(term) {
	return split(term).pop();
}

/**
 * Initialize autocomplete functionality on search input
 */
function searchAutocomplete() {

	// don't navigate away from the field on tab when selecting an item
	$("#search-query").bind("keydown", function(event) {
			if (event.keyCode === $.ui.keyCode.TAB &&
				$(this).data("ui-autocomplete").menu.active) {
				event.preventDefault();
			}

		}).autocomplete({
			minLength: 0,
			source: function(request, response) {
				// delegate back to autocomplete, but extract the last term
				response($.ui.autocomplete.filter(
				autocomplete, extractLast(request.term)));
			},
			focus: function() {
				// prevent value inserted on focus
				return false;
			},
			select: function(event, ui) {
				var terms = split(this.value);
				// remove the current input
				terms.pop();

				var selectedItem = ui.item.value;

				// add the selected item
				terms.push(ui.item.value);

				if(selectedItem === "tag:") {
					autocomplete = savedTags.concat(searchTypes);

				} else if(selectedItem === "logbook:") {
					autocomplete = savedLogbooks.concat(searchTypes);
				}

				// add placeholder to get the comma-and-space at the end
				terms.push("");
				this.value = terms.join(" ");
				return false;
			}
		});
}