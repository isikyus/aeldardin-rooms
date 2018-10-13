define([],
function() {

  // Return an object representing the walls of this room.
  // Its keys are 'north', 'south', 'east', and 'west'.
  //
  // Each of these contains an object with the position
  // (perpendicular to the wall) and length and start coordinate
  // (parallel) of that wall, plus the direction it runs from: 
  // 'east' for walls running east-west (keys 'north' and 'south',
  // and 'north' for ralls running north-south).
  // Walls also define 'perpendicularAxis' (used for 'position'),
  // and 'parallelAxis' (used for 'start'); each one is either 'x' or 'y'.
  //
  // TODO: it's more general to represent directions as unit vectors rather than names, and avoids all this case-by-case stuff.

  walls = function(room) {
    return {
      north : {
        parallelAxis: 'x',
        perpendicularAxis: 'y',
        position: room.y,
        start: room.x,
        length: room.width,
        runsFrom: 'west'
      },
      south : {
        parallelAxis: 'x',
        perpendicularAxis: 'y',
        position: room.y + room.height,
        start: room.x,
        length: room.width,
        runsFrom: 'west'
      },
      east : {
        parallelAxis: 'y',
        perpendicularAxis: 'x',
        position: room.x + room.width,
        start: room.y,
        length: room.height,
        runsFrom: 'north'
      },
      west : {
        parallelAxis: 'y',
        perpendicularAxis: 'x',
        position: room.x,
        start: room.y,
        length: room.height,
        runsFrom: 'north'
      }
    };
  };

  return {
    walls: walls
  };
});
