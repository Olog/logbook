/*
 * Helper functions
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 * @created: 2014-11-17
 */

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

	// Check if from is defined
	if(from !== undefined) {
		reg = new RegExp('last (\\d+) (\\w+).*', "i");
		searchParts = reg.exec(from);

		if(searchParts !== null) {

			if(searchParts[0] !== "") {
				fromSeconds = parseInt(searchParts[1] * eval(timeFilter[searchParts[2]]));
			}

		} else {
			var parseFrom = moment(from, datePickerDateFormatMometParseString);
			from = Math.round((parseFrom.toDate().getTime())/1000);
			fromSeconds = currentSeconds - from;
		}
	}

	// Check if to is defined
	if(to !== undefined) {
		reg = new RegExp('(\\d+) (\\w+) ago.*', "i");
		searchParts = reg.exec(to);

		if(searchParts !== null) {

			if(searchParts[0] !== "") {
				toSeconds = parseInt(searchParts[1] * eval(timeFilter[searchParts[2]]));
			}

		} else {
			var parseTo = moment(to, datePickerDateFormatMometParseString);
			to = Math.round((parseTo.toDate().getTime())/1000);
			toSeconds = currentSeconds - to;
		}
	}

	return [currentSeconds - fromSeconds, currentSeconds - toSeconds];
}

/*
 * Retun first X words from the string.
 * @param {type} string input string
 * @param {type} count how many of words do we want to return
 * @returns {String} First X words
 */
function returnFirstXWords(string, count){
	var words = string.split(" ");
	var summary = "";
	var append = "";

	if (count > words.length) {
		count = words.length;

	} else {
		append = " ...";
	}

	if(words.length > 0){
		summary = words[0];

		if(words.length > 1){
			for(i=1; i<count; i++) {
				summary += " " + words[i];
			}
		}
		return summary + append;

	}else {
		return summary;
	}
}

/**
 * Format the date according to format specified in configuration.js file
 * @param {type} input datetime string
 * @returns {unresolved} formated datetime string
 */
function formatDate(input) {
	var day = moment(input);
	var formatedDate = day.format(dateFormat);
	return formatedDate;
}

/**
 * Split input string line by line and convert every line from html to text.
 * @param {type} value input value
 */
function multiLineHtmlEncode(value) {
	var lines = value.split(/\r\n|\r|\n/);

	for (var i = 0; i < lines.length; i++) {
		lines[i] = htmlEncode(lines[i])+"<br />";
	}
	return lines.join('\r\n');
}

/**
 * Convert string from html to text
 * @param {type} value input value
 * @returns textual presentation of html
 */
function htmlEncode(value) {
	return $('<div/>').text(value).html();
}

/**
 * Is file we want to upload image or not
 * @param {type} type MIME type string
 * @returns {Boolean} is mimetype an image or not
 */
function isImage(type) {
	typeParts = type.split("/");

	if(typeParts.length === 2 && typeParts[0] === "image") {
		return true;

	} else {
		return false;
	}
}

/**
 * Check if elements is present in the current DOM or not
 * @returns {Boolean}
 */
jQuery.fn.doesExist = function(){
	return jQuery(this).length > 0;
};

/**
 * Show error in specific error block
 * @param {type} string string that describes an error
 * @param {type} blockId id of the error block
 * @param {type} blockBody id of the error block body
 * @param {type} errorX id of the error block body close icon
 * @returns {undefined}
 */
function showError(string, blockId, blockBody, errorX) {
	var errorBlock = $(blockId);
	var errorBody = $(blockBody);
	var errorX = $(errorX);

	errorBody.html(string);
	errorBlock.show("fast");

	errorX.click(function(e) {
		errorBlock.hide("fast");
	});
}

/**
 * If input string looks like a link, surround it with <a> tag
 * @param {type} input input strig that is checked if it looks like a real link.
 * @returns {String|checkIfLink.input}
 */
function checkIfLink(input) {

	if(input.toLowerCase().indexOf("http") === 0) {
		return '<a href="' + input + '" target="_blank">' + input + '</a>';

	} else {
		return input;
	}
}

/**
 * Close filter group and leave selected items visible
 * @param {type} groupContainer container object that holds filters
 */
function closeFilterGroup(groupContainer) {
	groupContainer.find('li:gt(0)').addClass('display_none');

	// Style attribute is added when filter items are being filtered
	groupContainer.find('li:gt(0)').removeAttr("style");
	groupContainer.find('li:gt(0) .multilist_clicked').parent().removeClass('display_none');

	var arrow = groupContainer.find('li i.toggle-from');
	toggleChevron(arrow, false);

	// Check if filtersOpened is defined
	if(ologSettings.filtersOpened === undefined) {
		ologSettings.filtersOpened = {};
	}

	ologSettings.filtersOpened[groupContainer.attr('id')] = false;

	// Save settings into a cookie
	saveOlogSettingsData(ologSettings);
}

/**
 * Toggle chevron on an element
 * @param {type} element element that contains chevron
 * @param openGroup define this argument if you want to enforce open/close group
 */
function toggleChevron(element, openGroup) {

	if(openGroup === undefined) {

		if($(element).hasClass('icon-chevron-down')) {
			$(element).removeClass('icon-chevron-down');
			$(element).addClass('icon-chevron-right');

		} else {
			$(element).removeClass('icon-chevron-right');
			$(element).addClass('icon-chevron-down');
		}

	} else {

		if(openGroup === false) {
			$(element).removeClass('icon-chevron-down');
			$(element).addClass('icon-chevron-right');

		} else {
			$(element).removeClass('icon-chevron-right');
			$(element).addClass('icon-chevron-down');
		}
	}
}

/**
 * Save settings data to a cookie
 * @param {type} dataToBeSaved data to be saved into a cookie
 */
function saveOlogSettingsData(dataToBeSaved) {
	$.cookie(settingsCookieName, JSON.stringify(dataToBeSaved));
}