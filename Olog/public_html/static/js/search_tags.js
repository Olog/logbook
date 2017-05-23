/*
 * Handles the input bar to filter and add/remove search queries
 *
 * @author: Dena Mujtaba
 */

//on load
$(document).ready(function(){
    var main = $('#filter-search-input');
    var tagsArea = main.find('span.tag-wrapper');
    var input = main.find('input[type="text"]');
    var filterList = main.find('.filter-options');
    var inputType = main.find('.input-type');
   // var clearSearch = main.find('.clear-search');

    var template = getTemplate('template_search_tag_filter');

    //loop and create the options for filtering tags
    $.each(keyMap, function(index, value){

        var name = index;
        var type = name.split(':')[0];

        if(type === "tag"){
            type = "tagt";
        }

        var html = Mustache.to_html(template,
            {
                "type": type,
                "name": name
            });

        filterList.append(html);

    });

    setTagClickEvents(main);

    input.focusin(function(){
        filterList.slideDown();
    });

    input.focusout(function(){
        filterList.slideUp();
    });

    //handle enter key to set the tag in the input area
    input.keypress(function(e){
        var code = e.keyCode || e.which;
        var val = $.trim($(this).val());
        var typ = $(this).attr('type-attr') || "default";

        //on the keypress of ',' or 'enter'
        if((code === 13 || code === 188 || code === 186 ) && val) {

            //set tag
            var createTag = addTag(main,tagsArea, val,typ );

            if(createTag){

                $(this).val('');

                inputType.text('');

                $(this).attr('type-attr', '').focusout();
                generateTagsSearch();
            }
        }
    });

    filterList.find('li').click(function(){

        inputType.text($(this).text());
        input.attr('type-attr', $(this).attr('type-attr'));

    });

    if(ologSettings.searchInputElements !== undefined){

        searchInputElements = ologSettings.searchInputElements;
    }

    //load the current tags from the saved entries
    $.each(searchInputElements, function(type, tags){

        $.each(tags, function(elem, val){

            addTag(main, tagsArea, val, type, true );

        })
    })

    //generate the search query
    generateTagsSearch();

});

/**
 * creates a search query and the search input field information from the tags
 */
function generateTagsSearch(){

    var dataArray = searchInputElements;

    var searchInputArea = $("#search-query");

    var newValue = "";
    var queryString = "";

    //Will hold the elements of the search query from the search tags input
    var tempArr = "";

    tempArr = Object.keys(dataArray['logbook']);
    if(tempArr.length !== 0 && tempArr[0] === "length") tempArr.shift();

    // If at least one logbook is selected, append logbook part to a search query
    if(tempArr !== undefined && tempArr.length !== 0) {
        newValue += "logbook: " + $.trim(tempArr) + ' ';
        queryString += "logbook=" + $.trim(tempArr) + '&';
    }

    tempArr = Object.keys(dataArray['tagt']);
    if(tempArr.length !== 0 && tempArr[0] === "length") tempArr.shift();

    // If at least one tag is selected, append tag part to a search query
    if(tempArr !== undefined && tempArr.length !== 0) {
        newValue += "tag: " + $.trim(tempArr) + ' ';
        queryString += "tag=" + $.trim(tempArr) + '&';
    }

    tempArr = Object.keys(dataArray['owner']);
    if(tempArr.length !== 0 && tempArr[0] === "length") tempArr.shift();

    // If at least one owner is selected, append owner part to a search query
    if(tempArr !== undefined && tempArr.length !== 0) {
        newValue += "owner: " + $.trim(tempArr) + ' ';
        queryString += "owner=" + $.trim(tempArr) + '&';
    }

    tempArr = Object.keys(dataArray['from']);
    if(tempArr.length !== 0 && tempArr[0] === "length") tempArr.shift();
    var temp2 = Object.keys(dataArray['start']);
    if(temp2.length !== 0 && temp2[0] === "length") tempArr.shift();
    tempArr = tempArr + temp2;

    // From time filter is set, append time part to a search query
    if(tempArr !== undefined && tempArr.length !== 0) {
        newValue += "from: " + $.trim(tempArr) + ' ';
        queryString += "start=" + returnTimeFilterTimestamp($.trim(tempArr), undefined)[0] + '&';
    }

    tempArr = Object.keys(dataArray['to']);
    if(tempArr.length !== 0 && tempArr[0] === "length") tempArr.shift();
    temp2 = Object.keys(dataArray['end']);
    if(temp2.length !== 0 && temp2[0] === "length") tempArr.shift();
    tempArr = tempArr + temp2;

    // If to time filter is set, append time part to a search query
    if(tempArr !== undefined && tempArr.length !== 0) {
        newValue += "to: " + tempArr + ' ';
        queryString += "end=" + returnTimeFilterTimestamp(undefined, $.trim(tempArr))[1] + '&';
    }

    // Append include history parameter
    if(ologSettings.includeHistory && !("history" in $.url(queryString).param())) {
        queryString += historyParameter + "=&";
    }

    // Set new search query to its place
    searchInputArea.val(newValue);

    searchForLogs(queryString, true);
}

