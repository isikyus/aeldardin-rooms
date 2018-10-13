define([],
function() {

  var nextId = function(thingsWithIds) {
    var existingIds = thingsWithIds.map(function(thing) {
      return thing.id;
    });

    // Ensure we always start with at least ID 0 (avoids starting at -Infinity).
    var maxId = Math.max.apply(Math, existingIds.concat(-1));
    return maxId + 1;
  };

  // Redux reducer for map data.
  var reduce = function(state, action) {

    // Set initial state.
    var initialState = {
      rooms: [],
      doors: []
    };
    state = state || initialState;

    switch (action.type) {

      case 'map.addRoom':
        var newRoom = {
          id: nextId(state.rooms),
          x: action.payload.x,
          y: action.payload.y,
          width: action.payload.width,
          height: action.payload.height
        };

        newRoom.key = action.payload.key || (newRoom.id + 1);

        // Normalise width and height to be non-negative.
        if(newRoom.width < 0) {
          newRoom.x = newRoom.x + newRoom.width;
          newRoom.width = -newRoom.width;
        }
        if(newRoom.height < 0) {
          newRoom.y = newRoom.y + newRoom.height;
          newRoom.height = -newRoom.height;
        }

        return {
          rooms: state.rooms.concat(newRoom),
          doors: state.doors
        };

      case 'map.removeRooms':
        var idsToRemove = action.payload.roomIds;
        var roomsAfterRemoval = state.rooms.filter(function(room) {
          return (idsToRemove.indexOf(room.id) < 0);
        });
        return {
          rooms: roomsAfterRemoval,
          doors: state.doors
        };

      case 'map.addDoor':
        var newDoor = {
          id: nextId(state.doors),
          x: action.payload.x,
          y: action.payload.y,
          direction: action.payload.direction
        };
        return {
          rooms: state.rooms,
          doors: state.doors.concat(newDoor)
        };

      case 'map.removeDoors':
        var idsToRemove = action.payload.doorIds;
        var doorsAfterRemoval = state.doors.filter(function(door) {
          return (idsToRemove.indexOf(door.id) < 0);
        });
        return {
          rooms: state.rooms,
          doors: doorsAfterRemoval
        };

      default:
        return state;
    }
  };

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

  // A map of all exits (doors from one room to another).
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
              if (otherRoom == room) return;

              // Find doors connecting these two rooms.
              // TODO: won't work if there are multiple possible connections.
              if (connectsTo(door, otherRoom)) {
                exit.room = otherRoom;
              }
            });
console.log(exit);
            exits[room.id].push(exit);
          };
        });
      });

      return exits;
  }

  return {
    reduce: reduce,
    exits: exits
  };
});
