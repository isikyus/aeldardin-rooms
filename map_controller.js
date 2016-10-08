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
    this.model.selection.doors = new SelectionModel();
    this.view = new MapView(this.model, canvas);

    // When actions are completed, apply the results to the map.
    var model = this.model;
    model.action.addListener(function(event, action, data) {

      // Did we just finish doing something?
      if (event === 'finish') {

        // Was it adding a room (only thing we know how to hande now?)
        if (action === 'add_room') {

          // Width and height may be negative.
          // If so, convert them so x, y is the top-left corner.
          var x = data.x, y = data.y, width = data.width, height = data.height;

          // Bail out if the room would have no area.
          if (width == 0 || height == 0) {
            // TODO: we'd like to cancel the event, but can't, as it's already finished.
            return;
          };

          if (width < 0) {
            width = -width;
            x = x - width;
          }
          if (height < 0) {
            height = -height;
            y = y - height;
          }

          model.map.addRoom(x, y, width, height);
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