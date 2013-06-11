/* 
 * Javascript multiselection list module.
 * 
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */
/*$(document).ready(function(){

	multiselect("list");
	multiselect("list2");

});*/

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
			}

			$(e.target).addClass("multilist_clicked");
		}
	});
}

function singleselect(name){
	
	$('.' + name).click(function(e){
		if($(e.target).is("input")){
			return;
		}
		
		$('.' + name).removeClass("multilist_clicked");
		
		$(e.target).addClass("multilist_clicked");
	});
}