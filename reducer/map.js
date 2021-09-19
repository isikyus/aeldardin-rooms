define([
  'redux'
],
function(Redux) {
  var reduceRooms = function(state, action) {
    state = state || {
      points: [],
      edges: [],
      rooms: [],
      nonRoom: {
        edgeLoops: []
      }
    };

    switch(action.type) {
      case 'map.rooms.add':
        return addRoom(state, action.payload);

      case 'map.rooms.remove':
        // TODO: return removeById(state, action.payload.roomIds);

      default:
        return state;
    }
  };

  // TODO: should be more functional, not mutate the state.
  var addRoom = function(state, data) {
    var x1 = data.x,
        y1 = data.y,
        x2 = x1 + data.width,
        y2 = y1 + data.height,
        newPoints = state.points,
        pointIds = [],
        newEdges = [],
        coordinates = [
          [x1, y1],
          [x2, y1],
          [x2, y2],
          [x1, y2]
        ],
        newRoomId = state.rooms.length;

    coordinates.forEach(function(point) {
      update = findPoint(newPoints, point[0], point[1]);
      newPoints = update[1];
      pointIds = pointIds.concat(update[0]);
    });

    var lastForwardEdge = null,
        lastReverseEdge = null,
        lastReverseEdgeId = null;
    for (var i = 0; i < pointIds.length; i++) {
      var thisPointId = pointIds[i],
          nextPointId = pointIds[(i + 1) % pointIds.length],
          thisPoint = newPoints[thisPointId],
          forwardEdgeId = newEdges.length + state.edges.length,
          reverseEdgeId = forwardEdgeId + 1;

      var newForwardEdge = {
        from: thisPointId,
        to: nextPointId,
        opposite: reverseEdgeId,
        onRight: newRoomId
      }
      var newReverseEdge = {
        from: nextPointId,
        to: thisPointId,
        opposite: forwardEdgeId,
        // TODO: connect to another room if it's on the right
        onRight: -1
      }
      newEdges = newEdges.concat([newForwardEdge, newReverseEdge]);

      if (lastForwardEdge) {
        lastForwardEdge.next = forwardEdgeId;
        lastReverseEdge.cw = forwardEdgeId;
        newForwardEdge.cw = lastReverseEdgeId;
        newReverseEdge.next = lastReverseEdgeId;
      };

      if (thisPoint.edge) {
        throw "Cannot yet handle adding edges to existing points";
      } else {
        thisPoint.edge = forwardEdgeId;
      }

      lastForwardEdge = newForwardEdge;
      lastReverseEdge = newReverseEdge;
      lastReverseEdgeId = reverseEdgeId;
    };

    // Fill in connections between first and last edges.
    var firstNewEdgeId = state.edges.length,
        firstNewReverseId = firstNewEdgeId + 1;
    lastForwardEdge.next = firstNewEdgeId;
    lastReverseEdge.cw = firstNewEdgeId;
    newEdges[0].cw = lastReverseEdgeId;
    newEdges[1].next = lastReverseEdgeId;

    return {
      points: newPoints,
      edges: state.edges.concat(newEdges),
      rooms: state.rooms.concat({
        edgeLoops: [firstNewEdgeId],
        key: data.key || (newRoomId + 1).toString
      }),
      nonRoom: {
        edgeLoops: state.nonRoom.edgeLoops.concat([firstNewReverseId])
      }
    };
  };

  // How close two points can be before we combine them into a single point.
  // TODO: may want this editable or something.
  var DELTA = 0.0001;

  // Return the ID of an existing "close enough" point if there is one,
  // or create a new one if not (and return its ID).
  //
  // @param points Current list of points
  // @return [new point ID, updated list of points]
  var findPoint = function(points, x, y) {
    var existing = points.indexOf(function(point) {
      return (Math.abs(point.x - x) < DELTA &&
          Math.abs(point.y - y) < DELTA);
    });

    if (existing > 0) {
      return [existing, points];
    } else {
      return [points.length, points.concat({x: x, y: y})];
    }
  };

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
