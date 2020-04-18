define([
    'jquery',
    'canvas_renderer',
    'text_renderer',
    'reducer/selection'
  ],
function($, canvasRenderer, textRenderer, Selection) {

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
  var addToolbarListeners = function($toolbar, store) {
    $toolbar.find('#delete_selection').on('click', function() {

      var state = store.getState();
      var roomIdsToDelete = Selection.selectedIds(state.selection, 'room');
      store.dispatch({
        type: 'map.rooms.remove',
        payload: { roomIds: roomIdsToDelete }
      });

      var doorIdsToDelete = Selection.selectedIds(state.selection, 'door');
      store.dispatch({
        type: 'map.doors.remove',
        payload: { doorIds: doorIdsToDelete }
      });

      // Clear selection now we've deleted everything that was in it.
      store.dispatch({ type: 'selection.clear' });
    });

    $toolbar.find('#add_room').on('click', function() {

      store.dispatch({
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

  var MapView = function(store, canvas) {
    var graphicsContext = canvas.getContext('2d');
    var toolbar = buildToolbar();
    var textContext = $('<div>');
    $(canvas).before(toolbar);
    $(canvas).after(textContext);

    addToolbarListeners(toolbar, store);
    textRenderer.addListeners(textContext, store);

    var render = function(store) {
      canvasRenderer.render(store, graphicsContext);
      textRenderer.render(store, textContext);
      canvasRenderer.addListeners(canvas, store);
    }

    store.subscribe(function() {
      render(store);
    });

    render(store);
  };

  return MapView;
});
