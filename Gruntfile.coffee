module.exports = (grunt) ->
	pkg = grunt.file.readJSON('package.json')

	# Project configuration.
	grunt.initConfig
		# Tasks
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

		uglify:
			main:
				files:
					'dist/vtex-ng-filter-tpls.min.js': 'dist/vtex-ng-filter-tpls.js'
				options:
					mangle: false

		copy:
			oms:
				cwd: 'dist/'
				src: ['vtex-ng-filter-tpls.js']
				dest: '../vcs.order-management-ui/src/lib/vtex-ng-filter/'
				expand: true

		watch:
			oms:
				files: ['src/**']
				tasks: ['default', 'copy:oms']

	grunt.loadNpmTasks name for name of pkg.dependencies when name[0..5] is 'grunt-'

	grunt.registerTask 'default', ['clean', 'coffee', 'ngtemplates', 'concat:main', 'uglify']
	grunt.registerTask 'oms', ['default', 'copy:oms', 'watch:oms']
