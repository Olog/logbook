/*
 * Functions common to complete application
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){

	// Write data from cookie back to object and remove cookie
	if($.cookie(filtersCookieName) !== undefined) {
		selectedElements = $.parseJSON($.cookie(filtersCookieName));
	}

	// Read data from settings cookie and set it to ologSettings object
	if($.cookie(settingsCookieName) !== undefined) {
		ologSettings = $.parseJSON($.cookie(settingsCookieName));

	} else {
		// Set includeHistory
		ologSettings.includeHistory = includeHistory;
	}

	// Set version number
	$('.version').html("v" + version);

	// Create new comparator
	jQuery.expr[':'].Contains = function(a, i, m) {
		return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
	};

	// Create selector for searching for exact text value
	jQuery.expr[':'].textEquals = function(a, i, m) {
		return $(a).text().match("^" + m[3] + "$");
	};

	var urlObject = $.url();

	// Get reason from url
	var reason = urlObject.param("reason");

	if(reason !== undefined) {
		$('#top_container').toggleClass("open");

		$('.user_dropdown_menu').ready(function(){
			$('#user_username').focus();
		});
	}

	// Get id and show Log user is interested in
	var id = urlObject.attr("anchor");

	if(id !== undefined) {
		selectedLog = id;
	}

	// Delete cookie when Olog resizes
	$(window).resize(function(e){

		if($.cookie(settingsCookieName) !== undefined && ologSettings.resize !== undefined) {
			$.removeCookie(settingsCookieName);
			l("reload");
			window.location.reload();
		}
	});

	// Hide Logbooks for small screens
	$('#load_logbooks').on('dataloaded', function(e){
		if($(window).width() < smallScreenResolutionWidth) {
			closeFilterGroup($('#load_logbooks'));
		}
	});

	// Hide Tags for small screens
	$('#load_tags').on('dataloaded', function(e){
		if($(window).width() < smallScreenResolutionWidth) {
			closeFilterGroup($('#load_tags'));
		}
	});

	// Hide time filter from
	$('#load_time_from').on('dataloaded', function(e){
		if($(window).width() < smallScreenResolutionWidth) {
			closeFilterGroup($('#load_time_from'));
		}
	});

	// If Olog is opened on small screen resolution, close filters, disable
	// adding and editing.
	if($(window).width() < smallScreenResolutionWidth) {
		closeFilterGroup($('#load_from_to_chevron'));
	}

	// Start listening for expand/collapse filters
	startListeningForToggleFilterClicks();
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
 * Initialize pans resize listener.
 *
 * Check if we have dimensions already saved in a cookie and set widths. If dimensions
 * are not saved, created new dimension object and fill it with current dimensions.
 */
