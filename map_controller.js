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
      store : Redux.createStore(reduce)
    };
    this.view = new MapView(this.model, canvas);

    var store = this.model.store;
    store.subscribe(function() {
      console.log(store.getState());
    });
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
      map: ActionModel.wrapReducer(MapModel.reduce)(state.map, action),
      selection: SelectionModel.reduce(state.selection, action)
    };
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
