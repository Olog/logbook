/*
 * Load data on dom ready
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

// Create object for saving logs
var savedLogs = {};
var savedTags = new Array();
var savedLogbooks = new Array();
var page = 1;
var templateContent = "";

/**
 * Get Logbooks from REST service
 * @param targetId id of the element Logbooks will be placed in
 */
function loadLogbooks(targetId){
	$('#' + targetId).html("");

	// Load Logbooks
	$.getJSON(serviceurl + 'logbooks/', function(books) {
		repeat("template_logbook", targetId, books, "logbook");
		multiselect("list");
		filterListItems("logbooks_filter_search", "list");
	});
}

/**
 * Get Tags from REST service
 * @param targetId id of the element Tags will be placed in
 */
function loadTags(targetId){
	$('#' + targetId).html("");

	// Load tags
	$.getJSON(serviceurl + 'tags/', function(tags) {
		repeat("template_tag", targetId, tags, "tag");
		multiselect("list2");
		filterListItems("tags_filter_search", "list2");
	});
}

/**
 * Load Logs on the specific page from the rest service.
 * @param {type} page number of logs per page is defined in configuration, page number is increased when user scrolls down the list
 */
function loadLogs(page){
	// Remo all the logs if we are starting from the beginning
	if(page === 1){
		$(".log").remove();
	}

	var searchQuery = serviceurl + "logs?";

	// Generate a search query
	if(searchURL === "") {
		searchQuery = serviceurl + 'logs?limit=' + numberOfLogsPerLoad + '&page=' + page;

	} else {

		var queryString = $.url(searchURL).param();

		// Parse current query and generate a new one
		for(querykey in queryString){
			l(querykey);

			if(querykey === "limit") {
				queryString[querykey] = numberOfLogsPerLoad;

			} else if(querykey === "page") {
				queryString[querykey] = page;
			}
			searchQuery += querykey + "=" + queryString[querykey] + "&";
		}
	}

	// Save query to global var
	searchURL = searchQuery;

	//var searchQuery = serviceurl + 'logs?limit=' + numberOfLogsPerLoad + '&page=' + page;
	l(searchQuery);

	$.getJSON(searchQuery, function(logs) {
		$(".log-last").remove();
		repeatLogs("template_log", "load_logs", logs);
		appendAddMoreLog("load_logs");
		startListeningForLogClicks();
	});
}

/**
 * Load more logs when user scrolls to the ed of current Log list.
 */
function loadLogsAutomatically(){
	// Automatically load new logs when at the end of the page
	$('#load_logs').scroll(function(e){
		var scrollDiv = $('#load_logs');

		//console.log(scrollDiv.prop('scrollHeight') + " - " + scrollDiv.scrollTop() + " - " + scrollDiv.height());

		if(scrollDiv.prop('scrollHeight') - scrollDiv.scrollTop() <= scrollDiv.height()){
			page = page  + 1;
			console.log('increate to ' + page);
			loadLogs(page);
		}
	});
}

/**
 * Get log from json object or from REST if it does not exist.
 * @param {type} id log id
 */
function getLog(id){
	var logData = null;
	var logId = id;

	// Load log
	if(id in savedLogs){
		logData = savedLogs[id];

	} else {
		$.ajaxSetup({async:false});
		$.getJSON(serviceurl + 'logs/' + id, function(log) {
			savedLogs[id] = log;
			logData = log;
		});
		$.ajaxSetup({async:true});
	}

	return [logData, logId];
}

/**
 * Show log that was read from json object or from REST
 * @param {type} log log object
 * @param id id of the log in saved logs array
 */
function showLog(log, id){
	$('.container-right').show("fast");

	$("#log_description").html(log.description);
	$("#log_owner").html(log.owner);
	$("#log_date").html(formatDate(log.createdDate));
	$("#log_level").html(log.level);

	$("#modify_log_link").attr("href", "modify_log.html?id=" + id);

	// Show date edited
	if(log.createdDate !== log.modifiedDate){
		var template = getTemplate("template_log_details_edited");

		var item = {
			editedDate: formatDate(log.modifiedDate)
		};

		var html = Mustache.to_html(template, item);

		$('#log_details_edited').html(html);

	} else {
		$('#log_details_edited').html("");
	}

	// Load log logbooks
	$("#load_log_logbooks").html("");
	repeat("template_log_logbook", "load_log_logbooks", log, "logbooks");

	// Load log tags
	$("#load_log_tags").html("");

	if(log.tags.length !== 0){
		repeat("template_log_tag", "load_log_tags", log, "tags");
	}

	// Load attachments
	$('#load_log_attachments').html("");

	if(log.attachments.length !== 0){
		$('.log_attachments').show("fast");
		showAttachmentSizeDropdown(log.attachments, log.id);
		repeatAttachments("template_log_attachment", "load_log_attachments", log.attachments, log.id);

	} else {
		$('.log_attachments').hide("fast");
	}
}

