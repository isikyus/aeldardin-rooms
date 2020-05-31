define([
  'redux'
],
function(Redux) {

  // Helper function to allocate IDs.
  var nextId = function(thingsWithIds) {
    var existingIds = thingsWithIds.map(function(thing) {
      return thing.id;
    });

    // Ensure we always start with at least ID 0 (avoids starting at -Infinity).
    var maxId = Math.max.apply(Math, existingIds.concat(-1));
    return maxId + 1;
  };

  var reduceRooms = function(state, action) {
    state = state || [];

    switch(action.type) {
      case 'map.rooms.add':
        return state.concat(
          buildRoom(nextId(state), action.payload)
        );

      case 'map.rooms.remove':
        return removeById(state, action.payload.roomIds);

      default:
        return state;
    }
  }

  var buildRoom = function(id, roomData) {
    var room = {
      id: id,
      x: roomData.x,
      y: roomData.y,
      width: roomData.width,
      height: roomData.height
    };

    room.key = roomData.key || (room.id + 1);

    // Normalise width and height to be non-negative.
    if(room.width < 0) {
      room.x = room.x + room.width;
      room.width = -room.width;
    }
    if(room.height < 0) {
      room.y = room.y + room.height;
      room.height = -room.height;
    }

    return room;
  };

  var reduceDoors = function(state, action) {
    state = state || [];

    switch (action.type) {

      case 'map.doors.add':
        var newDoor = {
          id: nextId(state),
          x: action.payload.x,
          y: action.payload.y,
          direction: action.payload.direction
        };

        newDoor.style = action.payload.style || 'door';

        return state.concat(newDoor);

      case 'map.doors.remove':
        return removeById(state, action.payload.doorIds);

      default:
        return state;
    }
  };

  var removeById = function(list, idsToRemove) {
    return list.filter(function(object) {
      return (idsToRemove.indexOf(object.id) < 0);
    });
  }

  // Check if the door lines up with an edge of the given room.
  var connectsTo = function(door, room) {
    var door_x = door.x, door_y = door.y;
    var x1 = room.x, x2 = room.x + room.width;
    var y1 = room.y, y2 = room.y + room.height;

    if (door.direction === 'east') { door_x += 1; }
    if (door.direction === 'south') { door_y += 1; }

    switch(door.direction) {
      case 'east':
      case 'west':
        return (door_x === x1 || door_x === x2) && y1 <= door_y && door_y < y2;
        // No fall-through, as return ends execution.

      case 'north':
      case 'south':
        return (door_y === y1 || door_y === y2) && x1 <= door_x && door_x < x2;
        // Again, return ends execution.

      default:
        throw 'Unexpected door direction' + door.direction;
    }
  };

  // A dictionary of all exits (doors from one room to another).
  var exits = function(map) {
      var exits = {};

      map.rooms.forEach(function(room) {
        exits[room.id] = [];

        // Find doors connected to this room.
        map.doors.forEach(function(door) {
          if (connectsTo(door, room)) {
            var exit = { door: door, room: null };

            // Add a connection to another room if applicable.
            map.rooms.forEach(function(otherRoom) {

              // TODO: only need to loop over a triangular subarray to get every pair.
              // Every door in this room will connect to this room,
              // but that doesn't count as an exit from the room to itself.
              if (otherRoom === room) return;

              // Find doors connecting these two rooms.
              // TODO: won't work if there are multiple possible connections.
              if (connectsTo(door, otherRoom)) {
                exit.room = otherRoom;
              }
            });
            exits[room.id].push(exit);
          }
        })
      });

      return exits;
  }

  return {
    reduce: Redux.combineReducers({
                rooms: reduceRooms,
                doors: reduceDoors
            }),
    exits: exits
  };
});
