// http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/
// We start by checking if the browser supports the
// Clipboard object. If not, we need to create a
// contenteditable element that catches all pasted data

/*$(document).ready(function(){
	var ctrlDown = false;
	var ctrlKey = 17, vKey = 86, cKey = 67;

	$(document).keydown(function(e) {
		if (e.keyCode === ctrlKey) ctrlDown = true;

	}).keyup(function(e) {
		if (e.keyCode === ctrlKey) ctrlDown = false;
	});

	$("body").keydown(function(e) {
		if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)){
			$("#paste-area").css("display", "block");
			$("#paste-area").focus();
		}
	});

	$("body").keyup(function(e) {
		if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)){
			$("#paste-area").blur();
			//do your sanitation check or whatever stuff here

			$("#files").html($("#paste-area").html());
			//$("#paste-area").val("");
			$("#paste-area").css("display", "none");
		}
	});
});*/

$(document).ready(function(){
	var ctrlDown = false;
	var ctrlKey = 17, vKey = 86, cKey = 67;

	$(document).keydown(function(e) {
		if (e.keyCode === ctrlKey) ctrlDown = true;

	}).keyup(function(e) {
		if (e.keyCode === ctrlKey) ctrlDown = false;
	});

	$("body").keydown(function(e) {
		if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)){
			$("#paste-area").css("display", "block");
			$("#paste-area").focus();
		}
	});

	$("body").keyup(function(e) {
		if (ctrlDown && (e.keyCode === vKey || e.keyCode === cKey)){
			$("#paste-area").blur();
			//do your sanitation check or whatever stuff here

			//$("#files").html($("#paste-area").html());
			//$("#paste-area").val("");
			$("#paste-area").css("display", "none");
		}
	});
});

if (!window.Clipboard) {
	var pasteCatcher = $('#paste-area');

	// Firefox allows images to be pasted into contenteditable elements
	pasteCatcher.attr("contenteditable", "");

	// We can hide the element and append it to the body,
	//pasteCatcher.style.opacity = 0;
	//document.body.appendChild(pasteCatcher);

	// as long as we make sure it is always in focus
	pasteCatcher.focus();
	document.addEventListener("click", function() { pasteCatcher.focus(); });
}
// Add the paste event listener
window.addEventListener("paste", pasteHandler);

/* Handle paste events */
function pasteHandler(e) {
	// We need to check if event.clipboardData is supported (Chrome)
	if (e.clipboardData) {
	// Already solved in anotrer lib
	// If we can't handle clipboard data directly (Firefox),
	// we need to read what was pasted from the contenteditable element
	} else {
		// This is a cheap trick to make sure we read the data
		// AFTER it has been inserted.
		setTimeout(checkInput, 1);
	}
}

/* Parse the input in the paste catcher element */
function checkInput() {
	// Store the pasted content in a variable
	var child = pasteCatcher.children()[0];

	// Clear the inner html to make sure we're always
	// getting the latest inserted content
	pasteCatcher.innerHTML = "";
	//l(child.src.toString());

	if (child) {
		// If the user pastes an image, the src attribute
		// will represent the image as a base64 encoded string.
		if (child.tagName === "IMG") {
			var img = createImage(child.src);
			$('#files').append(img);
		}
	}
}

/* Creates a new image from a given source */
function createImage(source) {
	var pastedImage = new Image();
	pastedImage.onload = function() {
		// You now have the image!
	};
	pastedImage.src = source;

	var item = {
		files:[source]
	};

	//uploadData.push(item);

	var userCredentials = $.parseJSON($.cookie(sessionCookieName));

	var sourceParts = source.split('base64,');

	var dataType = sourceParts[0].substring(5, sourceParts[0].length-1);
	var data = sourceParts[1];
	var ending = dataType.split('/')[1];

	var url = serviceurl + 'attachments/' + 3432;

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

	return pastedImage;
}