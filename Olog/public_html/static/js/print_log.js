/*
 * Javascript functions for displaying log in print view
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 * @created: 2014-11-17
 */

$(document).ready(function(){
	var urlObject = $.url();
    var id = urlObject.param("id");

    //If the user is viewing the log, no print popup
    var viewonly = urlObject.param("viewonly");

    //array of logs to print/view
	var toPrint = [];

	//If at least one log was found
	var logExists = false;

    if(id !== undefined) {

    	//check if id is an array
        if (id.indexOf(',') > -1)
        {
			//array of log ids to print
			toPrint = id.split(',');

        }else{

			//one log
			toPrint = [id];
		}

		var template = "";
        var item= "";
        var html = "";

        var printArea = $('#print_items_container').first();

        $.each(toPrint , function(index, logId) {

        	//get each log from the id
            var log = getLog(logId);

            if(log[0] !== null) {

            	//if the logs exists
            	logExists = true;

                template = getTemplate("print_log_template");

                item = {
                    logId: log[1].split('_')[0],
                    logVersion: log[1].split('_')[1],
                    datePrinted: new Date()
                };

                html = Mustache.to_html(template, item);

                printArea.append(html);

                showLog(log[0], log[1]);

                $('[unset-id="true"]').attr('id', '');

                l(log[0]);

            }
        });

        if(viewonly === undefined && logExists === true){
            window.print();
        }
	}
});