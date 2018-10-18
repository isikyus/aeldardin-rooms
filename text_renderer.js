// Render a map to a <div>, as a text description.

define([
    'jquery',
    'map_model',
    'room',
    'selection_model',
    'text_renderer/templates'
  ],
function($, MapModel, Room, SelectionModel, templates) {

  var feetPerSquare = 5;

  // Preprocess data to be rendered into templates.
  var roomInfo = function(model, room) {
    var state = model.store.getState();
    return {
      key    : room.key,
      id     : room.id,
      exits  : exitInfo(state, room),
      height : room.height * feetPerSquare,
      width  : room.width * feetPerSquare,
      selected : SelectionModel.selectedIds(state.selection, 'room').includes(room.id)
    }
  }

  var exitInfo = function(state, room) {
    var exits = MapModel.exits(state.map)[room.id];

    exits.forEach(function(exit) {
      exit.selected = SelectionModel.selectedIds(state.selection, 'door').includes(exit.door.id);
    });
    return exits;
  };

  /*
   * Renders the map as a list of text room descriptions.
   */
  var render = function(model, container) {
    var $container = $(container);

    $container.empty();
    $.each(model.store.getState().map.rooms, function(index, room) {
      $container.append(templates.room(roomInfo(model, room)));
    });
  };

  /*
   * Renders a form for editing the intermediate state of an action.
   */
  var renderInteraction = function(model, action, state, container) {

    if (action === 'add_room') {
      renderAddRoom(model, state, container);
    } else if (action === 'add_door') {
      renderAddDoor(model, state, container);
    } else {
      console.warn('unexpected action ' + action);
    }
  };

  var renderAddRoom = function(model, state, container) {
    var $container = $(container);

    // Use the existing edit form, if present; otherwise, add it.
    var editRoomForm = $container.find('#js-edit-room');
    if (editRoomForm.length === 0) {
      editRoomForm = $(templates.createRoom());
    }

    // Set X, Y, Width, and Height based on the action state.
    editRoomForm.find('#new-room-x').val(state.x);
    editRoomForm.find('#new-room-y').val(state.y);
    editRoomForm.find('#new-room-width').val(state.width);
    editRoomForm.find('#new-room-height').val(state.height);

    // Make sure the form is visible.
    $container.prepend(editRoomForm);
  };

  var renderAddDoor = function(model, state, container) {
    var $container = $(container);

      // Insert form if necessary.
      var $addDoorForm = $container.find('#js-add_door_form');
      if ($addDoorForm.length === 0) {
          $addDoorForm = $(templates.addDoor());
      }

      // Fill in the form based on the action state.
      $addDoorForm.find('#js-room-for-door').text('(in room ' + state.room.key + ')');
      $addDoorForm.find('#new-door-direction').val(state.direction);

      // Fill in possible positions.
      // TODO: only do this if the direction has changed.
      var $positionSelect = $addDoorForm.find('#new-door-position')
      $positionSelect.empty();

      // Load the current version of the room data.
      var room = findByUniqueId(model.store.getState().map.rooms, 'id', state.room.id);
      var wall = Room.walls(room)[state.direction];
      if (wall) {

          for(var i = 0; i < wall.length; i++) {
              var option = $('<option />');
              var humanDistance = feetPerSquare * i;
              var value = i + parseInt(wall.start, 10);

              option.attr('value', value);

              // Make sure the option corresponding to the proposed door position is selected.
              if (value === state[wall.parallelAxis]) {
                  option.attr('selected', 'selected');
              }

              // TODO: it would be nice to have more readable options, and pick the most suitable one.
              // ("in the centre", "east corner", "5 feet from south", etc.)
              option.text(humanDistance + ' feet from ' + wall.runsFrom);

              $positionSelect.append(option);
          }
      } else {
          console.warn('Unexpected door direction: ' + state.direction);
      }

      $container.prepend($addDoorForm);
  };

  // Takes a list of objects, and a field name and value to look for.
  // Returns the one object maching that field, or reports an error
  // if there is more than/less than one match.
  var findByUniqueId = function(list, idField, idValue) {
    var matches = $.grep(list, function(element) {
      return element[idField] === idValue;
    });

    if (matches.length === 0) {
      throw 'Nothing found matching ' + idValue + ' in ' + list;

    } else {
      if (matches.length > 1) {
        throw 'Found several matches for ' + idValue + ' in ' + list;
      }

      return matches[0];
    }
  };

  // Takes a element within a room div, finds the room key for that div, and uses it to look up the room itself.
  // Returns the Room on success, or nul on failure.
  var findRoomForElement = function(model, element) {
    var id = $(element).closest('div.edit-room').data('room-id');
    return findByUniqueId(model.store.getState().map.rooms, 'id', id);
  }

  /*
   * Adds event listeners to an element the map will be rendered into.
   * The given model instance will be updated in response to events.
   */
  var addListeners = function(container, model) {
    var $container = $(container);

    $container.on('click', '.js-select-checkbox', function(event) {
      var $checkbox = $(this),
          objectType = $checkbox.data('select-type'),
          objectId = $checkbox.data('select-id'),
          actionType = $checkbox.is(':checked') ? 'selection.deselect' : 'selection.select';

      model.store.dispatch({
        type: actionType,
        payload: {
          type: objectType,
          id: id
        }
      });
    });

    $container.on('click', '.js-add_door', function(event) {
      var room = findRoomForElement(model, this);
      if (room !== null) {
        model.action.start('add_door', { room: room, x: null, y: null, direction: null});
      }
    });

    // Fire update events as the edit form contents change.
    $container.on('change', '#js-edit-room input', function(_event) {

      if (model.action.action === 'add_room') {

        var $editRoomForm = $('#js-edit-room');
        var roomProperties = {
          x : parseInt($editRoomForm.find('#new-room-x').val(), 10),
          y : parseInt($editRoomForm.find('#new-room-y').val(), 10),
          width : parseInt($editRoomForm.find('#new-room-width').val(), 10),
          height : parseInt($editRoomForm.find('#new-room-height').val(), 10)
        };
        model.action.update(roomProperties);
      } else {
        console.warn('Tried to work on adding room when not in that state');
      }
    });

    // Fire update events as the add-door form changes.
    $container.on('change', '#js-add_door_form select', function(_event) {

      if (model.action.action === 'add_door') {

        var $addDoorForm = $('#js-add_door_form');
        var direction = $addDoorForm.find('#new-door-direction').val();
        var room = model.action.actionData.room;

        // TODO: need separate tests for these calculations.

        var newDoorPosition = parseInt($addDoorForm.find('#new-door-position').val(), 10);
        var newDoorX, newDoorY;
        if (direction === 'north' || direction === 'south') {

            // Make sure position is set if direction is known, since it will look set in the form.
            newDoorX = newDoorPosition || room.x;
            newDoorY = (direction === 'north') ? room.y : room.y + room.height - 1;

        } else if (direction === 'east' || direction === 'west') {
            newDoorX = (direction === 'west') ? room.x: room.x + room.width - 1;

            // Again, make sure we set position.
            newDoorY = newDoorPosition || room.y;

        } else {

            // Don't know direction yet, so we can't define the door.
            newDoorX = null;
            newDoorY = null;
        }

        model.action.update({room: room, direction : direction, x: newDoorX, y: newDoorY });
      } else {
        console.warn('Tried to work on adding door when not in that state');
      }
    });

    // Handle action submit buttons (adding rooms or doors).
    $container.on('click', 'button[data-finish-action]', function(_event) {
      var action = $(this).data('finish-action');
      if (model.action.action === action) {
        model.action.finish(action);
      } else {
        console.warn('Tried to finish action "' + action + '" when it was not in progress');
      }
    });
  };

  return {
    render : render,
    renderInteraction : renderInteraction,
    addListeners : addListeners
  };
});
