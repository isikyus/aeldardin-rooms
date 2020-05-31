define([
  'jquery'
],
function($) {
  // "Action model" -- tracks intermediate states of complex user actions (e.g. adding rooms).
  // Future work: also track past states, so we can support undo.

  var ActionModel = {};

  // Build a reducer that stores the intermediate state of the action
  // separately from the main "finished" state managed by the main
  // reducer.
  ActionModel.wrapReducer = function(baseReducer) {
    return function(state, action) {

      // Set initial state
      state = state || {
        state: undefined,
        pending: {
          action: undefined,
          state: undefined
        }
      };

      switch(action.type) {
        case 'action.stage':
          return {
            state: state.state,
            pending: {
              action: action.payload,
              state: baseReducer(state.state, action.payload)
            }
          };

        case 'action.finish':
          return {
            state: state.pending.state,
            pending: {

              // Set to null rather than undefined,
              // as we _know_ no action is going on.
              action: null,
              state: undefined
            }
          };

        case 'action.cancel':
          return {
            state: state.state,
            pending: {
              action: null,
              state: undefined
            }
          };

        default:
          return {
            state: baseReducer(state.state, action),
            pending: state.pending
          };
      }
    };
  };

  return ActionModel;
});