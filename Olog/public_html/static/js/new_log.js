/*
 * Script specific to edit_log.html
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

var uploadData = [];

$(document).ready(function(){

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
			$("#tags_input").tagsManager('pushTag',element);
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
			$("#logbooks_input").tagsManager('pushTag',element);
		});
	});

	// Listen for new Log form submit
	$('#createForm').on('submit', function(e){
		e.preventDefault();

		var log = generateLogObject();

		if(isValidLog(log) === true) {
			createLog(log, uploadData);
		}
	});

	// Load levels
	var template = getTemplate('template_level_input');
	$('#level_input').html("");

	$.each(levels, function(index, name) {
		var html = Mustache.to_html(template, {"name": name, "selected":""});
		$('#level_input').append(html);
	});

	initialize();

	// Upload
	upload();
});

function upload() {
	// Change this to the location of your server-side upload handler:
	var url = serviceurl + "attachments/";
	var uploadButton = $('<button/>')
			.addClass('btn')
			.prop('disabled', true)
			.prop('className', 'btn btn-danger')
			.on('click', function () {
				var $this = $(this);
				var data = $this.data();
				l(data);
				uploadData[data.filePos] = null;

				$this.remove();
				data.abort();
			});

	var p = $('<p/>');
	var pIndex = 0;

	$('#fileupload').fileupload({
		url: url,
		dataType: 'json',
		autoUpload: false,
		acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
		maxFileSize: 5000000, // 5 MB
		// Enable image resizing, except for Android and Opera,
		// which actually support image resizing, but fail to
		// send Blob objects via XHR requests:
		disableImageResize: /Android(?!.*Chrome)|Opera/
			.test(window.navigator && navigator.userAgent),
		previewMaxWidth: 100,
		previewMaxHeight: 100,
		previewCrop: true

	}).on('fileuploadadd', function (e, data) {
		data.context = $('<div/>').appendTo('#files');
		$.each(data.files, function (index, file) {
			var newP = p.clone(true);
			newP.prop('id', pIndex);
			pIndex += 1;

			var node = newP.append($('<span/>').text(file.name));
			if (!index) {
				var count = uploadData.length;
				data.filePos = count;
				data.node = newP;
				uploadData.push(data);
				node
					.append('<br>')
					.append(uploadButton.clone(true).data(data));
				//l(data);
			}
			node.appendTo(data.context);
		});

	}).on('fileuploadprocessalways', function (e, data) {
		var index = data.index,
			file = data.files[index];
			var node = $(data.context.children()[index]);

		if (file.preview) {
			node
				.prepend('<br>')
				.prepend(file.preview);
		}
		if (file.error) {
			node
				.append('<br>')
				.append(file.error);
		}
		if (index + 1 === data.files.length) {
			data.context.find('button')
				.text('Remove')
				.prop('disabled', !!data.files.error);
		}

	});/*.on('fileuploadprogressall', function (e, data) {
		var progress = parseInt(data.loaded / data.total * 100, 10);
		l(progress);
		$('#progress .bar').css(
			'width',
			progress + '%'
		);

	}).on('fileuploaddone', function (e, data) {
		$.each(data.files, function (index, file) {
			$('#progress .bar').css('width', '0%');
		});

	}).on('fileuploadfail', function (e, data) {
		$.each(data.result.files, function (index, file) {
			var error = $('<span/>').text(file.error);
			$(data.context.children()[index])
				.append('<br>')
				.append(error);
		});
	});*/
}