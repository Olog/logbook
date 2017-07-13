/*
 * Javascript multiselection and singleselection list module.
 *
 * @author: Dejan Dežman <dejan.dezman@cosylab.com>
 */

// Because number of logs per load is change in the process,
// we must save the old value in a variable
var oldLogsPerLoad = numberOfLogsPerLoad;

// Do we want to limit rest results count
var limit = true;

/**
 * Function will create onclick event listener for mulstiselection list with specific name
 * @param {type} name name of the group we want to control
 * @param {type} saveSelectedItemsIntoACookie only save current selected data into a cookie if this flag is set to true
 */
function multiselect(name, saveSelectedItemsIntoACookie){
	limit = true;
	numberOfLogsPerLoad = oldLogsPerLoad;

	// Change color on hover
	//$('.' + name).hover(function(e){
		if($.cookie(sessionCookieName) !== undefined) {
			$("." + name + " .multilist_icons").addClass("allow_display");
			//$(e.target).find(".multilist_icons").show("fast");
		}
	//});

	// Restore color when mouse laves the element
	//$('.' + name).mouseleave(function(e){
	//	$(e.target).find(".multilist_icons").hide("fast");
	//});

	// Listen for clicks on elements
	$('.' + name).click(function(e){
		var clicked = false;

        setDefaultMultiListArr(name);

		if($(e.target).is("span")){

			// Check if filter is selected
			if($(e.target).hasClass("multilist_clicked")) {
				clicked = true;
			}

			if(!e.ctrlKey){
				$('.' + name).removeClass("multilist_clicked");
				selectedElements[name] = [];
				selectedElements[name + '_index'] = {};
			}

			// Add element among selected elements
			if(clicked === false) {
                setItemSelected(name, $(e.target));

			// Remove elements from selected elements
			} else {
				$(e.target).removeClass("multilist_clicked");
				selectedElements[name + '_index'][$.trim($(e.target).text())] = "false";
				removeDeselectedFilter(name, $.trim($(e.target).text()));
			}

			// Trigger event and set cookie with data
            saveSelectedItems($(e.target), saveSelectedItemsIntoACookie);
		}
	});
}

/**
 * Moves the multilist collapse bar as the window resizes
 */
function resizeWithCollapse(){
    var multilistcollapse = $('#min-multilists');

    if(multilistcollapse.length > 0){
        if(!multilistcollapse.hasClass('closed')){
            if(multilistcollapse.hasClass('min-right')){
                multilistcollapse.css('left', $('.container-resize3').offset().left - multilistcollapse.width());
            }else{
                multilistcollapse.css('left', $('.container-resize').offset().left - multilistcollapse.width());
            }
        }
	}


}

/**
 * Sets the multilist section collapse button event handler
 */
function setMultilstCollapseEvent(){
    var multilistcollapse = $('#min-multilists');
    var multilistcontainer = multilistcollapse.parent();

    var set = ologSettings.collapse_multilist;
    //check if the user had already collapsed the list
    if(set === undefined){
        set = false;
    }

	if(multilistcollapse.hasClass('min-right')){
		//collapse the multilist to the right side
		//newlog & modifylog pages

		var containermodifyleft = $('.container-modify-left');
		var resize3 = $('.container-resize3');

		if(set){
            //set the collapse handler and set the widths
            setCollapseMultilistRight(multilistcollapse, set, multilistcontainer, containermodifyleft, resize3 );
		}

		//set click handler on collapse bar
        multilistcollapse.click( function() {

            setCollapseMultilistRight($(this), !($(this).hasClass('closed')), multilistcontainer,containermodifyleft, resize3 );
        })

	}else{
		//collapse to the left side of the screen

        var containermiddle = $('.container-middle');
        var resize2 =  $('.container-resize2');
        var resize =  $('.container-resize');
        var containerleft = $('.container-left').width();

        if(set){
            setCollapseMultilistLeft(multilistcollapse, set, multilistcontainer, containermiddle, resize2, containerleft,resize );
        }else{
            multilistcollapse.removeClass('closed').css('left', resize.offset().left - multilistcollapse.width());
        }

        multilistcollapse.click( function(e){

            setCollapseMultilistLeft($(this), !($(this).hasClass('closed')), multilistcontainer, containermiddle, resize2,resize.offset().left,resize );

            var origsetting =  multilistcontainer.width();
            resize.css('left',origsetting);

            containermiddle.width(resize2.offset().left - origsetting).css('left',  multilistcontainer.width());
        	$(this).css('left', origsetting);
        });
	}

}

