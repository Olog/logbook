/* 
 * Javascript multiselection list module.
 * 
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */
$(document).ready(function(){

	multiselect("list");
	multiselect("list2");

});

/**
 * Function will create onclick event listener for mulstiselection list with specific name
 * @param {type} name
 * @returns {undefined}
 */
function multiselect(name){
	$('.' + name).click(function(e){

		if(!e.ctrlKey){
			$('.' + name).removeClass("multilist_clicked");
		}

		$(e.target).addClass("multilist_clicked");
	});
}