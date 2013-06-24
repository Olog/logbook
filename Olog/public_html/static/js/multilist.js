/*
 * Javascript multiselection list module.
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

var selectedElements = {};

/**
 * Function will create onclick event listener for mulstiselection list with specific name
 * @param {type} name
 * @returns {undefined}
 */
function multiselect(name){

	// Write data from cookie back to object and remove cookie
	if($.cookie(filtersCookieName) !== undefined){
		selectedElements = $.parseJSON($.cookie(filtersCookieName));
		//$.removeCookie(filtersCookieName);
	}

	$('.' + name).hover(function(e){
		$(e.target).find(".multilist_icons").show("fast");
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

			// Set the element index
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

	$('.' + name).click(function(e){
		if($(e.target).is("input")){
			return;
		}

		$('.' + name).removeClass("multilist_clicked");

		$(e.target).addClass("multilist_clicked");
	});
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

		actionElement.toggleClass("log_click");
		var log = getLog(actionElement.find("input[name=id]").val());
		showLog(log[0], log[1]);
	});
}