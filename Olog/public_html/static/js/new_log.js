/* 
 * Script specific to edit_log.html
 * 
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */


$(document).ready(function(){
	$(".tm-input").tagsManager({
		typeahead: true,
		typeaheadSource: returnTags()
	});
});

function returnTags(){
	return ["Pisa", "Rome", "Milan", "Florence", "New York", "Paris", "Berlin", "London", "Madrid"];
}