/*
 * Show attachment size dropdown and set list items
 */
function showAttachmentSizeDropdown(attachments, id) {
	$('#attachments_size_dropdown').show("fast");

	var template = getTemplate("template_attachments_size_dropdown");
	var html = "";

	// Set current selected size
	if(imageSizes.current === -1) {
		imageSizes.current = imageSizes.default;
	}

	$('#attachments_size_dropdown ul').html("");

	$.each(imageSizes.list, function(index, item){

		var listItem = {
			name: item.name,
			active: ""
		};

		// Select current item
		if(index === imageSizes.current) {
			listItem.active = "class=active";
		}

		html = Mustache.to_html(template, listItem);
		$('#attachments_size_dropdown ul').append(html);
	});

	$('#attachments_size_dropdown ul li').unbind('click');
	$('#attachments_size_dropdown ul li').click(function(e){
		l($(e.target).text());
		imageSizes.current = backwardImageSizesMap[$(e.target).text()];
		repeatAttachments("template_log_attachment", "load_log_attachments", attachments, id);
		showAttachmentSizeDropdown(attachments, id);
	});
}

/**
 * Repeat function that can load a list of various data
 * @param {type} source_id id attribute of template tag
 * @param {type} target_id id attribute of container tag (where data will be placed)
 * @param {type} data data in JSON format
 * @param {type} property data.property object
 * @returns replaces template with data and puts it in the right place
 */
function repeat(source_id, target_id, data, property){
	var template = getTemplate(source_id);
	var html = "";

	$.each(data[property], function(i, item) {

		var customItem = item;
		customItem.clicked = "";

		if(property === "tag") {
			savedTags = savedTags.concat(item.name);

			// Check cookie content and select tags that need to be selected
			if($.cookie(filtersCookieName) !== undefined) {
				var obj = $.parseJSON($.cookie(filtersCookieName))["list2_index"];

				if(obj !== undefined && obj[item.name] !== undefined && obj[item.name] !== "false") {
					customItem.clicked = "multilist_clicked";
				}
			}

		} else if(property === "logbook") {
			savedLogbooks = savedLogbooks.concat(item.name);

			// Check cookie content and select tags that need to be selected
			if($.cookie(filtersCookieName) !== undefined) {
				var obj = $.parseJSON($.cookie(filtersCookieName))["list_index"];

				if(obj !== undefined && obj[item.name] !== undefined && obj[item.name] !== "false") {
					customItem.clicked = "multilist_clicked";
					customItem.owner = item.owner;
				}
			}
		}

		html = Mustache.to_html(template, customItem);

		$('#'+target_id).append(html);
	});

	$('#'+target_id).trigger('dataloaded');
}

/**
 * Show logs in the middle section. Some of the data must be formated to be shown properly
 * @param {type} source_id id attribute of template tag
 * @param {type} target_id id attribute of container tag (where data will be placed)
 * @param {type} data data in JSON format
 * @returns replaces template with data and puts it in the right place
 */
function repeatLogs(source_id, target_id, data){
	var template = getTemplate(source_id);
	var html = "";

	// Go through all the logs
	$.each(data, function(i, item) {
		savedLogs[item.id] = item;
		//console.log(JSON.stringify(item));

		// Build customized Log object
		var newItem = {
			description: returnFirstXWords(item.description, 40),
			owner: item.owner,
			createdDate: formatDate(item.createdDate),
			id: item.id,
			attachments : []
		};

		// Check if we have an URL and select selected Log
		if(selectedLog !== -1 && parseInt(item.id) === selectedLog) {
			newItem.click = "log_click";

		} else {
			newItem.click = "";
		}

		// Append attachments
		if(item.attachments.length !== 0){

			$.each(item.attachments, function(j, attachment) {

				// Skip non-image attachments
				if(!isImage(attachment.contentType)){
					return;
				}

				// Create custom attribute thumbnail object
				newItem.attachments.push(
					{imageUrl: serviceurl + "attachments/" + item.id + "/" + attachment.fileName + ":thumbnail"}
				);
			});
		}

		html = Mustache.to_html(template, newItem);

		$('#'+target_id).append(html);

	});
}

