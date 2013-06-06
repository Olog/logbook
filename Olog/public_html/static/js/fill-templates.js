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