define([
    'jquery',
    'map_model',
    'selection_model',
    'map_view'
  ],
function($, MapModel, SelectionModel, MapView) {
  // MVC implementation based on example at <https://alexatnet.com/articles/model-view-controller-mvc-javascript>

  var MapController = function(canvas) {
    this.model = {
      map: new MapModel([]),
      selection : new SelectionModel()
    };
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
      this.model.map.setRooms(mapData);
    }
  };

  return MapController;
});