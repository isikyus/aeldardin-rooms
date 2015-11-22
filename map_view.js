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
  };

  return MapView;
});