/**
 * set the tag click handler to the main search input area
 * @param main
 */
function setTagClickEvents(main){

    main.find('span.tag').click(function(){

        handleTagClick($(this));
        generateTagsSearch();

    })
}

/**
 * handle delete when someone clicks on a tag
 * @param tag
 */
function handleTagClick(tag){

    var txtValue = $.trim(tag.find('span').text());

    //handle list select based on type
    switch(tag.attr("type-attr")){

        case "logbook":
        case "tagt":
            var name = "list";

            if (tag.attr("type-attr") === "tagt")
                name = 'list2';

            var elem = $('span.'+name+'[name-attr="'+txtValue+'"]').first();

            elem.removeClass("multilist_clicked");

            selectedElements[name + '_index'][$.trim(elem.text())] = "false";

            removeDeselectedFilter(name, $.trim(elem.text()));

            saveSelectedItems(elem, true, false);

            break;

        case "from":
            $('span.list3 input[value="'+txtValue+'"]').parent().trigger('click');
            break;

        case "to":
            $('span.list5').trigger('click');

            break;

    }

    delete searchInputElements[tag.attr("type-attr")][txtValue];
    tag.remove();

    //save option
    ologSettings.searchInputElements = searchInputElements;
    saveOlogSettingsData(ologSettings);
}

/**
 * add a tag to the search query
 * @param main where input and tags are held
 * @param tagsArea area where the tags are
 * @param val tag text value
 * @param type search type belonging to the tag
 * @param override If tag is auto generated from selections/ saved
 * @return boolean if tag was successfully created
 */
function addTag(main, tagsArea, val, type, override = false){

    if(checkValidTag(val, type) || override){
        searchInputElements[type][val] = val;

        var template = getTemplate('search_tag_input');
        var html = Mustache.to_html(template,
            {
                "type": type,
                "value": val
            });

        tagsArea.append(html);

        //save option
        ologSettings.searchInputElements = searchInputElements;

        saveOlogSettingsData(ologSettings);

        setTagClickEvents(main);

        return true;

    }else{
        return false;
    }
}

/**
 * Sets the value and tag of a tag to the search query if valid
 * @param val the Name of the tag
 * @param type Search type
 * @return boolean if valid option
 */
function checkValidTag(val, type){
    switch(type){

        case "logbook":

            var elem = $('span.list[name-attr="'+val+'"]');

            if(elem.length > 0){
                //logbook exists, can set the tag

                //set default initial values
                setDefaultMultiListArr('list');

                setItemSelected('list', elem);

                return true;
            }

            break;
        case "tagt":

            var elem = $('span.list2[name-attr="'+val+'"]');

            if(elem.length > 0){
                //tag exists, can set

                //set default initial values
                setDefaultMultiListArr('list2');

                //setItemSelected('list2', elem);

                return true;
            }

            break;

        default:
            return true;
    }

    return false;
}

/**
 * Changes the tags in the search column for type category to match selected items
 * @param dataArr Items to set
 * @param type Array to change
 */
function syncSearchTags(dataArr, type){

    if(dataArr === null){
        dataArr = "";
    }

    var main = $('#filter-search-input');
    var tagsArea = main.find('span.tag-wrapper');

    //reset the tags for this type
    tagsArea.find('span[type-attr="'+type+'"]').remove();

    searchInputElements[type].length = 0;

    if(dataArr !== undefined && dataArr.length !== 0){

        $.each(dataArr.split(","), function (index, value) {

            addTag(main, tagsArea, value, type, true);

        });
    }
}