/*
 * Append the last log that enables us to load more logs
 * @param {type} target_id div id where last log will be appended
 * @returns {undefined}
 */
function appendAddMoreLog(target_id){
	// Create load more Log
	var template = getTemplate("template_log_add_more");

	var loadMoreLog = {
		page: page + 1
	};

	var html = Mustache.to_html(template, loadMoreLog);
	$('#'+target_id).append(html);
}

/**
 * Get all attachments from specific log, put them in template and append them to the end of the log
 * @param {type} source_id div id where template is positioned
 * @param {type} target_id div id where attachments will be placed
 * @param {type} data JSON object that holds attachments
 * @param {type} logId id of the log we want attach attachments to
 */
function repeatAttachments(source_id, target_id, data, logId){

	var template = getTemplate(source_id);
	var html = "";
	var notImages = new Array();
	$('#'+target_id).html("");

	var scale = parseFloat(imageSizes.list[imageSizes.current].scale);
	var correction = parseInt(imageSizes.list[imageSizes.current].correction);
	var containerWidth = $(document).width() * 0.5 * scale - correction;
	l("width: " + containerWidth);

	$.each(data, function(i, item) {

		// Create customized Attachment object
		var newItem = {
			imageUrl: serviceurl + "attachments/" + logId + "/" + item.fileName,
			fileName: item.fileName,
			imageWidth: containerWidth,
			imageHeight: containerWidth
		};

		// Add items that are not images to array
		if(!isImage(item.contentType)){
			notImages = notImages.concat(newItem);
			return;
		}

		html = Mustache.to_html(template, newItem);

		$('#'+target_id).append(html);
	});

	// Append elements that are not images
	template = getTemplate("template_log_attachment_not_image");

	$.each(notImages, function(i, file){
		html = Mustache.to_html(template, file);

		$('#'+target_id).append(html);
	});
}

/**
 * Return raw template
 * @param {type} id div id that holds the template
 * @returns template as a string
 */
function getTemplate(id){
	$.ajaxSetup({async:false});
	var template = "";

	$('#template_container').load(templates + ' #' + id, function(response, status, xhr){
		templateContent = response;
		template = $('#' + id).html();
	});

	return template;
}

/*
 * Get Add modal windows from remote site, copy it to index and then show it
 * @param {type} modalId id of the modal windows
 * @param {type} name name of the element to be deleted
 */
function showAddModal(modalId){
	$('#modal_container').load(modalWindows + ' #' + modalId, function(response, status, xhr){
		$('#' + modalId).modal('toggle');

		$(document).ready(function(){
			$('#' + modalId + ' input[name=name]').focus();
		});
		l('#' + modalId + ' [name=name]');
	});
}

/*
 * Get Edit Logbook modal windows from remote site, copy it to index and then show it
 * @param {type} modalId id of the modal windows
 * @param {type} name name of the Logbook
 * @param {type} owner owner of the Logbook
 */
function showEditLogbookModal(modalId, name, owner){
	$('#modal_container').load(modalWindows + ' #' + modalId, function(response, status, xhr){
		$('#' + modalId + ' [name=name]').val(name);
		$('#' + modalId + ' [name=owner]').val(owner);
		$('#' + modalId + ' [name=name_original]').val(name);
		$('#' + modalId).modal('toggle');
	});
}

/*
 * Get Edit Tag modal windows from remote site, copy it to index and then show it
 * @param {type} modalId id of the modal windows
 * @param {type} name name of the Tag
 */
function showEditTagModal(modalId, name){
	$('#modal_container').load(modalWindows + ' #' + modalId, function(response, status, xhr){
		$('#' + modalId + ' [name=name]').val(name);
		$('#' + modalId + ' [name=name_original]').val(name);
		$('#' + modalId).modal('toggle');
	});
}

/*
 * Get Delete modal windows from remote site, copy it to index and then show it
 * @param {type} modalId id of the modal windows
 * @param {type} name name of the element to be deleted
 */
function showDeleteModal(modalId, name){
	$('#modal_container').load(modalWindows + ' #' + modalId, function(response, status, xhr){
		$('#' + modalId + ' [name=name_original]').val(name);
		$('#' + modalId).modal('toggle');
	});
}

