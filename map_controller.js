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
      action : new ActionModel(),
      store : Redux.createStore(reduce)
    };
    this.view = new MapView(this.model, canvas);

    var store = this.model.store;
    store.subscribe(function() {
      console.log(store.getState());
    });

    installListeners(this.model);
  };

  // Top-level Redux reducer.
  var reduce = function(state, action) {

    // Initialize state 
    state = state || {
      currentOperation: undefined,
      map: undefined,
      selection: undefined
    };

    // Calculate new state by having each reducer reduce its own bit.
    return {
      currentOperation: ActionModel.reduce(state.currentOperation, action),
      map: MapModel.reduce(state.map, action),
      selection: SelectionModel.reduce(state.selection, action)
    };
  };

  // Reducer for map data

  // Install listeners to update the map when actions are completed
  var installListeners = function(model) {
    var store = model.store;

    model.action.addListener(function(event, action, data) {

      // Did we just finish doing something?
      if (event === 'finish') {

        // Was it adding a room?
        if (action === 'add_room') {

          // Bail out if the room would have no area.
          if (data.width == 0 || data.height == 0) {
            // TODO: we'd like to cancel the event, but can't, as it's already finished.
            return;
          };
          model.store.dispatch({
            type: 'map.rooms.add',
            payload: data
          });

        } else if (action === 'add_door') {
          model.store.dispatch({
            type: 'map.doors.add',
            payload: data
          });

        } else {
          // We don't support whatever this is -- bail out.
          console.warn('Tried to finish unsupported action ' + action);
        }
      }
    });
  };

  // TODO: need to update this to work with Redux.
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
