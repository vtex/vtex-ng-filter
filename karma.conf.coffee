module.exports = (config) ->
  config.set
    browsers: ['PhantomJS']
    frameworks: ['mocha', 'chai']
    files: [
      'http://io.vtex.com.br/front-libs/jquery/2.0.3/jquery-2.0.3.min.js',
      'http://io.vtex.com.br/front-libs/angular/1.4.7/angular.min.js',
      'http://io.vtex.com.br/front-libs/angular-translate/2.8.1/angular-translate.min.js',
      'http://io.vtex.com.br/front-libs/moment/2.9.0/moment-with-locales.min.js',
      'src/*.coffee',
      'spec/angular/*.js',
      'spec/*.coffee'
    ]
    client:
      mocha:
        ui: 'bdd'
    preprocessors:
      '**/*.coffee': ['coffee']
