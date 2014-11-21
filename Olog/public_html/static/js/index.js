/*
 * Functions specific to index.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

var check;

$(document).ready(function(){

	// Activate resize manager
	resizeManager();

	// Set datepickers
	$('#datepicker_from').datetimepicker(
		{
			changeMonth: true,
			changeYear: true,
			dateFormat: datePickerDateFormat,
			firstDay: datePickerFirstName,
			onClose: function(e){
				fromToChanged();
			}
		}
	);

	$('#datepicker_to').datetimepicker(
		{
			changeMonth: true,
			changeYear: true,
			dateFormat: datePickerDateFormat,
			firstDay: datePickerFirstName,
			onClose: function(e){
				fromToChanged();
			}
		}
	);

	// Select include hostory
	$('#search-checkbox').prop('checked', ologSettings.includeHistory);

	// Listen to include history chenckbox change
	$('#search-checkbox').unbind('change');
	$('#search-checkbox').on('change', function(e) {
		ologSettings.includeHistory = $(e.target).prop('checked');
		$('#search-order-block').toggle();
		saveOlogSettingsData(ologSettings);
	});

	// Show log order flag
	if(ologSettings.includeHistory) {
		$('#search-order-block').show();

		// Select include hostory
		$('#search-order').prop('checked', ologSettings.logVersionOrder);

		// Listen to change of log entry order
		$('#search-order').unbind('change');
		$('#search-order').on('change', function(e) {
			ologSettings.logVersionOrder = $(e.target).prop('checked');
			saveOlogSettingsData(ologSettings);
		});

	// Do not show log order flag
	} else {
		$('#search-order-block').hide();
	}

	// Creante new Log
	$('#new_log').click(function(e){
		window.location.href = "new_log.html";
	});

	// Load Logbooks
	loadLogbooks("load_logbooks", true, true, true);

	// Open Logbooks
	if(ologSettings.filtersOpened === undefined) {
		ologSettings.filtersOpened = {};
		ologSettings.filtersOpened['load_logbooks'] = true;
	}

	// Load Tags
	loadTags("load_tags", false, true, true);

	// Load created from filter items
	loadCreatedFromFilters();

	// If selected elements are refined, make apropriate search query else load last X logs
	if(selectedElements !== undefined && (selectedElements['list'] !== undefined || selectedElements['list2'] !== undefined)) {
		// search logs
		generateSearchQuery(selectedElements);

	}else {
		// Load logs
		loadLogs(1, false);
	}

	// Load created from filters
	singleselect("list3");

	// Load created from - to filters
	singleselect("list5");

	// Activate search field
	startListeningForSearchEvents();

	// Activate mechanism for automatically loading new logs
	loadLogsAutomatically();

	// Check if user is logged in and act accordingly
	if(getUserCreadentials() === null) {

		// Show sign in form
		var template = getTemplate('template_logged_out');
		var html = Mustache.to_html(template, {"user": "Guest"});
		$('#top_container').html(html);
		login();
		disableCreatingNewAndModifying();

	// If user is not signed in, show sign out link
	} else {
		var credentials = getUserCreadentials();

		// Set user and sign out link
		var template = getTemplate('template_logged_in');
		var html = Mustache.to_html(template, {"user": firstLetterToUppercase(credentials["username"])});
		$('#top_container').html(html);
		enableCreatingAndModifying();
	}

	// Show log if it we have an URL
	if(selectedLog !== "") {
		l(selectedLog);
		var log = getLog(selectedLog);

		if(log[0] !== null) {
			showLog(log[0], log[1]);

		} else {
			selectedLog = "";
		}
	}

	// Set refresh interval if updateInterval is set to value that is greater
	// than 0 and if we are not on a small screen
	if(updateInterval > 0 && $(window).width() > smallScreenResolutionWidth) {
		check = setInterval(checkForNewLogs, updateInterval * 1000);
	}

	// Check if there is someting in the search button and show/hide clean icon
	showHideSearchCleanButton($('#search-query'));

	// Handle go to top button
	$('#back_to_top_button').click(function(e){
		var id = $.url().attr("anchor");
		l("id = " + id);

		// If no Log entry is selected, go to the top
		if(id === "" || id === "top") {
			window.location.href = firstPageName + "#top";

		} else {
			var element = $('input[value=' + id + ']');
			l(element.offset().top);

			$('html, body').animate({
				scrollTop: element.parent().offset().top
			}, 100);
		}
	});

	$('#search-query').unbind("keyup");
	$('#search-query').bind("keyup", function(event) {
		// Check if input is empty. If it is empty hide clean button,
		// if it is not, show clean button
		showHideSearchCleanButton($(event.target));
	});
});

/**
 * Check for new Log entries and load them if there are any.
 */
