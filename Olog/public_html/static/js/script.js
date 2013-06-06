/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

 $(function() {
	// Setup drop down menu
	$('.dropdown-toggle').dropdown();
	// Fix input element click problem
	$('.dropdown-menu form').click(function(e) {
		e.stopPropagation();
	});
});