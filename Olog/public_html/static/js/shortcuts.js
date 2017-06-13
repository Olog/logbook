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
 * @param elem The element to add to the list of shortcuts
 * @param isTimestamp If it is a timestamp, not a log object
 */
function addToShortcuts(list, elem, isTimestamp=false){
    var logid = "";
    var createdAt = "";
    var namee = "" ;
    var template = "";
    var shortcuttype = "timestamp";

    if(isTimestamp){
        logid = elem;
        createdAt = elem;
        namee = "" ;
        template = getTemplate("template_shortcut");
    }else{
        logid = elem.find('input[name="rawIdVal"]').first().val();
        createdAt = elem.find('.log_createdat_date').first().text();
        namee = elem.find('.log_header').first().text() ;
        template = getTemplate("template_shortcut");
        shortcuttype = "log";
    }

    var html = Mustache.to_html(template, {
        createdAt:createdAt ,
        name: namee,
        logid: logid,
        shortcuttype: shortcuttype
    });

    list.append(html);

    //set readonly elems again
    setReadOnly(inReadOnly);

    if(ologSettings.logShortcuts !== undefined){
        if(ologSettings.logShortcuts[logid] === undefined){
            ologSettings.logShortcuts[logid] = {
                timestamp: isTimestamp,
                logId: logid,
                createdAt: createdAt,
                name: namee
            };
        }
    }else{
        ologSettings.logShortcuts = {};
        ologSettings.logShortcuts[logid] = {
            timestamp: isTimestamp,
            logId: logid,
            createdAt: createdAt,
            name: namee
        };
    }

    //save the log shortcut data
    saveOlogSettingsData(ologSettings);
    setShortcutBtnEvents();
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
            var shortcutType = "log";

            if(values.timestamp){
                var shortcutType = "timestamp";
            }
            var html = Mustache.to_html(template, {
                createdAt: values.createdAt,
                name: values.name,
                logid: values.logId,
                shortcuttype: shortcutType
            });

            list.append(html);
        });

        //set readonly elems again
        setReadOnly(inReadOnly);
        setShortcutBtnEvents();
        handleShortcutClick();
    }
    list.attr('load_shortcuts', true);
    list.trigger('dataloaded');
}

/**
 * Declared the event handler for removing items from the shortcuts list
 */
function setShortcutBtnEvents(){
    $('.log_shortcut_select').click(function(e){
        var elem = $(this).parent().parent();
        delete ologSettings.logShortcuts[$(this).attr('log_attr')];
        saveOlogSettingsData(ologSettings);
        elem.fadeOut('slow', function() {
            $(this).remove();
        });

        e.stopPropagation();
    });

    $('.logcreatedat').click(function(e){

        findInDateRange($(e.target), 1);
        fromToChanged();

        //find the log in the logs
        //e.stopPropagation();
    });
}

/**
 * Enters the To- From range for a selected logbook date
 * @elem Element to get data from
 * @param days Number of days to search between
 */
function findInDateRange(elem, days){
    var dat = new Date(elem.text());
    var futureDate = new Date(dat.setDate(dat.getDate() + days));
    var prevDate = new Date(dat.setDate(dat.getDate() - 2*days));

    //set to the datepickers
    $('#datepicker_from').val(moment(prevDate).format('MM/DD/YYYY HH:mm'));
    $('#datepicker_to').val(moment(futureDate).format('MM/DD/YYYY HH:mm'));
}

/**
 * Set the click event handler on the shortcut items
 */
function handleShortcutClick() {
    $('.list6[shortcut-type="log"]').click(function () {
        var foundLog = false;

        var logId = $(this).find('a.log_shortcut_select').attr('log_attr');

        var log = $('.log input[name="rawIdVal"][value="' + logId + '"]').first();

        if (log.length > 0) {

            foundLog = true;
            log = log.parent();

        } else {
            var search_count = 0;
            while (foundLog !== true) {
                if (search_count > max_search) {
                    break;
                }
                search_count += 1;
                //load logs until it appears
                page = page + 1;
                loadLogs(page, false, false);

                log = $('.log input[name="rawIdVal"][value="' + logId + '"]').first();
                if (log.length > 0) {

                    //exit loop
                    foundLog = true;
                    log = log.parent();
                    break;
                }
            }
        }
        if (foundLog) {
            log.trigger('click');
            var loadlogsarea = $('#load_logs');
            loadlogsarea.animate(
                {scrollTop: loadlogsarea.scrollTop() + log.offset().top - log.height() * 3}, 'slow'
            );
        } else {

            //display an alert that the log was not found
            $('#modal_container').load(modalWindows + ' #shortcutErrorModal', function (response, status, xhr) {
                $('#shortcutErrorModal').modal('toggle');
            });
        }

    });

    $('.list6[shortcut-type="timestamp"]').click(function (e) {
        findInDateRange($(e.target), 1);
        fromToChanged();
    });
}

/**
 * Function to handle the addition of a shortcut through a timestamp form
 */
function createShortcutHandler(){
    //get the value from the datetimepicker
    var timeVal = $('#new_shortcut_timestamp').val();

    if(isValidShortcut(timeVal)){
        addToShortcuts($('#load_shortcuts').first(), timeVal, true);
        $('#myShortcutModal').modal("hide");

    }
}

/**
 * Check if a shortcut is value
 * @param shortcut Timestamp for shortcut
 * @returns {boolean}
 */
function isValidShortcut(shortcut){
    var errorBlock = $('#new_logbook_error_block');
    var errorX = $('#new_logbook_error_x');
    var errorBody = $('#new_logbook_error_body');

    errorX.click(function(e){
        errorBlock.hide("fast");
    });

    var errorString = "";

    // Check data
    if(shortcut ===undefined || shortcut.length === 0 || shortcut === "") {
        errorString += "Shortcut timestamp cannot be blank!<br/>";
    }

    if(errorString.length === 0) {
        return true;

    } else {
        errorBody.html(errorString);
        errorBlock.show("fast");
        return false;
    }
}