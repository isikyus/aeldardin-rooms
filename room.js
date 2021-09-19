define([],
function() {

  // Returns an array of coordinates for the corners of the given room
  // (by ID) in the given map. This should be enough to draw or describe
  // the walls.

  var walls = function(map, roomId) {
    var wallData = [],
        edge;

    map.rooms.rooms[roomId].edgeLoops.forEach(function(firstEdgeId) {
      var edgeId = firstEdgeId,
          edge,
          startPoint,
          endPoint;
      do {
        edge = map.rooms.edges[edgeId];
        startPoint = map.rooms.points[edge.from];
        endPoint = map.rooms.points[edge.to];

        wallData = wallData.concat([
          {
            id: edgeId,
            startX: startPoint.x,
            startY: startPoint.y,
            endX: endPoint.x,
            endY: endPoint.y
          }
        ]);
        edgeId = edge.next;
      } while (firstEdgeId != edgeId);
    });

    return wallData;
  };

  return {
    walls: walls
  };
});
