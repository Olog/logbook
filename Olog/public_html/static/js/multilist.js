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
		//selectedElements = $.parseJSON($.cookie(filtersCookieName));
		//$.removeCookie(filtersCookieName);
	}

	$('.' + name).hover(function(e){
		$(e.target).find(".multilist_icons").show("fast");
	});

	$('.' + name).mouseleave(function(e){
		$(e.target).find(".multilist_icons").hide("fast");
	});

	$('.' + name).click(function(e){

		if($(e.target).is("span")){
			if(!e.ctrlKey){
				$('.' + name).removeClass("multilist_clicked");
				selectedElements[name] = [];
				selectedElements[name + '_index'] = {};
			}

			selectedElements[name].push($(e.target).text());

			if(selectedElements[name + '_index'] === null) {
				selectedElements[name + '_index'] = {};
			}
			selectedElements[name + '_index'][$(e.target).text()] = "true";

			$(e.target).parent().unbind('dataselected');
			$(e.target).parent().trigger('dataselected', selectedElements);
			$.cookie(filtersCookieName, JSON.stringify(selectedElements));
			$(e.target).addClass("multilist_clicked");
		}
	});
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
			//getLog($(e.target).find("input[name=id]").val());

		}else if($(e.target).parent().is("div")){
			actionElement = $(e.target).parent();
			//getLog($(e.target).parent().find("input[name=id]").val());
		}

		actionElement.toggleClass("log_click");
		getLog(actionElement.find("input[name=id]").val());
	});
}