/**
 * Generate Log object from the data in the new Log form
 * @returns Log
 */
function generateLogObject() {
	var log = [{
		"description":"",
		"logbooks":[],
		"tags":[],
		"properties":[],
		"attachments":[],
		"level":""
	}];

	// Set description
	log[0].description = $('#log_body').val();

	// Set logbooks
	var logbooksString = $('input[name=hidden-logbooks]').val();

	if(logbooksString !== undefined && logbooksString.length > 1) {
		$.each(logbooksString.split(','), function(index, logbook){
			log[0].logbooks.push({"name":logbook});
		});
	}

	// Set tags
	var tagsString = $('input[name=hidden-tags]').val();

	if(tagsString !== undefined && tagsString.length > 1) {
		$.each(tagsString.split(','), function(index, tag){
			log[0].tags.push({"name":tag});
		});
	}

	// Set Level
	log[0].level = $('#level_input').find(":selected").val();

	return log;
}

/**
 * After Log ovject is created, send it to the server
 * @param log Log object to be inserted into database
 */
function createLog(log) {
	var logId = null;

	var json = JSON.stringify(log);
	l(json);

	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "POST",
		url : serviceurl + 'logs',
		contentType: 'application/json; charset=utf-8',
		data: json,
		async: false,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to create this Log!", "#error_block", "#error_body");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			//reset();
			//onError('Invalid username or password. Please try again.');
			//$('#loginform #user_login').focus();
		},
		success : function(xml) {
			//cookies();
			l("Log sent to the server");

			$log = $(xml).find("log");
			logId = $log.attr('id');
		}
	});

	return logId;
}

function uploadFiles(logId, uploadData, uploadTargetId) {
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	for(var i=0; i<uploadData.length; i++){
		var data = uploadData[i];

		if(data !== null) {
			$.ajaxSetup({async:false});

			$(uploadTargetId).fileupload('send', {
				files: data.files[0],
				formData: {file: data.files[0]},
				url: serviceurl + 'attachments/' + logId,
				beforeSend : function(xhr) {
					var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
					xhr.setRequestHeader("Authorization", "Basic " + base64);
				}
			}).success(function(result, textStatus, jqXHR) {
				l("ok");


			}).error(function (jqXHR, textStatus, errorThrown) {
				l(errorThrown);

			});
		}
	};
}

/**
 * After Log ovject is created, send it to the server
 * @param log Log object to be inserted into database
 */
function modifyLog(log) {

	var json = JSON.stringify(log[0]);
	l(json);

	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "PUT",
		url : serviceurl + 'logs/' + log[0].id,
		contentType: 'application/json; charset=utf-8',
		data: json,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to modify this Log!", "#error_block", "#error_body");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			//reset();
			//onError('Invalid username or password. Please try again.');
			//$('#loginform #user_login').focus();
		},
		success : function(model) {
			//cookies();
			l("Log sent to the server");
		}
	});
}

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com
function encode64(input) {
	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	if (!String(input).length) return false;
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;

	do {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);

		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;

		if (isNaN(chr2)) {
			enc3 = enc4 = 64;
		} else if (isNaN(chr3)) {
			enc4 = 64;
		}

		output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
			keyStr.charAt(enc3) + keyStr.charAt(enc4);
	} while (i < input.length);

	return output;
}

function decode64(input) {
	var base64_keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var output = "";
	var chr1, chr2, chr3;
	var enc1, enc2, enc3, enc4;
	var i = 0;

	// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

	while (i < input.length) {
		enc1 = base64_keyStr.indexOf(input.charAt(i++));
		enc2 = base64_keyStr.indexOf(input.charAt(i++));
		enc3 = base64_keyStr.indexOf(input.charAt(i++));
		enc4 = base64_keyStr.indexOf(input.charAt(i++));

		chr1 = (enc1 << 2) | (enc2 >> 4);
		chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
		chr3 = ((enc3 & 3) << 6) | enc4;

		output = output + String.fromCharCode(chr1);

		if (enc3 != 64) {
			output = output + String.fromCharCode(chr2);
		}
		if (enc4 != 64) {
			output = output + String.fromCharCode(chr3);
		}
	}

	return output;
}

/**
 * Start listening to form submit and when submit happens, extract data from the form and check user credentials by analysing server response.
 */
