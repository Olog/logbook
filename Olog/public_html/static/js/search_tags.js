/*
 * Handles the input bar to filter and add/remove search queries
 *
 * @author: Dena Mujtaba
 */

//TODO: connect tags that when change, search.
//TODO: Also connect left multilist search options

//on load
$(document).ready(function(){
    var main = $('#filter-search-input');
    var tagsArea = main.find('span.tag-wrapper');
    var input = main.find('input[type="text"]');
    var filterList = main.find('.filter-options');
    var inputType = main.find('.input-type');
   // var clearSearch = main.find('.clear-search');

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
        if((code === 13 || code === 188) && val) {
            //set tag
            addTag(main,tagsArea, val,typ );

            $(this).val('');

            inputType.text('');

            $(this).attr('type-attr', '');
        }
    });

    filterList.find('li').click(function(){

        inputType.text($(this).text());

        input.attr('type-attr', $(this).attr('type-attr')).focus();
    })

});

/**
 * set the tag click handler to the main search input area
 * @param main
 */
function setTagClickEvents(main){

    main.find('span.tag').click(function(){

        handleTagClick($(this));
    })
}

/**
 * handle delete when someone clicks on a tag
 * @param tag
 */
function handleTagClick(tag){

    delete searchInputElements[tag.attr("type-attr")][tag.find('span').text()];

    tag.remove();
}

/**
 * add a tag to the search query
 * @param main where input and tags are held
 * @param tagsArea area where the tags are
 * @param val tag text value
 * @param type search type belonging to the tag
 */
function addTag(main, tagsArea,val, type){

    searchInputElements[type][val] = val;

    var template = getTemplate('search_tag_input');
    var html = Mustache.to_html(template,
        {
            "type": type,
            "value": val

        });

    tagsArea.append(html);

    console.log(searchInputElements);

    setTagClickEvents(main);
}