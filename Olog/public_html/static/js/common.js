/*
 * Function not specific to any html document
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){

	var urlObject = $.url();

	// Get reason
	var reason = urlObject.param("reason");

	if(reason !== undefined) {
		$('#top_container').toggleClass("open");
	}

	// Get id
	var id = urlObject.attr("anchor");
	l("anchor" + id);

	if(id !== undefined) {
		selectedLog = parseInt(id);
	}
});

/**
 * Write logs to Chrome or Firefox console
 * @param input input string
 */
function l(input) {

	if(writeLogs === true) {
		console.log(input);
	}
}

/**
 * Make the first letter in every word uppercase
 * @param {type} input input string
 * @returns {string} output string
 */
function firstLetterToUppercase(input) {
	input = input.toLowerCase().replace(/\b[a-z]/g, function(letter) {
		return letter.toUpperCase();
	});

	return input;
}

/**
 * Trim spaces from the start and the end of the string
 * @param {type} str input string
 * @returns {unresolved} string without spaces in the start and at the end of string
 */
function trim(str) {
	str = str.replace(/^\s+/, '');
	for (var i = str.length - 1; i >= 0; i--) {
		if (/\S/.test(str.charAt(i))) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return str;
}

/**
 * Convert time filter from the left pane to the actual time
 * @param {type} from from time filter group
 * @param {type} to to time filter group
 */
function returnTimeFilterTimestamp(from, to) {
	var reg = null;
	var searchParts = [""];
	var fromSeconds = 0;
	var toSeconds = 0;
	var currentSeconds = Math.round((new Date().getTime())/1000);

	if(from !== undefined) {
		reg = new RegExp('(last )?(\\d+) (\\w+).*', "i");
		searchParts = reg.exec(from);
		l(searchParts);

		if(searchParts[0] !== "") {
			fromSeconds = parseInt(searchParts[2] * eval(timeFilter[searchParts[3]]));
		}
	}

	if(to !== undefined) {
		reg = new RegExp('(\\d+) (\\w+)( ago)?.*', "i");
		searchParts = reg.exec(to);
		l(searchParts);

		if(searchParts[0] !== "") {
			toSeconds = parseInt(searchParts[1] * eval(timeFilter[searchParts[2]]));
		}
	}
	l(fromSeconds + ':' + toSeconds);

	return [currentSeconds - fromSeconds, currentSeconds - toSeconds];
}