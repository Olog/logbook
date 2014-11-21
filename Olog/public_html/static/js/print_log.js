/*
 * Javascript functions for displaying log in print view
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 * @created: 2014-11-17
 */

$(document).ready(function(){
	var urlObject = $.url();
	var id = urlObject.param("id");

	if(id !== undefined) {
		var log = getLog(id);

		if(log[0] !== null) {
			$('#log_id').html(log[1].split('_')[0]);
			$('#log_version').html(log[1].split('_')[1]);
			$('#date_printed').html(new Date());
			showLog(log[0], log[1]);
			l(log[0]);
			window.print();
		}
	}
});