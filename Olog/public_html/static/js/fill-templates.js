/* 
 * Fill templates with data got from REST service
 * 
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

/*$(document).ready(function(){
	// Load logs
	var template = $('#template_log').html();
	var html = "";
	
	for(i=0; i<10; i++){
		
		var log = {
			user: "dejan",
			date: "6.6.2013",
			body: "sdfs dfsdf sdfsd sf <html> " + i
		};
		
		html = Mustache.to_html(template, log);
	
		$('#load_logs').append(html);
	}
});*/

// Create object for saving logs
var savedLogs = {};

/**
 * Repeat function that can load a list of various data
 * @param {type} source_id id attribute of template tag
 * @param {type} target_id id attribute of container tag (where data will be placed)
 * @param {type} data data in JSON format
 * @param {type} property data.property object
 * @returns replaces template with data and puts it in the right place
 */
function repeat(source_id, target_id, data, property){
	var template = $('#'+source_id).html();
	var html = "";
	
	$.each(data[property], function(i, item) {
		html = Mustache.to_html(template, item);
	
		$('#'+target_id).append(html);
	});
}

/**
 * Show logs in the middle section. Some of the data must be formated to be shown properly
 * @param {type} source_id id attribute of template tag
 * @param {type} target_id id attribute of container tag (where data will be placed)
 * @param {type} data data in JSON format
 * @returns replaces template with data and puts it in the right place
 */
function repeatLogs(source_id, target_id, data){
	var template = $('#'+source_id).html();
	var html = "";
	
	$.each(data, function(i, item) {
		savedLogs[item.id] = item;
		
		var newItem = {
			description: returnFirstXWords(item.description, 40),
			owner: item.owner,
			createdDate: formatDate(item.createdDate),
			id: item.id
		};
		
		html = Mustache.to_html(template, newItem);
	
		$('#'+target_id).append(html);
	});
}