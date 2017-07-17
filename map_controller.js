define([
    'jquery',
    'redux',
    'map_model',
    'selection_model',
    'action_model',
    'map_view'
  ],
function($, Redux, MapModel, SelectionModel, ActionModel, MapView) {
  // MVC implementation based on example at <https://alexatnet.com/articles/model-view-controller-mvc-javascript>

  var MapController = function(canvas) {
    this.model = {
      map: new MapModel([]),
      selection : new SelectionModel(),
      action : new ActionModel()
    };
    this.model.selection.doors = new SelectionModel();
    this.view = new MapView(this.model, canvas);


    var appendEvent = function(history, action) {
      if (history) {
        history.push(action);
        return history;
      } else {
        return [action];
      }
    }
    var store = Redux.createStore(appendEvent);
    store.subscribe(function() {
      console.log(store.getState());
    });
    this.model.store = store;

    installListeners(this.model);
  };

  // Install listeners to update the map when actions are completed
  var installListeners = function(model) {
    var map = model.map;
    var store = model.store;

    var finishAddingRoom = function(data) {
      var x = data.x,
          y = data.y,
          width = data.width,
          height = data.height;

      // Bail out if the room would have no area.
      if (width == 0 || height == 0) {
        // TODO: we'd like to cancel the event, but can't, as it's already finished.
        return;
      };


      // Width and height may be negative.
      // If so, convert them so (x, y) is the top-left corner.
      // TODO: why do I need to do so many checks here? Shouldn't the UI do things right to start with?
      if (width < 0) {
        width = -width;
        x = x - width;
      }
      if (height < 0) {
        height = -height;
        y = y - height;
      }

      model.map.addRoom(x, y, width, height);
    };

    var finishAddingDoor = function(data) {

      // TODO: do I want to validate anything here?
      // TODO: should addDoor let me pass in the parent room?
      var worked = model.map.addDoor(data.x, data.y, data.direction);

      if (worked === false) {
        // TODO: should I be using exceptions for this?
        console.warn('Failed to add door ' + data.direction + ' at (' + data.x + ', ' + data.y + ')');
      };
    }

    model.action.addListener(function(event, action, data) {

      store.dispatch({
        type: action + '-' + event,
        data: data
      });

      // Did we just finish doing something?
      if (event === 'finish') {

        // Was it adding a room?
        if (action === 'add_room') {
          finishAddingRoom(data);

        } else if (action === 'add_door') {
          finishAddingDoor(data);

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
