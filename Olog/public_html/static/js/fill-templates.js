/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function(){
	// Load logs
	var template = $('#template_log').html();
	var html = "";
	
	for(i=0; i<10; i++){
		
		var log = {
			body: "sdfs dfsdf sdfsd sf <html> " + i
		};
		
		html = Mustache.to_html(template, log);
	
		$('#load_logs').append(html);
	}
});

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