function login() {

	/**
	* Disable closing the login dropdown if user clicks on login form elements
	*/
	// Setup drop down menu
	$('.dropdown-toggle').dropdown();
	// Fix input element click problem
	$('.dropdown-menu form').click(function(e) {
		e.stopPropagation();
	});

	$('#user_submit_form').on('submit', function(e){
		e.preventDefault();

		var username = $('#user_username').val();
		var password = $('#user_password').val();

		$.ajax( {
			type: "POST",
			url : serviceurl + 'logs',
			contentType: 'application/xml; charset=utf-8',
			dataType: 'xml',
			data: '',
			beforeSend : function(xhr) {
				var base64 = encode64(username + ":" + password);
				xhr.setRequestHeader("Authorization", "Basic " + base64);
			},
			statusCode: {
				400: function(){
					saveUserCredentials(username, password);
					l("User logged in");
				},
				404: function(){
					$('#login_error').show('fast');
				}
			},
			error : function(xhr, ajaxOptions, thrownError) {
				//reset();
				//onError('Invalid username or password. Please try again.');
				//$('#loginform #user_login').focus();
			},
			success : function(model) {
				//cookies();
			}
		});

		window.location.href = firstPageName;
	});
}

/**
 * When user clicks on Sign out link, delete a session cookie and redirect user to the first page.
 * @returns {undefined}
 */
function logout() {
	l("logged out");
	deleteUserCredentials();

	window.location.href = firstPageName;
}

/**
 * Save user credentials to the cookie with 1 day of expiration time.
 * @param {type} username user's username
 * @param {type} password user's password
 */
function saveUserCredentials(username, password) {
	var credentials = {"username": username, "password": password};
	$.cookie(sessionCookieName, JSON.stringify(credentials), {expires: 1});
}

/**
 * Delete session cookie when user loggs out
 */
function deleteUserCredentials() {
	$.removeCookie(sessionCookieName);
}

/**
 * Get user credentials from session cookie when needed
 * @returns {JSON} object with username and password
 */
function getUserCreadentials() {
	var credentials = null;

	if($.cookie(sessionCookieName) !== undefined) {
		credentials = $.parseJSON($.cookie(sessionCookieName));
	}

	return credentials;
}

/**
 * Create Logbook
 * @param logbook current Logbook object
 */
function createLogbook(logbook) {

	var json = JSON.stringify(logbook);
	l(json);

	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "POST",
		url : serviceurl + 'logbooks',
		contentType: 'application/json; charset=utf-8',
		data: json,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to create this Logbook!", "#new_logbook_error_block", "#new_logbook_error_body");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			//reset();
			//onError('Invalid username or password. Please try again.');
			//$('#loginform #user_login').focus();
			l("something went wrong");
		},
		success : function(model) {
			//cookies();
			l("Logbook sent to the server");
			$('#myModal').modal("hide");
			loadLogbooks();
		}
	});
}

/**
 * Modify Logbook
 * @param logbook current Logbook object
 * @param name original name of the Logbook
 */
function modifyLogbook(logbook, name) {

	var json = JSON.stringify(logbook.logbook[0]);
	l(json);

	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "POST",
		url : serviceurl + 'logbooks/' + name,
		contentType: 'application/json; charset=utf-8',
		data: json,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to modify this Logbook!", "#new_logbook_error_block", "#new_logbook_error_body");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			//reset();
			//onError('Invalid username or password. Please try again.');
			//$('#loginform #user_login').focus();
			l("something went wrong");
		},
		success : function(model) {
			//cookies();
			l("Logbook modify command sent to the server");
			$('#editLogbookModal').modal("hide");
			loadLogbooks();
		}
	});
}

/**
 * Delete Logbook
 * @param name original name of the Logbook
 */
function deleteLogbook(name) {
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "DELETE",
		url : serviceurl + 'logbooks/' + name,
		contentType: 'application/json; charset=utf-8',
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to delete this Logbook!", "#new_logbook_error_block", "#new_logbook_error_body");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			//reset();
			//onError('Invalid username or password. Please try again.');
			//$('#loginform #user_login').focus();
			l("something went wrong");
		},
		success : function(model) {
			//cookies();
			l("Logbook delete command sent to the server");
			$('#deleteLogbookModal').modal("hide");
			loadLogbooks();
		}
	});
}

/**
 * Create Tag
 * @param tag current Tag object
 */
