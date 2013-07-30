/*
 * Functions common to complete application
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){

	// Create new comparator
	jQuery.expr[':'].Contains = function(a, i, m) {
		return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
	};

	var urlObject = $.url();

	// Get reason from url
	var reason = urlObject.param("reason");

	if(reason !== undefined) {
		$('#top_container').toggleClass("open");
	}

	// Get id and show Log user is interested in
	var id = urlObject.attr("anchor");

	if(id !== undefined) {
		selectedLog = parseInt(id);
	}

	// TODO: What to to with Olog settings if window resizes?
	$(window).resize(function(e){
		var windowWidth = $(window).width();

		if($.cookie(settingsCookieName) !== undefined) {
			$.removeCookie(settingsCookieName);
			window.location.reload();
		}
	});

	// Hide Logbooks for small screens
	$('#load_logbooks').on('dataloaded', function(e){
		if($(window).width() < smallScreenResolutionWidth) {
			$('#load_logbooks li').toggle();
			toggleChevron("#load_logbooks_chevron");
		}
	});

	// Hide Tags for small screens
	$('#load_tags').on('dataloaded', function(e){
		if($(window).width() < smallScreenResolutionWidth) {
			$('#load_tags li').toggle();
			toggleChevron("#load_tags_chevron");
		}
	});

	// Hide time filter from
	$('#load_time_from').on('dataloaded', function(e){
		if($(window).width() < smallScreenResolutionWidth) {
			$("#load_time_from").find('li:gt(0)').toggle();
			toggleChevron("#load_from_chevron");
		}
	});

	// If Olog is opened on small screen resolution, close filters, disable
	// adding and editing.
	if($(window).width() < smallScreenResolutionWidth) {
		$("#load_time_from_to").find('li:gt(0)').toggle();
		toggleChevron("#load_from_to_chevron");
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
	var middleRightPane = ".container-middle-right";

	// Resize left and middle section
	$('.container-resize').draggable({axis: "x"});

	// Resize middle and right section
	$('.container-resize2').draggable({axis: "x"});

	var dims = null;

	var windowWidth = $(window).width();
	var minWidth = Math.round(windowWidth * 0.1);

	// If cookie is not set, create new dims object
	if($.cookie(settingsCookieName) === undefined) {
		l("new dims");

		dims = {
			left_pane_width: $(leftPane).width(),
			middle_pane_left: $(leftPane).width(),
			middle_pane_width: undefined,
			right_pane_left: undefined,
			right_pane_width: undefined,
			middle_right_pane_width: undefined
		};

		var remainingWidth = windowWidth - dims.left_pane_width;
		var remainingWidthHalf = Math.round(remainingWidth/2);

		// Set the rest of the sizes so we don't get into trouble
		if($(middlePane).doesExist()){
			var middlePaneWidth = $(middlePane).width();

			dims.middle_right_pane_width = windowWidth - dims.left_pane_width;
			dims.middle_pane_width = middlePaneWidth;
			dims.right_pane_width = windowWidth - dims.left_pane_width - middlePaneWidth;
			dims.right_pane_left = dims.left_pane_width + middlePaneWidth;

		} else {
			dims.middle_right_pane_width = remainingWidth;
			dims.middle_pane_width = remainingWidthHalf;
			dims.right_pane_width = windowWidth - dims.left_pane_width - remainingWidthHalf;
			dims.right_pane_left = dims.left_pane_width + remainingWidthHalf;
		}

	// If settings cookie is set, read and set the panes' dimensions
	} else {
		dims = JSON.parse($.cookie(settingsCookieName));
		l(dims);

		$(leftPane).width(dims.left_pane_width);
		$(middlePane).css({left: dims.middle_pane_left});
		$(middlePane).width(dims.middle_pane_width);
		$(rightPane).css({left: dims.right_pane_left});
		$(rightPane).width(dims.right_pane_width);
		$(middleRightPane).width(dims.middle_right_pane_width);

		$('.container-resize').css({left: dims.middle_pane_left});
		$('.container-resize2').css({left: dims.right_pane_left});
	}

	// Drag left resizer
	$('.container-resize').on('drag', function(e){
		l(dims);

		var oldWidth = $(leftPane).width();
		var oldWidth2 = $(middleRightPane).width();

		// Limit the minimal width of the left pane
		if(oldWidth < minWidth && e.pageX < dims.left_pane_width) {
			return;
		}

		// Limit the minimal width of the middle pane
		if(dims.middle_pane_width < minWidth && e.pageX > dims.middle_pane_left) {
			return;
		}

		// Limit the minimal width of the middle right pane
		if(dims.middle_right_pane_width < minWidth && e.pageX > dims.middle_pane_left || e.pageX > dims.right_pane_left - minWidth) {
			return;
		}

		var diff = oldWidth - e.pageX;
		var diff2 = windowWidth - e.pageX - oldWidth2;

		$(leftPane).width(e.pageX);
		dims.left_pane_width = e.pageX;

		$(middlePane).css({left: e.pageX});
		$(middleRightPane).css({left: e.pageX});
		dims.middle_pane_left = e.pageX;

		// If middle pane exists, repair its width
		if($(middlePane).doesExist()){
			$(middlePane).width($(middlePane).width() + diff);
			dims.middle_pane_width = $(middlePane).width() + diff;

		// If we are resizing in modify or add new view, we must also repair middle_pane width or it will
		// be moved below the right pane
		} else {
			$(middlePane).width(dims.middle_pane_width + diff2);
			dims.middle_pane_width += diff;
		}

		$(middleRightPane).width(windowWidth - dims.left_pane_width);
		dims.middle_right_pane_width = windowWidth - dims.left_pane_width;

		$.cookie(settingsCookieName, JSON.stringify(dims));
	});

	// Stop dragging left resizer
	$('.container-resize').on('dragstop', function(e){
		$('.container-resize').css({left: dims.left_pane_width});
	});

	// Drag right resizer
	$('.container-resize2').on('drag', function(e){
		l(dims);

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

		$.cookie(settingsCookieName, JSON.stringify(dims));
	});

	// Stop dragging left resizer
	$('.container-resize2').on('dragstop', function(e){
		$('.container-resize2').css({left: dims.right_pane_left});
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

	// Disable adding new log
	$('#new_log').addClass("disabled");
	$('#new_log').attr("disabled", true);
	$('#new_logbook_and_tag').addClass("disabled");
	$('#new_logbook_and_tag').attr("disabled", true);
	$('#modify_log_link').hide();
}

/**
 * Enable creating Logs, Logbooks, Tags and modifying them only if screen width
 * is greater than smallScreenResolutionWidth constant.
 */
function enableCreatingAndModifying() {
	l("window width: " + $(window).width());

	if($(window).width() > smallScreenResolutionWidth) {
		$('#new_log').removeClass("disabled");
		$('#new_log').attr("disabled", false);
		$('#new_logbook_and_tag').removeClass("disabled");
		$('#new_logbook_and_tag').attr("disabled", false);

	} else {
		disableCreatingNewAndModifying();
	}
}