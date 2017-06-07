/*
 * Functions specific to shortcuts list
 *
 * @author: Dena Mujtaba
 */

//maximum number of pages to search through for logs that have been saved
var max_search = 10;

/**
 * add a log to the shortcuts list
 * @param list The multilist to add to
 * @param elem The log element to add to the list
 */
function addToShortcuts(list, elem){
    var logid = elem.find('input[name="id"]').first().val();
    var createdAt = elem.find('.log_start_date').first().text();
    var namee = elem.find('.log_header').first().text() ;
    var template = getTemplate("template_shortcut");
    var html = Mustache.to_html(template, {
        createdAt:createdAt ,
        name: namee,
        logid: logid
    });

    list.append(html);

    //set readonly elems again
    setReadOnly(inReadOnly);

    if(ologSettings.logShortcuts !== undefined){
        if(ologSettings.logShortcuts[logid] === undefined){
            ologSettings.logShortcuts[logid] = {
                logId: logid,
                createdAt: createdAt,
                name: namee
            };
        }
    }else{
        ologSettings.logShortcuts = {};
        ologSettings.logShortcuts[logid] = {
            logId: logid,
            createdAt: createdAt,
            name: namee
        };
    }

    //save the log shortcut data
    saveOlogSettingsData(ologSettings);
    removeFromShortcutEvents();
    handleShortcutClick();

}

/**
 * Adds the shortcut items to the multilist
 * @param list Multilist to add items to
 */
function loadShortcuts(list){

    if(ologSettings.logShortcuts !== undefined){
        list.find('li:not(.multilist_header)').remove();
        $.each( ologSettings.logShortcuts, function( key, values ) {
            //loop through each log id and search for it on the page
            var template = getTemplate("template_shortcut");

            var html = Mustache.to_html(template, {
                createdAt: values.createdAt,
                name: values.name,
                logid: values.logId
            });

            list.append(html);
        });

        //set readonly elems again
        setReadOnly(inReadOnly);
        removeFromShortcutEvents();
        handleShortcutClick();
    }
    list.attr('load_shortcuts', true);
    list.trigger('dataloaded');
}

/**
 * Declared the event handler for removing items from the shortcuts list
 */
function removeFromShortcutEvents(){
    $('.log_shortcut_select').click(function(e){
        var elem = $(this).parent().parent();
        delete ologSettings.logShortcuts[$(this).attr('log_attr')];
        saveOlogSettingsData(ologSettings);
        elem.fadeOut();

        e.stopPropagation();
    })
}

/**
 * Set the click event handler on the shortcut items
 */
function handleShortcutClick(){
    $('.list6').click(function(){
        var foundLog = false;

        var logId = $(this).find('a.log_shortcut_select').attr('log_attr');

        var log = $('.log input[name="id"][value="'+ logId +'"]').first();

        if(log.length > 0) {

            foundLog = true;
            log = log.parent();

        }else{
            var search_count = 0;
            while(foundLog !== true){
                if(search_count > max_search) {
                    break;
                }
                search_count +=1;
                //load logs until it appears
                page = page  + 1;
                loadLogs(page, false ,false);

                log = $('.log input[name="id"][value="'+ logId +'"]').first();
                if(log.length > 0) {

                    //exit loop
                    foundLog = true;
                    log = log.parent();
                    break;
                }
            }
        }
        if(foundLog){
            log.trigger('click');
            var loadlogsarea = $('#load_logs');
            loadlogsarea.animate(
                {scrollTop: loadlogsarea.scrollTop()+log.offset().top - log.height()*3 }, 'slow'
            );
        }else{

            //display an alert that the log was not found
            $('#modal_container').load(modalWindows + ' #shortcutErrorModal', function(response, status, xhr){
                $('#shortcutErrorModal').modal('toggle');
            });
        }

    })
}
