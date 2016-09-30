// Root file loaded by RequireJS

require.config({
    paths: {
        'jquery': 'vendor/jquery',
        'handlebars': 'vendor/handlebars'
    }
});

require([
    'jquery',
    'map_controller'
  ],
function($, MapController) {
  $(function() {
    $('.js-map').each(function(_index, canvas) {
      var controller = new MapController(canvas);
    });
  });
});