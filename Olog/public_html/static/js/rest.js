/* 
 * Load tada on dom ready
 */

$(document).ready(function(){
	
	// Load Logbooks
	$.getJSON(serviceurl + 'logbooks/', function(books) {
		repeat("template_logbook", "load_logbooks", books, "logbook");
		multiselect("list");
	});
	
	// Load tags
	$.getJSON(serviceurl + 'tags/', function(tags) {
		repeat("template_tag", "load_tags", tags, "tag");
		multiselect("list2");
	});
});