function createTag(tag) {

	var json = JSON.stringify(tag);
	l(json);

	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "POST",
		url : serviceurl + 'tags',
		contentType: 'application/json; charset=utf-8',
		data: json,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to create this Tag!", "#new_logbook_error_block", "#new_logbook_error_body");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			//reset();
			//onError('Invalid username or password. Please try again.');
			//$('#loginform #user_login').focus();
			l("something went wrong");
		},
		success : function(model) {
			//cookies();
			l("Tag sent to the server");
			$('#myTagModal').modal("hide");
			loadTags();
		}
	});
}

/**
 * Modify Tag
 * @param tag current Tag object
 * @param name original name of the Logbook
 */
function modifyTag(tag, name) {

	var json = JSON.stringify(tag.tag[0]);
	l(json);

	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "POST",
		url : serviceurl + 'tags/' + name,
		contentType: 'application/json; charset=utf-8',
		data: json,
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to modify this Tag!", "#new_logbook_error_block", "#new_logbook_error_body");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			//reset();
			//onError('Invalid username or password. Please try again.');
			//$('#loginform #user_login').focus();
			l("something went wrong");
		},
		success : function(model) {

			l("Tag modify command sent to the server");
			$('#editTagModal').modal("hide");
			loadTags();
		}
	});
}

/**
 * Delete Tag
 * @param name original name of the Tag
 */
function deleteTag(name) {
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.ajax( {
		type: "DELETE",
		url : serviceurl + 'tags/' + name,
		contentType: 'application/json; charset=utf-8',
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to delete this Tag!", "#new_logbook_error_block", "#new_logbook_error_body");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			//reset();
			//onError('Invalid username or password. Please try again.');
			//$('#loginform #user_login').focus();
			l("something went wrong");
		},
		success : function(model) {
			//cookies();
			l("Logbook delete command sent to the server");
			$('#deleteTagModal').modal("hide");
			loadTags();
		}
	});
}

/**
 * Delete Tag
 * @param name original name of the Tag
 */
function deleteAttachment(url, log) {
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));
	l(url);

	$.ajax( {
		type: "DELETE",
		url : url,
		contentType: 'application/json; charset=utf-8',
		beforeSend : function(xhr) {
			var base64 = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64);
		},
		statusCode: {
			403: function(){
				showError("You do not have permission to delete this attachment!", "#new_logbook_error_block", "#new_logbook_error_body");
			}
		},
		error : function(xhr, ajaxOptions, thrownError) {
			//reset();
			//onError('Invalid username or password. Please try again.');
			//$('#loginform #user_login').focus();
			l("something went wrong");
		},
		success : function(model) {
			//cookies();
			l("Attachment delete command sent to the server");
			$('#deleteExistingAttachmentModal').modal("hide");
			fillInForm(log);
		}
	});
}

/**
 * Function for uploading files pasted in Firefox. Img data is in URI scheme
 * http://en.wikipedia.org/wiki/Data_URI_scheme
 * @param {type} logId id of the Log entry we are creating
 * @param {type} pastedData array or pasted sources
 * @returns {undefined}
 */
function uploadPastedFiles(logId, pastedData) {
	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	$.each(pastedData, function(index, source){

		if(source !== null) {
			var sourceParts = source.split('base64,');

			var dataType = sourceParts[0].substring(5, sourceParts[0].length-1);
			var data = sourceParts[1];
			var ending = dataType.split('/')[1];

			var url = serviceurl + 'attachments/' + logId;

			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, false);

			var boundary = '------multipartformboundary' + (new Date).getTime();
			var dashdash = '--';
			var crlf = '\r\n';

			var content = dashdash+boundary+crlf
					+'Content-Disposition: form-data; name="file"; filename="image_' + (new Date).getTime() + '.' + ending + '"'+crlf
					+'Content-Type: '+dataType+crlf
					+'Content-Transfer-Encoding: BASE64'+crlf
					+crlf
					+data
					+crlf+dashdash+boundary+dashdash
					+crlf;

			xhr.setRequestHeader("Content-type", "multipart/form-data; boundary="+boundary);
			xhr.setRequestHeader("Content-length", content.length);

			var base64EncodedUsernameAndPassword = encode64(userCredentials["username"] + ":" + userCredentials["password"]);
			xhr.setRequestHeader("Authorization", "Basic " + base64EncodedUsernameAndPassword);

			xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
			xhr.setRequestHeader("Connection", "close");
			// execute
			xhr.send(content);
		}
	});
}