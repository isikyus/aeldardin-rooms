define([
    'jquery',
    'room'
  ],
function($, Room) {
  // MVC implementation based on example from <https://alexatnet.com/articles/model-view-controller-mvc-javascript>

  var MapModel = function() {
    this.rooms = [];
    this.doors = {};
    this.roomListeners = [];
  }

  var exit = function(door, toRoom) {
    return {
      door : door,
      room : toRoom
    };
  };

  var addDerivedFields = function() {
    this.rooms = $.map(this.rooms, function(rawRoom, index) {
      var room = new Room(index, rawRoom.x, rawRoom.y,
                                  rawRoom.width, rawRoom.height,
                                  rawRoom.wallFeatures);

      // Preserve room key if it was already set.
      room.key = rawRoom.key || room.key;

      return room;
    });
  };

  MapModel.prototype = {
    getDoors : function() {
        var doors = [];

        $.each(this.rooms, function(_index, room) {
           doors = doors.concat(room.wallFeatures);
        });

        return doors;
    },
    getRooms : function() { return this.rooms; },
    setRooms : function(rooms) {
      this.rooms = rooms;
      this.addDerivedFields();
      this.fireRoomsChanged();
    },

    /*
     * Add a room, and return its ID.
     */
    addRoom : function(x, y, width, height) {

      // Enforce numeric arguments, to pick up type conversion bugs.
      if (typeof x !== 'number') { throw 'Expected numeric x, got ' + x; }
      if (typeof y !== 'number') { throw 'Expected numeric y, got ' + y; }
      if (typeof width !== 'number') { throw 'Expected numeric width, got ' + width; }
      if (typeof height !== 'number') { throw 'Expected numeric height, got ' + height; }

      // Find a free ID for the new room:
      var newId = 0;
      $.each(this.rooms, function(_index, room) {
        newId = Math.max(newId, room.id) + 1;
      });
      var room = new Room(newId, x, y, width, height, []);
      this.rooms.push(room);
      this.fireRoomsChanged();

      // Created by addDerivedFields()
      return room.id;
    },

    /*
     * Add a door, and return its ID.
     * The owning room is automatically determined based on the coordinates of the door.
     * Fails (returning false) if the proposed door would not be in a room.
     *
     * Direction is a string -- one of 'north', 'south', 'east', or 'west'.
     * Door style just defaults to "door".
     * TODO: should probably use constants for this.
     */
    addDoor : function(x, y, direction) {

      // Enforce numeric arguments, to pick up type conversion bugs.
      if (typeof x !== 'number') { throw 'Expected numeric x, got ' + x; }
      if (typeof y !== 'number') { throw 'Expected numeric y, got ' + y; }

      /*
       * Find a room containing the given coordinates,
       * and a WallFeature ID not already in use (for the new door).
       */
      var containingRoom = null, newDoorId = 0;
      $.each(this.rooms, function(_index, room) {

        if (room.x <= x && x < (room.x + room.width) &&
            room.y <= y && y < (room.y + room.height)) {
          containingRoom = room;
        }

        $.each(room.wallFeatures, function(_index, feature) {
          newDoorId = Math.max(feature.id + 1, newDoorId);
        });
      });

      // If we found one, add the proposed door.
      if (containingRoom === null) {
        return false;

      } else {
        containingRoom.wallFeatures.push({
          id: newDoorId,
          x: x,
          y: y,
          direction: direction,
          style: 'door'
        });

        this.fireRoomsChanged();

        return newDoorId;
      }
    },

    /*
     * Remove a door (specified by ID).
     *
     * On success, returns the door removed; on failure, returns false.
     */
    removeDoor : function(id) {

      var removedDoor = null;

      $.each(this.rooms, function(_index, room) {

        // Find the index of the door with that ID, if any.
        var indexToRemove = null;
        $.each(room.wallFeatures, function(index, door) {

          if (door.id === id) {
            indexToRemove = index;

            // Break out of $.each
            return false;
          }
        });

        // If we found it, remove and return the item at that index.
        if (indexToRemove !== null) {

          removedDoor = room.wallFeatures[indexToRemove];
          room.wallFeatures.splice(indexToRemove, 1);

          // Break out of $.each
          return false;
        }

        // Haven't removed anything yet, so keep going...
      });

      if (removedDoor !== null) {

        this.fireRoomsChanged();
        return removedDoor;

      } else {

        // We found nothing matching that ID; give up.
        return false;
      }
    },

    /*
     * Try to remove the given room from the map.
     * On success, returns the given room; on failure, returns false.
     *
     * TODO: need to define whether this removes doors or not.
     */
    removeRoom : function(room) {
      var index = this.rooms.indexOf(room);

      if (index > -1) {
        this.rooms.splice(index, 1);
        this.fireRoomsChanged();
        return room;
      } else {
        return false;
      }
    },
    addRoomsListener : function (listener) {
      this.roomListeners.push(listener);
    },
    addDerivedFields : addDerivedFields,
    fireRoomsChanged : function() {
      var map = this;
      $.each(this.roomListeners, function(_index, listener) {
        listener(map);
      });
    }
  };

  var nextId = function(thingsWithIds) {
    var existingIds = thingsWithIds.map(function(thing) {
      return thing.id;
    });

    // Ensure we always start with at least ID 0 (avoids starting at -Infinity).
    var maxId = Math.max.apply(Math, existingIds.concat(-1));
    return maxId + 1;
  };

  // Redux reducer for map data.
  MapModel.reduce = function(state, action) {

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

  MapModel.exits = exits;

  return MapModel;
});
