module.exports = (config) ->
  config.set
    browsers: ['PhantomJS']
    frameworks: ['mocha', 'chai']
    files: [
      'http://io.vtex.com.br/front-libs/jquery/2.0.3/jquery-2.0.3.min.js',
      'http://io.vtex.com.br/front-libs/angular/1.2.16/angular.min.js',
      'http://io.vtex.com.br/front-libs/angular-translate/1.1.1/angular-translate.min.js',
      'http://io.vtex.com.br/front-libs/moment/2.4.0/moment.min.js',
      'http://io.vtex.com.br/front-libs/moment/2.4.0/lang/pt-br.min.js',
      'src/*.coffee',
      'spec/angular/*.js',
      'spec/*.coffee'
    ]
    client:
      mocha:
        ui: 'tdd'
    preprocessors:
      '**/*.coffee': ['coffee']
