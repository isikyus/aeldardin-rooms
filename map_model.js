define([
    'jquery'
  ],
function($) {
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
    var rooms = this.rooms;

    $.each(rooms, function(index, room) {
      room.key = parseInt(index) + 1;
    });
  };

  MapModel.prototype = {
    getDoors : function() { return doors; },
    exits    : function(room) {
      var exits = [];

      $.each(this.rooms, function(_index, otherRoom) {
        // Every door in this room will connect to this room,
        // but that doesn't count as an exit from the room to itself.
        if (otherRoom == room) return;

        // Find exits from this room to the other room.
        $.each(room.wall_features, function(_index2, door) {
          if (connectsTo(door, otherRoom)) {
            exits.push(exit(door, otherRoom));
          }
        });

        // Exits from the other room to this one.
        $.each(otherRoom.wall_features, function(_index2, door) {
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
     * Add a room, and return its map key.
     */
    addRoom : function(x, y, width, height) {
      var room = {x: x, y: y, width: width, height: height}
      this.rooms.push(room);
      this.addDerivedFields();
      this.fireRoomsChanged();

      // Created by addDerivedFields()
      return room.key;
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