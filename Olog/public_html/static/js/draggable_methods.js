/*
 * Functions specific to draggable elements
 *
 * @author: Dena Mujtaba
 */

/**
 * Sets the load_logs area to accept a draggable object
 */
function setDroppableLogArea(){
    $("#load_log, .container-right").droppable({
        accept: '.log:not(.log_history, .log-child)',
        hoverClass: 'well_hover',
        tolerance: 'pointer',
        drop: function(event, ui) {
            ui.draggable.trigger('click');
            ui.helper.hide();
        }
    });
}

/**
 * Sets the logs as draggable elements
 */
function setLogDraggable(){
    if($(window).width() >= smallScreenResolutionWidth){
        $('.log:not(.log_history, .log-child)').draggable({
            appendTo: '#main-content-area',
            //containment: 'document',
            scroll: false,
            helper: 'clone',
            revert:true,
            start: function(e, ui)
            {
                $(ui.helper).addClass("ui-log-dragging").css('width', $(this).width());
            }
        });
    }

}

/**
 * Sets a multilist to accept droppable log items
 * @param listname The list element to set
 */
function setMultilistDroppable(listname){
    $(listname).droppable({
        accept: '.log:not(.log_history, .log-child)',
        hoverClass: 'multilist-drop-hover',
        tolerance: 'pointer',
        drop: function(event, ui){
            addToShortcuts($(this), ui.draggable);
            ui.helper.hide();
        }
    })
}

