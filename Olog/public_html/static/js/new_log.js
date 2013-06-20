/*
 * Script specific to edit_log.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */


$(document).ready(function(){

	jQuery.expr[':'].Contains = function(a, i, m){
		return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
	};

	/**
	 * Disable closing the login dropdown if user clicks on login form elements
	 */
	// Setup drop down menu
	$('.dropdown-toggle').dropdown();
	// Fix input element click problem
	$('.dropdown-menu form').click(function(e) {
		e.stopPropagation();
	});

	$('#new_log').click(function(e){
		window.location.href = "new_log.html";
	});

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
			$("#tags_input").tagsManager('pushTag',element)
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
			$("#logbooks_input").tagsManager('pushTag',element)
		});
	});

	// Add upload field
	addAttachmentField();

	$('#add_attachment').click(function(e){
		addAttachmentField();
	});

	$('#createForm').on('submit', function(e){
		e.preventDefault();
		createLog();
	})
});

function addAttachmentField(){
	var template = getTemplate("template_new_add_attachment");

	var addAtachment = {};

	var html = Mustache.to_html(template, addAtachment);
	$('#list_add_attachments').append(html);

	$('.new_attachment').unbind("change");
	$('.new_attachment').on("change", function(e){
		alert($(e.target).val());
	});
}

function autocompleteTags(tagsArray){
	var selectedTagsArray = [];

	if($.cookie(filtersCookieName) !== undefined){
		selectedTagsArray = $.parseJSON($.cookie(filtersCookieName))["list2"];
	}
	initiateAutocompleteInput("tags_input", selectedTagsArray, tagsArray);
}

function autocompleteLogbooks(logbooksArray){
	var selectedLogbooksArray = [];

	if($.cookie(filtersCookieName) !== undefined){
		selectedLogbooksArray = $.parseJSON($.cookie(filtersCookieName))["list"];
	}
	initiateAutocompleteInput("logbooks_input", selectedLogbooksArray, logbooksArray);
}

function initiateAutocompleteInput(targetId, preselectedArray, dataArray) {
	$("#" + targetId).tagsManager({
		prefilled: preselectedArray,
		typeahead: true,
		typeaheadSource: dataArray,
		onlyTagList: true
	});
}