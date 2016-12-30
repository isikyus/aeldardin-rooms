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

  // Check if the door lines up with an edge of the room.
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
    exits    : function(room) {
      var exits = [];

      $.each(this.rooms, function(_index, otherRoom) {
        // Every door in this room will connect to this room,
        // but that doesn't count as an exit from the room to itself.
        if (otherRoom == room) return;

        // Find exits from this room to the other room.
        $.each(room.wallFeatures, function(_index2, door) {
          if (connectsTo(door, otherRoom)) {
            exits.push(exit(door, otherRoom));
          }
        });

        // Exits from the other room to this one.
        $.each(otherRoom.wallFeatures, function(_index2, door) {
          if (connectsTo(door, room)) {
            exits.push(exit(door, otherRoom));
          }
        });
      });

      return exits;
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

  return MapModel;
});