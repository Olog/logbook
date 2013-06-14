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
			}

			selectedElements[name].push($(e.target).text());
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