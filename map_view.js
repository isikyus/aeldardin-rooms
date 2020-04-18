define([
    'jquery',
    'canvas_renderer',
    'text_renderer',
    'selection_model'
  ],
function($, canvasRenderer, textRenderer, SelectionModel) {

  /*
   * Generates toolbar buttons (which apply to both the text and HTML view).
   */
  var buildToolbar = function() {
    var toolbarHtml = '<div id="toolbar">' +
        '<button id="delete_selection">Delete</button>' +
        '<button id="add_room">Add Room</button>' +
      '</div>';
    return $(toolbarHtml);
  };

  /*
   * Adds event listeners for the toolbar buttons.
   *
   *@param $toolbar The toolbar div, as a jQuery object (hence the $).
   */
  var addToolbarListeners = function($toolbar, model) {
    $toolbar.find('#delete_selection').on('click', function() {

      // TODO: it would probably be more efficient to get the list of selected rooms from the selection model.
      var state = model.store.getState();
      var roomIdsToDelete = SelectionModel.selectedIds(state.selection, 'room');
      model.store.dispatch({
        type: 'map.rooms.remove',
        payload: { roomIds: roomIdsToDelete }
      });

      var doorIdsToDelete = SelectionModel.selectedIds(state.selection, 'door');
      model.store.dispatch({
        type: 'map.doors.remove',
        payload: { doorIds: doorIdsToDelete }
      });

      // Clear selection now we've deleted everything that was in it.
      model.store.dispatch({ type: 'selection.clear' });
    });

    $toolbar.find('#add_room').on('click', function() {

      model.store.dispatch({
        type: 'action.stage',
        payload: {
          type: 'map.rooms.add',
          payload: {
            x: 0,
            y: 0,
            width: 1,
            height: 1
          }
        }
      });
    });
  };

  // MVC implementation based on example from <https://alexatnet.com/articles/model-view-controller-mvc-javascript>

  var MapView = function(model, canvas) {
    var graphicsContext = canvas.getContext('2d');
    var toolbar = buildToolbar();
    var textContext = $('<div>');
    $(canvas).before(toolbar);
    $(canvas).after(textContext);

    addToolbarListeners(toolbar, model);
    textRenderer.addListeners(textContext, model);

    var render = function(model) {
      canvasRenderer.render(model, graphicsContext);
      textRenderer.render(model, textContext);
      canvasRenderer.addListeners(canvas, model);
    }

    model.store.subscribe(function() {
      render(model);
    });

    render(model);
  };

  return MapView;
});