/**
 * Collapse the multilist to the right
 * @param elem Element to control the collapse
 * @param set Boolean to close=true/ open=false multilist
 * @param parent Outer element of multilist to resize
 * @param containerchange section to change the width of after resizing
 * @param origleft original position to switch the middle area back to
 */
function setCollapseMultilistRight(elem, set, parent, containerchange, origleft){
    var that = elem;

    if(set){
        parent.css('width', '0').css('border-left', '0').css('background-color', 'transparent');
        that.addClass('closed').css('right', 0).css('left', 'auto');
        containerchange.width('100%');
        origleft.css('pointer-events', 'none').css('z-index', '-1');

    }else{
        that.removeClass('closed').css('left', origleft + that.width()).css('right', 'auto');
        parent.css('width', '100%').css('border-left', '').css('background-color', '');
        origleft.css('pointer-events', 'all').css('z-index', '509');
        containerchange.width(origleft.offset().left);
	}

	ologSettings.resize = {};
    ologSettings.collapse_multilist = set;
    saveOlogSettingsData(ologSettings);
}

/**
 * Collapse the multilist to the left
 * @param elem Element to control the collapse
 * @param set Boolean to close=true/ open=false multilist
 * @param parent Outer element of multilist to resize
 * @param containerchange section to change the width of after resizing
 * @param resizediv div that allows resizing of sections
 * @param origleft original position to switch the middle area back to
 * @param resize The div that allows resizing for the left most element
 */
function setCollapseMultilistLeft(elem, set, parent, containerchange, resizediv, origleft, resize){
	var that = elem;

	if(set){
        parent.width(0);
        that.addClass('closed').css('left','' );
        containerchange.width(resizediv.offset().left).css('left', '0');
		resize.css('pointer-events', 'none');
	}else{
        resize.css('pointer-events', '');
        parent.width('100%');
        containerchange.width(resizediv.offset().left - origleft).css('left',origleft );
        that.removeClass('closed').css('left', origleft - that.width());

        if(ologSettings.resize !== undefined){
            ologSettings.resize.middle_pane_left = origleft;
        }
    }

    ologSettings.resize = {};
    ologSettings.collapse_multilist = set;
    saveOlogSettingsData(ologSettings);
}

/**
 * Sets default values id the lists in the multilist have not been initialized yet
 * @param name
 * @param elem
 */
function setDefaultMultiListArr(name){
    if(selectedElements[name + '_index'] === undefined || selectedElements[name + '_index'] === null) {
        selectedElements[name + '_index'] = {};
    }

    // Check if filter array exists
    if(selectedElements[name] === undefined) {
        selectedElements[name] = new Array();
    }
}

/**
 * Sets an element in the multilist as selected
 * @param name List name
 * @param elem The target of the selected element
 */
function setItemSelected(name, elem){
	if(!elem.hasClass('multilist_clicked')){
        elem.addClass("multilist_clicked");
        selectedElements[name + '_index'][$.trim(elem.text())] = "true";
        selectedElements[name].push($.trim(elem.text()));
	}
}

/**
 * saves the multilist items into the cookie
 * @param e Element to handle
 * @param saveSelectedItemsIntoACookie Bool to save
 * @param triggerEvent if we should trigger dataselected on the element
 */
function saveSelectedItems(e, saveSelectedItemsIntoACookie, triggerEvent){
    if(triggerEvent === undefined) {
        triggerEvent = true;
    }

	if(triggerEvent){
        // Trigger event and set cookie with data
        e.parent().unbind('dataselected');
        e.parent().trigger('dataselected', selectedElements);
	}

    if(saveSelectedItemsIntoACookie === undefined || (saveSelectedItemsIntoACookie !== undefined && saveSelectedItemsIntoACookie === true)) {
        saveFilterData(selectedElements);
    }
}
/**
 * Find deselected element and remove it from the list of selected elements
 * @param {type} name name of the array (tags or logbooks)
 * @param {type} element element to be deleted
 */
function removeDeselectedFilter(name, element) {
	for(i=0; i<selectedElements[name].length; i++){

		if(selectedElements[name][i] === element) {
			selectedElements[name].splice(i, 1);
		}
	}
}

/**
 * @param {type} id id od the input element
 * @param {type} name type of the filter (logbooks or tags)
 */
function filterListItems(id, name){

	$('#' + id).unbind('keyup');
	$('#' + id).keyup(function(e){
		var filter = $(e.target).val();

		// Slide up items that does not contain filters and are not selected
		$('.multilist').find('.' + name + ':not(:Contains(' + filter + ')):not(.multilist_clicked)').parent().slideUp();
		$('.multilist').find('.' + name + ':Contains(' + filter + ')').parent().slideDown();
	});
}