function checkForNewLogs() {
	l("check new");

	if(!$.isEmptyObject(savedLogs) && $.url(searchURL).param('end') === undefined) {
		var searchLog = $("#load_logs").children().first();
		var firstLogId = $($("#load_logs").children()[1]).find('input').val();
		l("First log id " + firstLogId);

		if(savedLogs[firstLogId] === undefined) {
			return;
		}

		var lastLogSeconds = Math.round(savedLogs[firstLogId].createdDate/1000) + 1;
		var currentSeconds = Math.round((new Date().getTime())/1000);
		var searchQuery = "";

		// Generate a search query
		if(searchURL === "") {
			searchQuery = "page=1&limit=" + numberOfLogsPerLoad + '&start=' + lastLogSeconds + '&end=' + currentSeconds;

		} else {
			var queryString = $.url(searchURL).param();

			// Parse current query and generate a new one
			for(querykey in queryString){

				if(querykey === "limit") {
					queryString[querykey] = numberOfLogsPerLoad;

				} else if(querykey === "start") {
					queryString[querykey] = lastLogSeconds;

				} else if(querykey === "end") {
					queryString[querykey] = currentSeconds;

				} else if(querykey === "page") {
					queryString[querykey] = "1";
				}

				searchQuery += querykey + "=" + queryString[querykey] + "&";
			}

			// Add start to the search query if it does not exist
			if($.url(searchURL).param('start') === undefined) {
				searchQuery += 'start=' + lastLogSeconds + '&';
			}

			// Add end tothe search query if it does not exist
			if($.url(searchURL).param('end') === undefined) {
				searchQuery += 'end=' + currentSeconds + '&';
			}
		}

		l("check: " + searchQuery);

		$.getJSON(serviceurl + "logs?" + searchQuery, function(logs) {
			l("found: " + logs.length);
			repeatLogs(logs, true);
			startListeningForLogClicks();
			$("#load_logs").prepend(searchLog);
		});
	}
}

/**
 * Show or hide search clean button according to search input content length
 * @param {DOMelement} el html element
 */
function showHideSearchCleanButton(el) {

	if(el.val().length < 1) {
		$('#search-query-clean').css('z-index', '-1');

	} else {
		$('#search-query-clean').css('z-index', '2');
	}
}

/**
 * Load created from filters from user configurable array ob objects
 */
function loadCreatedFromFilters() {
	var template = getTemplate("template_created_from");
	var html = "";

	$.each(createdFromFilterDefinition, function(index, filter){

		// Alternate background colors
		if(index%2 === 0) {
			filter.color = "log_dark";

		} else {
			filter.color = "log_light";
		}

		if(selectedElements !== undefined &&
			selectedElements['from'] !== undefined &&
			filter.value === selectedElements['from'] &&
			(
				selectedElements['to'] === undefined ||
				selectedElements['to'] === ""
			)
		) {
			filter.selected = "multilist_clicked";
			filter.show = "";

		} else {
			filter.selected = "";
			filter.show = "display_none";
		}

		html = Mustache.to_html(template, filter);
		$('#load_time_from').append(html);
	});

	$('#load_time_from').trigger('dataloaded');

	// Select from-to filter
	if(
		selectedElements['from'] !== undefined &&
		selectedElements['from'] !== "" &&
		selectedElements['to'] !== undefined &&
		selectedElements['to'] !== ""
	) {
		$('#from_to_filter').addClass('multilist_clicked');
		$('#from_to_filter_li').removeClass('display_none');
		$('#datepicker_from').val(selectedElements['from']);
		$('#datepicker_to').val(selectedElements['to']);

	} else {
		$('#from_to_filter').removeClass('multilist_clicked');
	}

	// Open or close time from filter group
	if(ologSettings.filtersOpened !== undefined && ologSettings.filtersOpened['load_time_from'] === true) {
		openFilterGroup($('#load_time_from'));

	} else {
		closeFilterGroup($('#load_time_from'));
	}

	// Open or close time from-to filter group
	if(ologSettings.filtersOpened !== undefined && ologSettings.filtersOpened['load_time_from_to'] === true) {
		openFilterGroup($('#load_time_from_to'));

	} else {
		closeFilterGroup($('#load_time_from_to'));
	}
}