// Render a map to a <div>, as a text description.

define([
    'jquery',
    'handlebars',
  ],
function($, Handlebars) {

  var feetPerSquare = 5;

  //(function() {
    var doorTypeNames = {
      door      : 'door',
      arch      : 'archway',
      secret    : 'secret door',
      open      : 'opening',
      porticullis : 'porticullis'
    };

    Handlebars.default.registerHelper('displayDoorType', function(door) {
      return doorTypeNames[door];
    });
  //})();

  var rawRoomTemplate = "" +
    '<div class="room" id="room_{{id}}_data">' +
      '<h3><a id="room_{{id}}">Room {{key}}</a></h3>' +
      '<p>' +
        'A bare room. ' +
        'It measures {{height}} feet north-to-south, ' +
        'and {{width}} feet east-to-west' +
      '</p>' +
      '<p>' +
        'There are {{exits.length}} exits:' +
      '</p>' +
      '<ol class="exits">' +
        '{{#each exits}}' +
          '<li id="door_{{door.id}}" class="js-door" data-door-id="{{door.id}}">' +
            '<label>' +
              '<input type="checkbox" id="select_door_{{door.id}}"' +
                  ' class="js-select-door-checkbox"' +
                  ' {{#if door.selected}}checked{{/if}} />' +
              // TODO: this is wrong -- the door direction may need reversing if it belongs to a square in the other room.
              'A {{displayDoorType door.style}} in the {{door.direction}} wall, ' +
              'leading to <a href="#room_{{room.id}}">Room {{room.key}}</a>.' +
            '</label>' +
          '</li>' +
        '{{/each}}' +
      '</ol>' +
      '<div class="edit-room" data-room-key="{{key}}">' +
        '<p class="select-room"><label>'+
          '<input type="checkbox" id="select_room_{{id}}" class="js-select-checkbox"' +
            ' {{#if selected}}checked{{/if}}/>' +
          'Select' +
        '</label></p>' +
        '<button class="js-remove-room">Remove</button>' +
        '<button class="js-add_door">Add Door</button>' +
      '</div>' +
    '</div>'
  var roomTemplate = Handlebars.default.compile(rawRoomTemplate);

  var rawCreateTemplate = '' +
    '<div class="edit-room" id="js-edit-room">' +
      '<h3>New Room</h3>' +
      '<p>' +
        '<label for="new-room-x">X (east-west) position of north-west corner</label>' +
        '<input type="number" id="new-room-x"/>' +
      '</p>' +
      '<p>' +
        '<label for="new-room-y">Y (north-south) position of north-west corner</label>' +
        '<input type="number" id="new-room-y"/>' +
      '</p>' +
      '<p>' +
        '<label for="new-room-width">East-West size</label>' +
        '<input type="number" id="new-room-width"/>' +
      '</p>' +
      '<p>' +
        '<label for="new-room-height">North-South size</label>' +
        '<input type="number" id="new-room-height"/>' +
      '</p>' +
      '<p>' +
        '<button id="submit-add-room">Add Room</button>' +
    '</div>'
  //var createTemplate = Handlebars.default.compile(rawCreateTemplate);

  var rawAddDoorTemplate = '' +
    '<div class="add-door" id="js-add_door_form">' +
      '<h3>Add Door</h3>' +
      '<p id="js-room-for-door"></p>' +
      '<p>' +
        '<label for="new-door-direction">On which wall?</label>' +
        '<select id="new-door-direction">' +
          '<option value=""></option>' +
          '<option value="north">North</option>' +
          '<option value="south">South</option>' +
          '<option value="east">East</option>' +
          '<option value="west">West</option>' +
        '</select>' +
      '</p>' +
      '<p>' +
        '<label for="new-door-position">Where on that wall?</label>' +
        '<select id="new-door-position" class="hide"></select>' +
      '</p>' +
    '</div>'

  var roomInfo = function(model, room) {
    return {
      key    : room.key,
      id     : room.id,
      exits  : model.map.exits(room),
      height : room.height * feetPerSquare,
      width  : room.width * feetPerSquare,
      selected : model.selection.isSelected(room.id)
    }
  }

  /*
   * Renders the map as a list of text room descriptions.
   */
  var render = function(model, container) {
    var $container = $(container);

    $container.empty();
    $.each(model.map.getRooms(), function(index, room) {
      $container.append(roomTemplate(roomInfo(model, room)));
    });
  };

  /*
   * Renders a form for editing the intermediate state of an action.
   */
  var renderInteraction = function(action, state, container) {
    var $container = $(container);

    if (action == 'add_room') {
      // We are creating a room.

      // Use the existing edit form, if present; otherwise, add it.
      var editRoomForm = $container.find('#js-edit-room');
      if (editRoomForm.length == 0) {
        editRoomForm = $(rawCreateTemplate);
      };

      // Set X, Y, Width, and Height based on the action state.
      editRoomForm.find('#new-room-x').val(state.x);
      editRoomForm.find('#new-room-y').val(state.y);
      editRoomForm.find('#new-room-width').val(state.width);
      editRoomForm.find('#new-room-height').val(state.height);

      // Make sure the form is visible.
      $container.prepend(editRoomForm);

    } else if (action == 'add_door') {

        // Insert form if necessary.
        var $addDoorForm = $container.find('#js-add_door_form');
        if ($addDoorForm.length === 0) {
            $addDoorForm = $(rawAddDoorTemplate);
        };

        // Fill in the form based on the action state.
        $addDoorForm.find('#js-room-for-door').text('(in room ' + state.room.key + ')');
        $addDoorForm.find('#new-door-direction').val(state.direction);

        // Fill in possible positions.
        // TODO: only do this if the direction has changed.
        var $positionSelect = $addDoorForm.find('#new-door-position')
        $positionSelect.empty();

        if (state.direction) {
            var startCorner, endCorner, start, range, selectedPosition;

            // Available positions depend on the door direction.
            if (state.direction === 'north' || state.direction === 'south') {
                startCorner = 'west';
                endCorner = 'east';
                start = state.room.x;
                range = state.room.width;
                selectedPosition = state.x;

            } else if (state.direction == 'east' || state.direction === 'west') {
                startCorner = 'north';
                endCorner = 'south';
                start = state.room.y;
                range = state.room.height;
                selectedPosition = state.y;

            } else {
                console.warn('Unexpected door direction: ' + state.direction);
            }

            for(var i = 0; i < range; i++) {
                var option = $('<option />');
                var humanDistance = feetPerSquare * i;
                var value = i + start;

                option.attr('value', value);

                if (value === selectedPosition) {
                    option.attr('selected', 'selected');
                }

                // TODO: it would be nice to have more readable options, and pick the most suitable one.
                // ("in the centre", "east corner", "5 feet from south", etc.)
                option.text(humanDistance + ' feet from ' + startCorner);

                $positionSelect.append(option);
            }

        }

        $container.prepend($addDoorForm);

    } else {
      console.warn('unexpected action ' + action);
    };
  };

  /*
   * Adds event listeners to an element the map will be rendered into.
   * The given model instance will be updated in response to events.
   */
  var addListeners = function(container, model) {
    var $container = $(container);

    $container.on('click', '.js-remove-room', function(event) {
      var key = $(this).closest('div.edit-room').data('room-key');
      var matchingRooms = $.grep(model.map.getRooms(), function(room) {
        return room.key === key;
      });

      if (matchingRooms.length === 0) {
        console.log('No rooms found matching key: ' + key);
      } else {
        if (matchingRooms.length > 1) {
          console.log('Found several rooms for ' + key + '; removing only the first:');
          console.log(matchingRooms);
        }

        model.map.removeRoom(matchingRooms[0]);
      };
    });

    $container.on('click', '.js-select-checkbox', function(event) {
      var key = $(this).closest('div.edit-room').data('room-key');
      var matchingRooms = $.grep(model.map.getRooms(), function(room) {
        return room.key === key;
      });

      if (matchingRooms.length === 0) {
        console.log('No rooms found matching key: ' + key);
      } else {
        if (matchingRooms.length > 1) {
          console.log('Found several rooms for ' + key + '; selecting/deselecting only the first:');
          console.log(matchingRooms);
        }

        if ($(this).is(':checked')) {
          model.selection.select(matchingRooms[0].id);
        } else {
          model.selection.deselect(matchingRooms[0].id);
        }
      };
    });

    $container.on('click', '.js-select-door-checkbox', function(event) {
      var id = $(this).closest('li.js-door').data('door-id');
      var matchingDoors = $.grep(model.map.getDoors(), function(door) {
        return door.id === id;
      });

      if (matchingDoors.length === 0) {
        console.log('No doors found matching key: ' + key);
      } else {
        if (matchingDoors.length > 1) {
          console.log('Found several doors for ' + key + '; selecting/deselecting only the first:');
          console.log(matchingDoors);
        }

        if ($(this).is(':checked')) {
          model.selection.doors.select(matchingDoors[0].id);
        } else {
          model.selection.doors.deselect(matchingDoors[0].id);
        }
      };
    });

    // Fire update events as the edit form contents change.
    $container.on('change', '#js-edit-room input', function(_event) {

      if (model.action.action === 'add_room') {

        var $editRoomForm = $('#js-edit-room');
        var roomProperties = {
          x : $editRoomForm.find('#new-room-x').val(),
          y : $editRoomForm.find('#new-room-y').val(),
          width : $editRoomForm.find('#new-room-width').val(),
          height : $editRoomForm.find('#new-room-height').val()
        };
        model.action.update(roomProperties);
      } else {
        console.warn('Tried to work on adding room when not in that state');
      };
    });

    $container.on('click', '#submit-add-room', function(_event) {
      if (model.action.action === 'add_room') {
        model.action.finish('add_room');
      } else {
        console.warn('Tried to finish adding room when not in that state');
      };
    });

    $container.on('click', '.js-add_door', function(event) {
      var key = $(this).closest('div.edit-room').data('room-key');
      var matchingRooms = $.grep(model.map.getRooms(), function(room) {
        return room.key === key;
      });

      if (matchingRooms.length === 0) {
        console.log('No rooms found matching key: ' + key);
      } else {
        if (matchingRooms.length > 1) {
          console.log('Found several rooms for ' + key + '; removing only the first:');
          console.log(matchingRooms);
        }

        model.action.start('add_door', { room: matchingRooms[0], x: null, y: null, direction: null});
      };
    });

    // Fire update events as the add-door form changes.
    $container.on('change', '#js-add_door_form select', function(_event) {

      if (model.action.action === 'add_door') {

        var $addDoorForm = $('#js-add_door_form');
        var direction = $addDoorForm.find('#new-door-direction').val();
        var room = model.action.actionData.room;

        var newDoorX, newDoorY;
        if (direction === 'north' || direction === 'south') {
            newDoorX = parseInt($addDoorForm.find('#new-door-position').val(), 10);
            newDoorY = (direction === 'north') ? room.y : room.y + room.height;

        } else if (direction === 'east' || direction === 'west') {
            newDoorX = (direction === 'west') ? room.x : room.x + room.width;
            newDoorY = parseInt($addDoorForm.find('#new-door-position').val(), 10);

        } else {

            // Don't know direction yet, so we can't define the door.
            newDoorX = null;
            newDoorY = null;
        }

        model.action.update({room: room, direction : direction, x: newDoorX, y: newDoorY });
      } else {
        console.warn('Tried to work on adding door when not in that state');
      };
    });
  };

  return {
    render : render,
    renderInteraction : renderInteraction,
    addListeners : addListeners
  };
});