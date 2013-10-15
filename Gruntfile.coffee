module.exports = (grunt) ->
	pkg = grunt.file.readJSON('package.json')

	# Project configuration.
	grunt.initConfig
		# App variables
		relativePath: ''

		# Tasks
		clean: ['build']
		copy:
			main:
				src: 'src/ng-filter.html'
				dest: 'dist/ng-filter.html'

		coffee:
			main:
				files:
					'dist/ng-filter.js': 'src/ng-filter.coffee'

		ngtemplates:
			app:
				cwd: 'src/'
				src: '*.html'
				dest: 'dist/<%= relativePath %>/ng-filter-template.js'
				options:
					bootstrap:  (module, script) ->
						'angular.module("ngFilter").run(function($templateCache) { ' + script + ' });'

		uglify:
			main:
				files:
					'dist/<%= relativePath %>/ng-filter-with-template.min.js':
						['dist/ng-filter.js', 'dist/ng-filter-template.js']
				options:
					mangle: false

	grunt.loadNpmTasks name for name of pkg.dependencies when name[0..5] is 'grunt-'

	grunt.registerTask 'default', ['copy', 'coffee', 'ngtemplates', 'uglify']
