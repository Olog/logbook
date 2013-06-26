/*
 * Script specific to edit_log.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

$(document).ready(function(){

	// Load Logbooks
	loadLogbooks();

	// Load Tags
	loadTags();

	// Wait for dataload
	$('#load_tags').on('dataloaded', function(e){
		autocompleteTags(savedTags);
	});

	// Wait for dataselected
	$('#load_tags').on('dataselected', function(e, data){

		$("#tags_input").tagsManager('empty');

		$.each(data['list2'], function(i, element){
			$("#tags_input").tagsManager('pushTag',element);
		});
	});

	// Wait for dataload
	$('#load_logbooks').on('dataloaded', function(e){
		autocompleteLogbooks(savedLogbooks);
	});

	// Wait for dataselected
	$('#load_logbooks').on('dataselected', function(e, data){

		$("#logbooks_input").tagsManager('empty');

		$.each(data['list'], function(i, element){
			$("#logbooks_input").tagsManager('pushTag',element);
		});
	});

	// Listen for new Log form submit
	$('#createForm').on('submit', function(e){
		e.preventDefault();

		var log = generateLogObject();

		if(isValidLog(log) === true) {
			createLog(log);
		}
	});

	// Load levels
	var template = getTemplate('template_level_input');
	$('#level_input').html("");

	$.each(levels, function(index, name) {
		var html = Mustache.to_html(template, {"name": name, "selected":""});
		$('#level_input').append(html);
	});

	initialize();
});