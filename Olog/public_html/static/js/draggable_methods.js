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
        accept: '.log:not(.log_history)',
        hoverClass: 'well_hover',
        drop: function(event, ui) {
            console.log('accepted');
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