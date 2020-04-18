define([
    'jquery',
    'redux',
    'reducer/map',
    'reducer/selection',
    'reducer/action',
    'map_view'
  ],
function($, Redux, Map, Selection, Action, MapView) {
  // MVC implementation based on example at <https://alexatnet.com/articles/model-view-controller-mvc-javascript>

  var MapController = function(canvas) {
    this.store = Redux.createStore(reduce);
    var store = this.store;
    this.view = new MapView(store, canvas);

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
      map: Action.wrapReducer(Map.reduce)(state.map, action),
      selection: Selection.reduce(state.selection, action)
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
