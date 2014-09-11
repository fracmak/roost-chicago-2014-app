(function() {
  'use strict';

  require.config({
    baseUrl: '/',
    paths: {
      backbone: 'bower_components/backbone/backbone',
      jquery: 'bower_components/jquery/dist/jquery',
      'jquery-ui': 'bower_components/jquery-ui/jquery-ui',
      csslib: 'libs/css-transition-lib/css-transition-lib',
      trafficcop: 'libs/trafficcop/trafficcop',
      underscore: 'bower_components/lodash/dist/lodash.underscore',
      lodash: 'bower_components/lodash/dist/lodash',
      tmpl: 'bower_components/lodash-template-loader/loader',
      vintagejs: 'bower_components/vintagejs/dist/jquery.vintage',
    },

    deps: ['main']
  });
}());
