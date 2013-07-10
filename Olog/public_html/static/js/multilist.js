/*
 * Javascript multiselection list module.
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

var selectedElements = {};
var oldLogsPerLoad = numberOfLogsPerLoad;
var limit = true;

/**
 * Function will create onclick event listener for mulstiselection list with specific name
 * @param {type} name
 * @returns {undefined}
 */
function multiselect(name){
	limit = true;
	numberOfLogsPerLoad = oldLogsPerLoad;

	// Write data from cookie back to object and remove cookie
	if($.cookie(filtersCookieName) !== undefined){
		selectedElements = $.parseJSON($.cookie(filtersCookieName));
	}

	$('.' + name).hover(function(e){
		if($.cookie(sessionCookieName) !== undefined) {
			$(e.target).find(".multilist_icons").show("fast");
		}
	});

	$('.' + name).mouseleave(function(e){
		$(e.target).find(".multilist_icons").hide("fast");
	});

	$('.' + name).click(function(e){
		var clicked = false;

		if($(e.target).is("span")){

			// Check if filter is selected
			if($(e.target).hasClass("multilist_clicked")) {
				clicked = true;
			}

			if(!e.ctrlKey){
				$('.' + name).removeClass("multilist_clicked");
				selectedElements[name] = [];
				selectedElements[name + '_index'] = {};
			}

			// Initialize the element index
			if(selectedElements[name + '_index'] === null) {
				selectedElements[name + '_index'] = {};
			}

			if(clicked === false) {
				$(e.target).addClass("multilist_clicked");
				selectedElements[name + '_index'][$(e.target).text()] = "true";
				selectedElements[name].push($(e.target).text());

			} else {
				$(e.target).removeClass("multilist_clicked");
				selectedElements[name + '_index'][$(e.target).text()] = "false";
				removeDeselectedFilter(name, $(e.target).text());
			}

			// Trigger event and set cookie with data
			$(e.target).parent().unbind('dataselected');
			$(e.target).parent().trigger('dataselected', selectedElements);
			$.cookie(filtersCookieName, JSON.stringify(selectedElements));
		}
	});
}

/**
 * Find deselected element and remove it from the list of selected elements
 * @param {type} name name of the array (tags or logbooks)
 * @param {type} element element to be deleted
 */
function removeDeselectedFilter(name, element) {
	for(i=0; i<selectedElements[name].length; i++){

		if(selectedElements[name][i] === element) {
			selectedElements[name].splice(i, 1);
		}
	}
}

/**
 *
 * @param {type} id
 * @param {type} name
 * @returns {undefined}
 */
function filterListItems(id, name){

	$('#' + id).unbind('keyup');
	$('#' + id).keyup(function(e){
		var filter = $(e.target).val();
		$('.multilist').find('.' + name + ':not(:Contains(' + filter + '))').parent().slideUp();
		$('.multilist').find('.' + name + ':Contains(' + filter + ')').parent().slideDown();
	});
}

/**
 * Function will create onclick event listener for singleselection list with specific name
 * @param {type} name
 * @returns {undefined}
 */
function singleselect(name){
	limit = true;
	numberOfLogsPerLoad = oldLogsPerLoad;

	$('.' + name).click(function(e){
		var clicked = false;

		if($(e.target).is("input")){
			return;
		}

		if($(e.target).hasClass("multilist_clicked")) {
			clicked = true;
		}

		$('.' + name).removeClass("multilist_clicked");

		// If list5 is clicked, list3 and list4 should be deselected
		if(name === "list5") {
			$('.list3').removeClass("multilist_clicked");
			$('.list4').removeClass("multilist_clicked");
		}

		// If list3 or list4 is clicked, lis5 should be deselected and value
		// in the global object deleted
		if(name === "list3" || name === "list4") {
			$('.list5').removeClass("multilist_clicked");
		}

		var from = $(e.target).find('input[name=from]').val();
		var to = $(e.target).find('input[name=to]').val();

		// Get datepicker from
		var datepickerFrom = $(e.target).find('#datepicker_from').val();
		l(datepickerFrom + from);

		if(datepickerFrom !== undefined && datepickerFrom !== "") {
			from = datepickerFrom;
		}

		// Get datepicker to
		var datepickerTo = $(e.target).find('#datepicker_to').val();
		l(datepickerTo + to);

		if(datepickerTo !== undefined && datepickerTo !== "") {
			to = datepickerTo;
		}

		// If element is not clicked
		if(clicked === false) {
			$(e.target).addClass("multilist_clicked");
			limit = false;
			numberOfLogsPerLoad = 1000;

			// Set from
			if(from !== undefined) {
				selectedElements['from'] = from;

			}

			// Set to
			if(to !== undefined) {
				selectedElements['to'] = to;
			}

		} else {
			selectedElements['from'] = "";
			selectedElements['to'] = "";
			limit = true;
			numberOfLogsPerLoad = oldLogsPerLoad;
		}

		// Trigger event and set cookie with data
		$(e.target).parent().unbind('dataselected');
		$(e.target).parent().trigger('dataselected', selectedElements);
		$.cookie(filtersCookieName, JSON.stringify(selectedElements));
	});
}

/**
 * If from and to dates are changed in the time filters, catch that event and save
 * data in the global object
 */
function fromToChanged() {
	// Get datepicker from
	var datepickerFrom = $('#datepicker_from').val();
	l(datepickerFrom);

	if(datepickerFrom !== undefined && datepickerFrom !== "") {
		selectedElements['from'] = datepickerFrom;
	}

	// Get datepicker to
	var datepickerTo = $('#datepicker_to').val();
	l(datepickerTo);

	if(datepickerTo !== undefined && datepickerTo !== "") {
		selectedElements['to'] = datepickerTo;
	}

	// Trigger event and set cookie with data
	$('#datepicker_to').parent().unbind('dataselected');
	$('#datepicker_to').parent().trigger('dataselected', selectedElements);
	$.cookie(filtersCookieName, JSON.stringify(selectedElements));
}

/**
 * When logs are loaded onto the page, start listening for mouse clicks on them
 * @returns {undefined}
 */
function startListeningForLogClicks(){
	var actionElement = null;

	$('.log_show_details').unbind('click');
	$('.log_show_details').click(function(e){
		$('.log_details').toggle(400, 'swing');
	});

	$('.log').unbind('click');
	$(".log").click(function(e){
		$('.log').removeClass("log_click");

		if($(e.target).is("div")){
			actionElement = $(e.target);

		}else if($(e.target).parent().is("div")){
			actionElement = $(e.target).parent();
		}

		var id = actionElement.find('[name=id]').val();
		l(id);
		window.location.href = "#" + id;

		actionElement.toggleClass("log_click");
		var log = getLog(actionElement.find("input[name=id]").val());
		showLog(log[0], log[1]);
	});
}

/**
 * Scroll to the last log if user clicked on the time filter
 * @returns {undefined}
 */
function scrollToLastLog() {
	if(limit === false) {
		var container = $('#load_logs');
		var scrollTo = $('.log').last();

		if(scrollTo !== undefined && scrollTo.offset() !== undefined) {
			container.scrollTop(scrollTo.offset().top - container.offset().top + container.scrollTop());
		}
	}
}