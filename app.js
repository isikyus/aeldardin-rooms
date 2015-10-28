// Root file loaded by RequireJS

require([
    'jquery',
    'map_controller'
  ],
function($, MapController) {
  $(function() {
    $('.js-map').each(function(_index, canvas) {
      var controller = new MapController(canvas);
      //var dataPath = $(canvas).data('src');
      var mapJson = $('#knossos-map').html();
      controller.useData(JSON.parse(mapJson));
    });
  });
});