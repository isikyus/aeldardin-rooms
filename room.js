define([],
function() {

  // Room model -- just for storing and viewing room data.
  var Room = function(id, x, y, width, height, wallFeatures) {
    this.id = id;
    this.key = id + 1;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.wallFeatures = wallFeatures || [];
  };

  Room.prototype = {

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
    getWalls : function() {
      return {
        north : {
          parallelAxis: 'x',
          perpendicularAxis: 'y',
          position: this.y,
          start: this.x,
          length: this.width,
          runsFrom: 'west'
        },
        south : {
          parallelAxis: 'x',
          perpendicularAxis: 'y',
          position: this.y + this.height,
          start: this.x,
          length: this.width,
          runsFrom: 'west'
        },
        east : {
          parallelAxis: 'y',
          perpendicularAxis: 'x',
          position: this.x + this.width,
          start: this.y,
          length: this.height,
          runsFrom: 'north'
        },
        west : {
          parallelAxis: 'y',
          perpendicularAxis: 'x',
          position: this.x,
          start: this.y,
          length: this.height,
          runsFrom: 'north'
        }
      };
    }
  };

  return Room;
});