/**
 * Function will create onclick event listener for singleselection list with specific name
 * @param {type} name container element class name that will hold singleselect filter
 */
function singleselect(name){
	limit = true;
	numberOfLogsPerLoad = oldLogsPerLoad;

	// Listen for clicks
	$('.' + name).click(function(e){
		var clicked = false;

		if($(e.target).is("input")){
			return;
		}

		if($(e.target).hasClass("multilist_clicked")) {
			clicked = true;
		}

		$('.' + name).removeClass("multilist_clicked");

		// If list5 is clicked, list3 and list4 should be deselected
		if(name === "list5") {
			$('.list3').removeClass("multilist_clicked");
			$('.list4').removeClass("multilist_clicked");
		}

		// If list3 or list4 is clicked, lis5 should be deselected and value
		// in the global object deleted
		if(name === "list3" || name === "list4") {
			$('.list5').removeClass("multilist_clicked");
		}

		// If list3 is selected, remove "to" value
		if(name === "list3") {
			selectedElements['to'] = "";
		}

		var from = $(e.target).find('input[name=from]').val();
		var to = $(e.target).find('input[name=to]').val();

		// Get datepicker from
		var datepickerFrom = $(e.target).find('#datepicker_from').val();
		l(datepickerFrom + from);

		if(datepickerFrom !== undefined && datepickerFrom !== "") {
			from = datepickerFrom;
		}

		// Get datepicker to
		var datepickerTo = $(e.target).find('#datepicker_to').val();
		l(datepickerTo + to);

		if(datepickerTo !== undefined && datepickerTo !== "") {
			to = datepickerTo;
		}

		// If element is not clicked set to and from
		if(clicked === false) {
			$(e.target).addClass("multilist_clicked");
			limit = false;
			numberOfLogsPerLoad = 20;

			// Set from
			if(from !== undefined) {
				selectedElements['from'] = $.trim(from);

			}

			// Set to
			if(to !== undefined) {
				selectedElements['to'] = $.trim(to);
			}

		// If element is clicked clear to and from
		} else {
			selectedElements['from'] = "";
			selectedElements['to'] = "";
			limit = true;
			numberOfLogsPerLoad = oldLogsPerLoad;
		}

		// Trigger event and set cookie with data
        saveSelectedItems($(e.target), true);
	});
}

/**
 * If from and to dates are changed in the time filters, catch that event and save
 * data in the global object
 */
function fromToChanged() {
	// Get datepicker from
	var datepickerFrom = $('#datepicker_from').val();
	l(datepickerFrom);

	if(datepickerFrom !== undefined && datepickerFrom !== "") {
		selectedElements['from'] = $.trim(datepickerFrom);
	}

	// Get datepicker to
	var datepickerTo = $('#datepicker_to').val();
	l(datepickerTo);

	if(datepickerTo !== undefined && datepickerTo !== "") {
		selectedElements['to'] = $.trim(datepickerTo);
	}

	var datepicker = $('#datepicker_to').parent();
	// Trigger event and set cookie with data
    datepicker.unbind('dataselected');
    datepicker.trigger('dataselected', selectedElements);
    datepicker.parent().addClass('multilist_clicked');
	saveFilterData(selectedElements);

}

/**
 * User can expand or collapse filters so they are not in a way.
 * When he clicks on an arrow, filters display should toggle.
 * @returns {undefined}
 */
function startListeningForToggleFilterClicks() {

	// Click on a filter header
	$('.multilist_header').unbind('click');
	$('.multilist_header').click(function(e){
		l($(e.target).parent().attr('id'));

		var ulParent = $(e.target).parent();

		if($(e.target).is('i')) {
			ulParent = $(e.target).parent().parent();
		}

		var arrow = ulParent.find('li i.toggle-from');

		// When hiding elements, don't hide seleted ones
		if(arrow.hasClass('glyphicon-chevron-down')) {
			closeFilterGroup(ulParent);

		} else {
			openFilterGroup(ulParent);
		}
	});
}

/**
 * Open filter group
 * @param {type} groupContainer container that holds filters
 */
function openFilterGroup(groupContainer) {
	groupContainer.find('li:gt(0)').removeClass('display_none');

	var arrow = groupContainer.find('li i.toggle-from');
	toggleChevron(arrow, true);

	// Check if filtersOpened is defined
	if(ologSettings.filtersOpened === undefined) {
		ologSettings.filtersOpened = {};
	}

	ologSettings.filtersOpened[groupContainer.attr('id')] = true;

	// Save settings into a cookie
	saveOlogSettingsData(ologSettings);
}