function resizeManager() {
	var leftPane = ".container-left";
	var middlePane = ".container-middle";
	var rightPane = ".container-right";
	var modifyLeftPane = ".container-modify-left";
	var modifyRightPane = ".container-modify-right";

	// Resize left and middle section
	$('.container-resize').draggable({axis: "x"});

	// Resize middle and right section
	$('.container-resize2').draggable({axis: "x"});

	// Resize middle and right section
	$('.container-resize3').draggable({axis: "x"});

	var dims = null;

	var windowWidth = $(window).width();
	var minWidth = Math.round(windowWidth * 0.1);

	// If cookie is not set, create new dims object
	if(ologSettings.resize === undefined) {
		//l("new dims");

		dims = {
			left_pane_width: undefined,
			middle_pane_left: undefined,
			middle_pane_width: undefined,
			right_pane_left: undefined,
			right_pane_width: undefined,

			modify_left_pane_left: undefined,
			modify_left_pane_width: undefined,
			modify_right_pane_left: undefined,
			modify_right_pane_width: undefined
		};

		// Set the rest of the sizes so we don't get into trouble
		/*if($(middlePane).doesExist()){
			var middlePaneWidth = $(middlePane).width();

			dims.middle_pane_width = middlePaneWidth;
			dims.right_pane_width = windowWidth - dims.left_pane_width - middlePaneWidth;
			dims.right_pane_left = dims.left_pane_width + middlePaneWidth;

		// New modify layout, set sizes
		} else {
			dims.modify_left_pane_left = 0;
			dims.modify_left_pane_width = $(modifyLeftPane).width();
			dims.modify_right_pane_left = dims.modify_left_pane_width;
			dims.modify_right_pane_width = $(modifyRightPane).width();
		}*/

	// If settings cookie is set, read and set the panes' dimensions
	} else {
		dims = ologSettings.resize;
		l(dims);

		$(leftPane).width(dims.left_pane_width);
		$(middlePane).css({left: dims.middle_pane_left});
		$(middlePane).width(dims.middle_pane_width);
		$(rightPane).css({left: dims.right_pane_left});
		$(rightPane).width(dims.right_pane_width);

		$(modifyLeftPane).css({left: dims.modify_left_pane_left});
		$(modifyLeftPane).width(dims.modify_left_pane_width);
		$(modifyRightPane).css({left: dims.modify_right_pane_left});
		$(modifyRightPane).width(dims.modify_right_pane_width);

		$('.container-resize').css({left: dims.middle_pane_left});
		$('.container-resize2').css({left: dims.right_pane_left});
		$('.container-resize3').css({left: dims.modify_right_pane_left});
	}

	// Drag left resizer
	$('.container-resize').on('drag', function(e){
		dims.left_pane_width = $(leftPane).width();
		dims.middle_pane_left = dims.left_pane_width;

		//l(dims);

		var oldWidth = $(leftPane).width();

		// Limit the minimal width of the left pane
		if(oldWidth < minWidth && e.pageX < dims.left_pane_width) {
			return;
		}

		// Limit the minimal width of the middle pane
		if(dims.middle_pane_width < minWidth && e.pageX > dims.middle_pane_left) {
			return;
		}

		var diff = oldWidth - e.pageX;

		$(leftPane).width(e.pageX);
		dims.left_pane_width = e.pageX;

		$(middlePane).css({left: e.pageX});
		dims.middle_pane_left = e.pageX;

		// If middle pane exists, repair its width
		$(middlePane).width($(middlePane).width() + diff);
		dims.middle_pane_width = $(middlePane).width() + diff;

		ologSettings.resize = dims;
		saveOlogSettingsData(ologSettings);
	});

	// Stop dragging left resizer
	$('.container-resize').on('dragstop', function(e){
		$('.container-resize').css({left: dims.left_pane_width});
	});

	// Drag right resizer
	$('.container-resize2').on('drag', function(e){
		dims.left_pane_width = $(leftPane).width();
		dims.middle_pane_left = dims.left_pane_width;

		//l(dims);

		// Limit the minimal width of the middle pane
		if($(middlePane).width() < minWidth && e.pageX < dims.middle_pane_left + dims.middle_pane_width) {
			return;
		}

		// Limit the minimal width of the right pane
		if($(rightPane).width() < minWidth && e.pageX > dims.right_pane_left) {
			return;
		}

		$(middlePane).width(e.pageX - dims.middle_pane_left);
		dims.middle_pane_width = e.pageX - dims.middle_pane_left;

		$(rightPane).css({left: e.pageX});
		dims.right_pane_left =  e.pageX;

		$(rightPane).width($(window).width() - dims.right_pane_left);
		dims.right_pane_width = $(window).width() - dims.right_pane_left;

		//l(dims.right_pane_width + '|' + dims.right_pane_left);

		ologSettings.resize = dims;
		saveOlogSettingsData(ologSettings);
	});

	// Stop dragging left resizer
	$('.container-resize2').on('dragstop', function(e){
		$('.container-resize2').css({left: dims.right_pane_left});
	});

	// Drag new resizer in create/modify layout
	$('.container-resize3').on('drag', function(e){
		//l(dims);

		var oldWidth = $(modifyLeftPane).width();

		// Limit the minimal width of the left pane
		if(oldWidth < minWidth && e.pageX < dims.modify_left_pane_width) {
			return;
		}

		// Limit the minimal width of the right pane
		if(dims.modify_right_pane_width < minWidth && e.pageX > dims.modify_right_pane_left) {
			return;
		}

		var diff = oldWidth - e.pageX;

		$(modifyLeftPane).width(e.pageX);
		dims.modify_left_pane_width = e.pageX;

		$(modifyRightPane).css({left: e.pageX});
		dims.modify_right_pane_left = e.pageX;

		// If middle pane exists, repair its width
		$(modifyRightPane).width($(modifyRightPane).width() + diff);
		dims.modify_right_pane_width = $(modifyRightPane).width() + diff;

		ologSettings.resize = dims;
		saveOlogSettingsData(ologSettings);
	});

	// Stop dragging new resizer
	$('.container-resize3').on('dragstop', function(e){
		$('.container-resize3').css({left: dims.modify_right_pane_left});
	});
}

/**
 * Replace special characters in strings that should not contain them
 * @param {type} input input string
 * @returns {string} replaced input string
 */
function prepareInput(input) {
	return input.replace(/[^a-z0-9]/ig, "");
}

/**
 * Remove html tags from input string
 * @param {type} input input string
 * @returns {string} replaced string
 */
function removeHtmlTags(input) {
	return input.replace(/<.*?>/ig, "");
}

/**
 * Disable creating new Logs, Logbooks, Tags and mofidying them
 */
function disableCreatingNewAndModifying() {
	$('#new_log').addClass("disabled");
	$('#new_log').attr("disabled", true);
	$('#new_logbook_and_tag').addClass("disabled");
	$('#new_logbook_and_tag').attr("disabled", true);
	$('#modify_log_link').hide();
}

/**
 * Enable creating Logs, Logbooks, Tags and modifying them
 */
function enableCreatingAndModifying() {
	$('#new_log').removeClass("disabled");
	$('#new_log').attr("disabled", false);
	$('#new_logbook_and_tag').removeClass("disabled");
	$('#new_logbook_and_tag').attr("disabled", false);
}

/**
 * Save filter data into a cookie
 * @param {type} dataToBeSaved object to be saved into a cookie
 */
function saveFilterData(dataToBeSaved) {
	l("save filters data");
	l(dataToBeSaved);
	$.cookie(filtersCookieName, JSON.stringify(dataToBeSaved));
}

/**
 * Save settings data to a cookie
 * @param {type} dataToBeSaved data to be saved into a cookie
 */
function saveOlogSettingsData(dataToBeSaved) {
	$.cookie(settingsCookieName, JSON.stringify(dataToBeSaved));
}

/**
 *
 * @param {type} rawId id of the first child element
 * @param {type} element type of the filter (logbooks or tags)
 */
function toggleChildren(rawId, element){
	l("toggle children");
	//var rawId = $(e.target).find('input[name=raw_id]').val();
	l(rawId);

	l($($('.child_' + rawId)[0]).is(":visible"));

	var infoElement = $(element).find("span");
	var iconElement = $(element).find("i");

	if($('.child_' + rawId).is(":hidden")) {
		infoElement.text("Hide history");
		iconElement.removeClass("icon-chevron-up");
		iconElement.addClass("icon-chevron-down");

	} else {
		infoElement.text("Show history");
		iconElement.removeClass("icon-chevron-down");
		iconElement.addClass("icon-chevron-up");
	}

	// Slide up items that does not contain filters and are not selected
	$('.child_' + rawId).slideToggle();
}