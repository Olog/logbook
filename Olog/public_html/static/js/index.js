/*
 * Script specific to index.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){

	// Set datepickers
	$('#datepicker_from').datepicker(
		{
			changeMonth: true,
			changeYear: true,
			dateFormat: datePickerDateFormat,
			firstDay: datePickerFirstName
		}
	);
	$('#datepicker_to').datepicker(
		{
			changeMonth: true,
			changeYear: true,
			dateFormat: datePickerDateFormat,
			firstDay: datePickerFirstName
		}
	);

	// Show log if it we have an URL
	if(selectedLog !== -1 && !isNaN(selectedLog)) {
		//l(selectedLog);
		var log = getLog(selectedLog);
		//l(log);

		if(log[0] !== null) {
			showLog(log[0], log[1]);

		} else {
			selectedLog = -1;
		}
	}

	jQuery.expr[':'].Contains = function(a, i, m){
		return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
	};

	$('#new_log').click(function(e){
		window.location.href = "new_log.html";
	});

	// Load Logbooks
	loadLogbooks();

	// Load Tags
	loadTags();

	// Load logs
	loadLogs(1);

	// Load the list of time filters
	singleselect("list3");
	singleselect("list4");
	singleselect("list5");

	// Wait for date from-to change
	$('#datepicker_from').change(function(e){
		fromToChanged();
	});

	// Wait for date from-to change
	$('#datepicker_to').change(function(e){
		fromToChanged();
	});

	// Activate search field
	startListeningForSearchEvents();

	// Activate mechanism for automatically loading new logs
	loadLogsAutomatically();

	// Check if user is logged in and act accordingly
	if(getUserCreadentials() === null) {
		var template = getTemplate('template_logged_out');
		var html = Mustache.to_html(template, {"user": "User"});
		$('#top_container').html(html);
		login();

		$('#new_log').addClass("disabled");
		$('#new_log').attr("disabled", true);
		$('#new_logbook_and_tag').addClass("disabled");
		$('#new_logbook_and_tag').attr("disabled", true);
		$('#modify_log_link').hide();

	} else {
		var credentials = getUserCreadentials();

		var template = getTemplate('template_logged_in');
		var html = Mustache.to_html(template, {"user": firstLetterToUppercase(credentials["username"])});
		$('#top_container').html(html);

		$('#new_log').removeClass("disabled");
		$('#new_log').attr("disabled", false);
		$('#new_logbook_and_tag').removeClass("disabled");
		$('#new_logbook_and_tag').attr("disabled", false);
	}
});