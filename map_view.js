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

    var render = function(model) {
      canvasRenderer.render(model, graphicsContext);
      textRenderer.render(model, textContext);
      canvasRenderer.addListeners(canvas, model);
    };

    model.map.addRoomsListener(function(_map) {
      render(model);
    });
    //model.selection.addListener(function(_map) {
    //  render(model);
    //});
  };

  return MapView;
});