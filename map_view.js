define([
    'jquery',
    'canvas_renderer',
    'text_renderer'
  ],
function($, canvasRenderer, textRenderer) {

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
      var toDelete = [];
      $.each(model.map.getRooms(), function(_index, room) {
        if (model.selection.isSelected(room.id)) {
          toDelete.push(room);
        }
      });
      $.each(toDelete, function(_index, room) { model.map.removeRoom(room); });
    });

    $toolbar.find('#add_room').on('click', function() {

      model.action.start('add_room', { x : 0, y : 0, width: 1, height: 1 });
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
      canvasRenderer.addListeners(canvas, model, textContext);
    };

    model.map.addRoomsListener(function(_map) {
      render(model);
    });
    model.selection.addListener(function(_map) {
      render(model);
    });
    model.action.addListener(function(event, action, state) {

      // Re-draw the model to erase any existing partial state.
      render(model);

      if (event === 'start' || event === 'update') {
        canvasRenderer.renderInteraction(action, state, graphicsContext);
        textRenderer.renderInteraction(action, state, textContext);

      } else if (event !== 'finish' && event !== 'cancel') {
        console.warn('Unexpected event type (not start, update, finish, or cancel):');
        console.warn([event, action, state]);
      };
    });
  };

  return MapView;
});