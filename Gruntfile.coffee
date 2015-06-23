module.exports = (grunt) ->
  pkg = grunt.file.readJSON('package.json')

  # Project configuration.
  grunt.initConfig
  # Tasks
    pkg: pkg
    clean: ['dist', 'build']

    coffee:
      main:
        files:
          'build/vtex-ng-filter.js': 'src/vtex-ng-filter.coffee'

    ngtemplates:
      app:
        cwd: 'src/'
        src: '*.html'
        dest: 'build/vtex-ng-filter-template.js'
        options:
          htmlmin:  collapseWhitespace: true, collapseBooleanAttributes: true
          bootstrap:  (module, script) ->
            'angular.module("vtexNgFilter").run(function($templateCache) { ' + script + ' });'

    concat:
      main:
        src: ['build/vtex-ng-filter.js', 'build/vtex-ng-filter-template.js']
        dest: 'dist/vtex-ng-filter-tpls.js'
        options:
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'

    uglify:
      main:
        src: 'dist/vtex-ng-filter-tpls.js'
        dest: 'dist/vtex-ng-filter-tpls.min.js'
        options:
          mangle: false
          preserveComments: 'some'

    copy:
      oms:
        cwd: 'dist/'
        src: ['vtex-ng-filter-tpls.min.js']
        dest: '../vcs.order-management-ui/src/lib/vtex-ng-filter/'
        expand: true
      pci:
        cwd: 'dist/'
        src: ['vtex-ng-filter-tpls.min.js']
        dest: '../vcs.pci-gateway-ui/src/lib/vtex-ng-filter/'
        expand: true

    watch:
      oms:
        files: ['src/**']
        tasks: ['default', 'copy:oms']
      pci:
        files: ['src/**']
        tasks: ['default', 'copy:pci']

    karma:
      unit:
        configFile: 'karma.conf.coffee'

  grunt.loadNpmTasks name for name of pkg.devDependencies when name[0..5] is 'grunt-'

  grunt.registerTask 'default', ['clean', 'coffee', 'ngtemplates', 'concat:main', 'uglify']
  grunt.registerTask 'oms', ['default', 'copy:oms', 'watch:oms']
  grunt.registerTask 'pci', ['default', 'copy:pci', 'watch:pci']
