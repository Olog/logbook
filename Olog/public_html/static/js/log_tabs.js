/*
 * Setup required for switchable log tabs
 *
 * @author: Dena Mujtaba
 */

$(document).ready(function(){

    //set the previously opened logs

    setTabClickHandler();

    //handle event that a new log is being added as a tab
    $('#logs-tabs-area').on('logOpened', function(e, logData, logId){
        handleLogTab(logData, logId);
    });

});

/**
 * Sets the tab click handlers
 */
function setTabClickHandler(){
    //click event to open a tab
    $('.log-tab').click(function(){
        var logId = $(this).attr('log-id-attr');

        if(logId !== undefined){
            openTab(tabbedLogs[logId], logId);
        }

    });

    //delete log tab event
    $('.close-tab').click(function(e){

        var logTab = $(e.target).parent(); //the tab itself

        if(logTab.hasClass('close-tab')){
            logTab = logTab.parent();
        }

        delete tabbedLogs[logTab.attr('log-id-attr')];

        logTab.remove();

        e.stopPropagation();

    });
}

/**
 * Sets the given tab with logId as active
 * @param id logId
 */
function setActiveTab(id){
    $('.log-tab[log-id-attr="'+id+'"]').first().addClass('opened');
    $('.log-tab[log-id-attr!="'+id+'"]').removeClass('opened');
}
/**
 * Function to open a tab
 * @param log Log to open
 * @param id Id of log to open
 */
function openTab(log, id){
    showLog(log, id);
    setActiveTab(id);
}

/**
 * Create a new tab/ open a previous one for a log with given ID
 * @param {type} log log object
 * @param id id of the log in saved logs array
 */
function handleLogTab(log, id){
    if(log === undefined){
        return;
    }else{
        //check if newly opened log tab or previously saved
        if(id in tabbedLogs){
            //already saved, pass to function to open the tab
            openTab(log, id);

        }else{
            //set the new tab and log object to the tabbedLogs
            tabbedLogs[id] = log;

            //create the template
            var template = getTemplate("log_tab_template");

            var item = {
                rawId: id,
                owner: log.owner,
                createdAt: formatDate(log.modifiedDate),
                openedClass: 'opened'
            };

            var html = Mustache.to_html(template, item);

            //add tab to the list of tabs
            $('#logs-tabs-area').append(html);
            setTabClickHandler();

            setActiveTab(id);

        }

    }
}