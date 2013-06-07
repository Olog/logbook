/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 * 
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

 $(function() {
	// Setup drop down menu
	$('.dropdown-toggle').dropdown();
	// Fix input element click problem
	$('.dropdown-menu form').click(function(e) {
		e.stopPropagation();
	});
});

function showEditLogbookModal(modalId, name){
	$('#' + modalId + ' [name=name]').val(name);
	$('#' + modalId + ' [name=owner]').val("boss");
	
	$('#' + modalId).modal('toggle');
}

function showEditTagModal(modalId, name){
	$('#' + modalId + ' [name=name]').val(name);
	
	$('#' + modalId).modal('toggle');
}

function showDeleteModal(modalId, name){
	$('#' + modalId + ' [name=id]').val(name);
	
	$('#' + modalId).modal('toggle');
}

function returnFirstXWords(string, count){
	var words = string.split(" ");
	var summary = "";
	var append = "";
	
	if (count > words.length) {
		count = words.length;
	
	} else {
		append = " ...";
	}
	
	if(words.length > 0){
		summary = words[0];
		
		if(words.length > 1){
			for(i=1; i<count; i++) {
				summary += " " + words[i];
			}
		}
		return summary + append;
		
	}else {
		return summary;
	}
	
}

function startListeningForLogClicks(){
	$(".log").click(function(e){
		
		if($(e.target).is("div")){
			getLog($(e.target).find("input[name=id]").val());
		
		}else if($(e.target).parent().is("div")){
			getLog($(e.target).parent().find("input[name=id]").val());
		}
	});
}

function formatDate(input){
	var day = moment(input);
	var formatedDate = day.format(dateFormat);
	return formatedDate;
}