define([
    'jquery',
    'canvas_renderer',
    'text_renderer'
  ],
function($, canvasRenderer, textRenderer) {
  // MVC implementation based on example from <https://alexatnet.com/articles/model-view-controller-mvc-javascript>

  var MapView = function(model, canvas) {
    var graphicsContext = canvas.getContext('2d');
    var textContext = $('<div>');
    $(canvas).after(textContext);

    textRenderer.addListeners(textContext, model);

    model.addRoomsListener(function(map) {
      canvasRenderer.render(map, graphicsContext);
      textRenderer.render(map, textContext);
      canvasRenderer.addListeners(canvas, model);
    });
  };

  return MapView;
});