define([
    'jquery',
    'map_model',
    'selection_model',
    'action_model',
    'map_view'
  ],
function($, MapModel, SelectionModel, ActionModel, MapView) {
  // MVC implementation based on example at <https://alexatnet.com/articles/model-view-controller-mvc-javascript>

  var MapController = function(canvas) {
    this.model = {
      map: new MapModel([]),
      selection : new SelectionModel(),
      action : new ActionModel()
    };
    this.view = new MapView(this.model, canvas);

    // When actions are completed, apply the results to the map.
    var model = this.model;
    model.action.addListener(function(event, action, data) {

      // Did we just finish doing something?
      if (event === 'finish') {

        // Was it adding a room (only thing we know how to hande now?)
        if (action === 'add_room') {

          // Add the room to the model.
          model.map.addRoom(data.x, data.y, data.width, data.height);
        } else {

          // We don't support whatever this is -- bail out.
          console.warn('Tried to finish unsupported action ' + action);
        }
      }
    });
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