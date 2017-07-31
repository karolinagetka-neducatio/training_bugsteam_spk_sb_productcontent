'use strict';

module.exports = function (grunt) {

	var rcfPathsHelper = require('./rcfPathsHelper.js')(grunt);
	var upath = require('upath');

	var SCORM_INPUT = 'scorm',
		SCORM_INPUT_PLAYER_CSS = SCORM_INPUT + '/css/player.css',
		SCORM_INPUT_SWEETALERT_CSS = SCORM_INPUT + '/css/sweetalert.css',
		SCORM_OUTPUT = 'scorm-output',
		SCORM_OUTPUT_APP_MIN_CSS = SCORM_OUTPUT + '/css/app.min.css',
		SCORM_OUTPUT_APP_MIN_JS = SCORM_OUTPUT + '/js/app.min.js';

	grunt.registerTask('scormPaths', function () {

		var projectSettings = grunt.file.readJSON('package.json').projectSettings;

		var releaseRoot = upath.join(SCORM_OUTPUT, (projectSettings.releaseFolder || 'cdn'));

		function makeRelative(path) {
			return path.replace(SCORM_OUTPUT + '/', '');
		}

		var levelCssFilePaths = rcfPathsHelper.getCssFilePathsForLevel();

		var sharedCss = rcfPathsHelper.findSharedStyles(releaseRoot);

		var paths = {
			RELEASE_RCF: makeRelative(rcfPathsHelper.findFolderLocation(releaseRoot, 'rcf')),
			RELEASE_HTML: makeRelative(rcfPathsHelper.findAmbiguousFolderLocations(releaseRoot, 'html')),
			RELEASE_JSON: makeRelative(rcfPathsHelper.findAmbiguousFolderLocations(releaseRoot, 'json')),
			RELEASE_SWF_FALLBACK: makeRelative(rcfPathsHelper.findAmbiguousFolderLocations(releaseRoot, 'swf')),
			RELEASE_CSS: levelCssFilePaths.css,
			RELEASE_768_CSS: levelCssFilePaths.css768,
			RELEASE_1024_CSS: levelCssFilePaths.css1024,
			RELEASE_SHARED_CSS: makeRelative(sharedCss.css),
			RELEASE_SHARED_768_CSS: makeRelative(sharedCss.css768),
			RELEASE_SHARED_1024_CSS: makeRelative(sharedCss.css1024),
			RELEASE_RCF_MIN_WIDTH_768: projectSettings.minWidth768 || '1000px',
			RELEASE_RCF_MIN_WIDTH_1024: projectSettings.minWidth1024 || '1425px'
		};

		var generatorRcfVersion = grunt.file.readJSON('grunt/generatorRcf.json').version;

		grunt.config.merge({
			replace: {
				indexReferences: {
					src: [SCORM_OUTPUT + '/index.html'],
					overwrite: true,
					replacements: [{
						from: '{RELEASE_RCF}',
						to: paths.RELEASE_RCF
					}, {
						from: '{RELEASE_HTML}',
						to: paths.RELEASE_HTML
					}, {
						from: '{RELEASE_JSON}',
						to: paths.RELEASE_JSON
					}, {
						from: '{RELEASE_SWF_FALLBACK}',
						to: paths.RELEASE_SWF_FALLBACK
					}, {
						from: '{RELEASE_SHARED_CSS}',
						to: paths.RELEASE_SHARED_CSS
					}, {
						from: '{RELEASE_SHARED_768_CSS}',
						to: paths.RELEASE_SHARED_768_CSS
					}, {
						from: '{RELEASE_SHARED_1024_CSS}',
						to: paths.RELEASE_SHARED_1024_CSS
					}, {
						from: '{RELEASE_CSS}',
						to: paths.RELEASE_CSS
					}, {
						from: '{RELEASE_768_CSS}',
						to: paths.RELEASE_768_CSS
					}, {
						from: '{RELEASE_1024_CSS}',
						to: paths.RELEASE_1024_CSS
					}, {
						from: '{RELEASE_RCF_MIN_WIDTH_768}',
						to: paths.RELEASE_RCF_MIN_WIDTH_768
					}, {
						from: '{RELEASE_RCF_MIN_WIDTH_1024}',
						to: paths.RELEASE_RCF_MIN_WIDTH_1024
					}, {
						from: '{GENERATOR_RCF_VERSION}',
						to: generatorRcfVersion
					}]
				}
			}
		});

		grunt.task.run('replace:indexReferences');

	});

	grunt.registerTask('scormBuildTaskConfig', function () {

		var projectSettings = grunt.file.readJSON('package.json').projectSettings;

		var scormOutputCdnPath = upath.join(SCORM_OUTPUT, (projectSettings.releaseFolder || 'cdn'));
		var manifestFilePath = SCORM_OUTPUT + '/imsmanifest.xml';

		grunt.config.merge({
			exec: {
				generateManifest: {
					command: 'node ./scorm/utils/runCreateScormManifest.js \"' + projectSettings.productionFolder + '\" \"' + scormOutputCdnPath + '\" \"' + manifestFilePath + '\"'
				},
				decorateManifest: {
					command: 'node ./scorm/utils/decorateManifest.js \"' + SCORM_OUTPUT + '\"'
				},
				validateScormManifest: {
					command: 'node ./scorm/utils/validateScorm.js ./'
				}
			}
		});
	});

	grunt.registerTask('scorm', function () {

		var projectSettings = grunt.file.readJSON('package.json').projectSettings;

		grunt.file.mkdir(SCORM_OUTPUT);

		grunt.task.run([
			'clean:release',
			'exec:schemaValidate',
			'sass:build',
			'exec:generateOutput',
			'clean:releaseSassFiles',
			'copy:rcf',
			'concat:rcfCssFiles',
			'cssmin:rcfCore',
			'cssmin:projectExcludingRcfCore',
			'fixJson',
			'scormBuildTaskConfig',
			'clean:scormOutput',
			'mkdir:scormOutput',
			'copy:schemasToOutput',
			'copy:productToOutput',
			'exec:generateManifest',
			'exec:decorateManifest',
			'copy:fontsToOutput',
			'copy:imagesToOutput',
			'copy:jQueryToOutput',
			'replace:clearJQueryMinMapReference',
			'copy:angularToOutput',
            'copy:jsonManifestToOutput'
		]);

		var dev = grunt.option('dev') || false;
		if (dev) {
			grunt.task.run([
				'copy:devJsToOutput',
				'copy:devIndexToOutput'
			]);
		}
		else {
			grunt.task.run([
				'ngAnnotate:playerJs',
				'uglify:playerJs',
				'copy:indexToOutput'
			]);
		}

		grunt.task.run([
			'concat:playerCss',
			'cssmin:playerCss',
			'scormPaths',
			'replace:assetUrlReferencesWithRelative',
			'exec:validateScormManifest'
		]);

		var includeFirebug = grunt.option('firebug') || false;
		if (includeFirebug) {
			grunt.task.run([
				'copy:firebugToOutput',
				'replace:includeFirebugInScormPlayer'
			]);
		}

		grunt.task.run([
			'compress:scormOutput'
		]);

		grunt.config.merge({

			clean: {
				scormOutput: [SCORM_OUTPUT]
			},

			mkdir: {
				scormOutput: {
					options: {
						create: [SCORM_OUTPUT]
					}
				}
			},

			copy: {
				schemasToOutput: {
					files: [{
						expand: true,
						cwd: SCORM_INPUT + '/xsd',
						src: '**/*',
						dest: SCORM_OUTPUT
					}]
				},

				productToOutput: {
					files: [{
						expand: true,
						cwd: projectSettings.releaseFolder,
						src: '**/*',
						dest: SCORM_OUTPUT + '/' + (projectSettings.releaseFolder || 'cdn')
					}]
				},

				fontsToOutput: {
					files: [{
						expand: true,
						cwd: SCORM_INPUT + '/fonts',
						src: '**/*',
						dest: SCORM_OUTPUT + '/fonts'
					}]
				},

				imagesToOutput: {
					files: [{
						expand: true,
						cwd: SCORM_INPUT + '/images',
						src: '**/*',
						dest: SCORM_OUTPUT + '/images'
					}]
				},

				jQueryToOutput: {
					files: [{
						expand: true,
						cwd: 'node_modules/jquery/dist',
						src: 'jquery.min.js',
						dest: SCORM_OUTPUT + '/js/libs'
					}]
				},

				angularToOutput: {
					files: [{
						expand: true,
						cwd: 'node_modules/angular',
						src: 'angular.min.js',
						dest: SCORM_OUTPUT + '/js/libs'
					}]
				},

				indexToOutput: {
					files: [{
						expand: true,
						cwd: SCORM_INPUT,
						src: 'index.html',
						dest: SCORM_OUTPUT
					}]
				},

				firebugToOutput: {
					files: [{
						expand: true,
						cwd: SCORM_INPUT + '/firebug',
						src: '**/*',
						dest: SCORM_OUTPUT + '/firebug'
					}]
				},

				devJsToOutput: {
					files: [{
						expand: true,
						cwd: SCORM_INPUT + '/js',
						src: '**/*',
						dest: SCORM_OUTPUT + '/js'
					}]
				},

				devIndexToOutput: {
					files: [{
						expand: true,
						cwd: SCORM_INPUT,
						src: 'index-debug.html',
						dest: SCORM_OUTPUT,
						rename : function() {
							return SCORM_OUTPUT + '/index.html';
						}
					}]
				},
                jsonManifestToOutput: {
                    files: [{
                        expand: true,
                        cwd: SCORM_INPUT,
                        src: 'manifest.json',
                        dest: SCORM_OUTPUT
                    }]
                }
			},

			replace: {
				clearJQueryMinMapReference: {
					src: [
						SCORM_OUTPUT + '/js/libs/jquery.min.js'
					],
					overwrite: true,
					replacements: [{
						from: '//# sourceMappingURL=jquery.min.map',
						to: ''
					}]
				},
				assetUrlReferencesWithRelative: {
					src: [
						SCORM_OUTPUT + '/**/*.html',
						SCORM_OUTPUT + '/**/*.css'
					],
					overwrite: true,
					replacements: [{
						from: '"/' + projectSettings.releaseFolder,
						to: '"' + projectSettings.releaseFolder
					},
						{
							from: '\'/' + projectSettings.releaseFolder,
							to: '\'' + projectSettings.releaseFolder
						},
						{
							from: '(/' + projectSettings.releaseFolder,
							to: '(' + projectSettings.releaseFolder
						}]
				},
				includeFirebugInScormPlayer: {
					src: [
						SCORM_OUTPUT + '/index.html'
					],
					overwrite: true,
					replacements: [{
						from: '</title>',
						to: '</title>\n<script type=\'text/javascript\' src=\'firebug/src/firebug-lite-debug.js\'></script>'
					}]
				}
			},

			ngAnnotate: {
				playerJs: {
					options: {
						singleQuotes: true
					},
					files: [{
						'scorm-output/js/app.min.js': SCORM_INPUT + '/js/**/*.js'
					}]
				}
			},

			uglify: {
				playerJs: {
					options: {
						mangle: true
					},
					files: {
						'scorm-output/js/app.min.js': SCORM_OUTPUT_APP_MIN_JS
					}
				},
				playerJsWithSourceMap: {
					options: {
						mangle: false,
						sourceMap: true,
						sourceMapIncludeSources: true
					},
					files: {
						'scorm-output/js/app.min.js': SCORM_INPUT + '/js/**/*.js'
					}
				}
			},

			concat: {
				playerCss: {
					src: [SCORM_INPUT_PLAYER_CSS, SCORM_INPUT_SWEETALERT_CSS],
					dest: SCORM_OUTPUT_APP_MIN_CSS
				}
			},

			cssmin: {
				playerCss: {
					src: SCORM_OUTPUT_APP_MIN_CSS,
					dest: SCORM_OUTPUT_APP_MIN_CSS
				}
			},

			compress: {
				scormOutput: {
					options: {
						archive: './<%= rcf.projectName %>_<%= grunt.file.readJSON("package.json").version %>_<%= grunt.template.today("ddmmyyyy") %>_scorm.zip',
						mode: 'zip'
					},
					files: [{
						expand: true,
						cwd: SCORM_OUTPUT,
						src: ['**', '!*.md']
					}]
				}
			}
		});
	});
};
