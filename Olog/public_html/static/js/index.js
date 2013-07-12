/*
 * Functions specific to index.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){

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

	// Creante new Log
	$('#new_log').click(function(e){
		window.location.href = "new_log.html";
	});

	// Load Logbooks
	loadLogbooks("load_logbooks");

	// Load Tags
	loadTags("load_tags");

	// Load created from filter items
	loadCreatedFromFilters();

	// If selected elements are refined, make apropriate search query else load last X logs
	if(selectedElements !== undefined && (selectedElements['list'] !== undefined || selectedElements['list2'] !== undefined)) {
		// search logs
		generateSearchQuery(selectedElements);

	}else {
		// Load logs
		loadLogs(1);
	}

	// Load created from filters
	singleselect("list3");

	// Load created to filters
	singleselect("list4");

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
		var html = Mustache.to_html(template, {"user": "User"});
		$('#top_container').html(html);
		login();

		// Disable adding new log
		$('#new_log').addClass("disabled");
		$('#new_log').attr("disabled", true);
		$('#new_logbook_and_tag').addClass("disabled");
		$('#new_logbook_and_tag').attr("disabled", true);
		$('#modify_log_link').hide();

	// If user is not signed in, show sign out link
	} else {
		var credentials = getUserCreadentials();

		// Set user and sign out link
		var template = getTemplate('template_logged_in');
		var html = Mustache.to_html(template, {"user": firstLetterToUppercase(credentials["username"])});
		$('#top_container').html(html);

		// Enable adding new Log, Logbook and Tag
		$('#new_log').removeClass("disabled");
		$('#new_log').attr("disabled", false);
		$('#new_logbook_and_tag').removeClass("disabled");
		$('#new_logbook_and_tag').attr("disabled", false);
	}


	// Show log if it we have an URL
	if(selectedLog !== -1 && !isNaN(selectedLog)) {
		var log = getLog(selectedLog);

		if(log[0] !== null) {
			showLog(log[0], log[1]);

		} else {
			selectedLog = -1;
		}
	}

	// Activate resize manager
	resizeManager();
});

/**
 * Load created from filters from user configurable array ob objects
 */
function loadCreatedFromFilters() {
	var template = getTemplate("template_created_from");
	var html = "";

	// Write data from cookie back to object and remove cookie
	if($.cookie(filtersCookieName) !== undefined){
		selectedElements = $.parseJSON($.cookie(filtersCookieName));
	}

	$.each(createdFromFilterDefinition, function(index, filter){

		if(selectedElements !== undefined && selectedElements['from'] !== undefined && filter.value === selectedElements['from']) {
			filter.selected = "multilist_clicked";

		} else {
			filter.selected = "";
		}

		html = Mustache.to_html(template, filter);
		$('#load_time_from').append(html);
	});
}