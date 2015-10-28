define([
    'jquery',
    'map_model',
    'map_view'
  ],
function($, MapModel, MapView) {
  // MVC implementation based on example at <https://alexatnet.com/articles/model-view-controller-mvc-javascript>

  var MapController = function(canvas) {
    this.model = new MapModel([]);
    this.view = new MapView(this.model, canvas);
  };

  MapController.prototype = {
    load : function(path) {

      $.getJSON(path, function(mapData) {
        this.useData(mapData);
      }).fail(function() {
        console.log('Could not load map from ' + path);
        $(canvas).children().unwrap();
      });
    },
    useData : function(mapData) {
      this.model.setRooms(mapData);
    }
  };

  return MapController;
});