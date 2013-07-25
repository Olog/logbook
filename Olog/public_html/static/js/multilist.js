/*
 * Javascript multiselection and singleselection list module.
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

// Selected filter elements are saved into an object
var selectedElements = {};

// Because number of logs per load is change in the process,
// we must save the old value in a variable
var oldLogsPerLoad = numberOfLogsPerLoad;

// Do we want to limit rest results count
var limit = true;

/**
 * Function will create onclick event listener for mulstiselection list with specific name
 * @param {type} name
 */
function multiselect(name){
	limit = true;
	numberOfLogsPerLoad = oldLogsPerLoad;

	// Write data from cookie back to object and remove cookie
	if($.cookie(filtersCookieName) !== undefined){
		selectedElements = $.parseJSON($.cookie(filtersCookieName));
	}

	// Change color on hover
	$('.' + name).hover(function(e){
		if($.cookie(sessionCookieName) !== undefined) {
			$(e.target).find(".multilist_icons").show("fast");
		}
	});

	// Restore color when mouse laves the element
	$('.' + name).mouseleave(function(e){
		$(e.target).find(".multilist_icons").hide("fast");
	});

	// Listen for clicks on elements
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

			// Add element among selected elements
			if(clicked === false) {
				$(e.target).addClass("multilist_clicked");
				selectedElements[name + '_index'][$(e.target).text()] = "true";
				selectedElements[name].push($(e.target).text());

			// Remove elements from selected elements
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
 * @param {type} id id od the input element
 * @param {type} name type of the filter (logbooks or tags)
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
 * @param {type} name container element class name that will hold singleselect filter
 */
function singleselect(name){
	limit = true;
	numberOfLogsPerLoad = oldLogsPerLoad;

	// Listen for clicks
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

		// If list3 is selected, remove "to" value
		if(name === "list3") {
			selectedElements['to'] = "";
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

		// If element is not clicked set to and from
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

		// If element is clicked clear to and from
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
 * User can expand or collapse filters so they are not in a way.
 * When he clicks on an arrow, filters display should toggle.
 * @returns {undefined}
 */
function startListeningForToggleFilterClicks() {

	$('.toggle-filters').unbind('click');
	$('.toggle-filters').click(function(e){
		l($(e.target).next().next());
		$(e.target).next().next().find('li').toggle();

		toggleChevron(e.target);
	});

	$('.toggle-from').unbind('click');
	$('.toggle-from').click(function(e){
		l($(e.target).parent().parent());
		$(e.target).parent().parent().find('li:gt(0)').toggle();

		toggleChevron(e.target);
	});
}

/**
 * Toggle chevron on an element
 * @param {type} element element that contains chevron
 */
function toggleChevron(element) {
	if($(element).hasClass('icon-chevron-down')) {
		$(element).removeClass('icon-chevron-down');
		$(element).addClass('icon-chevron-right');

	} else {
		$(element).removeClass('icon-chevron-right');
		$(element).addClass('icon-chevron-down');
	}
}