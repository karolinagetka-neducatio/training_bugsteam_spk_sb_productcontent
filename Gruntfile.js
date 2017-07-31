/*
 RCF Product Grunt File - should work for *all* RCF projects
 */

'use strict';

/*global module:true, require:true */
var fs = require('fs');
var path = require('path');
var libxmljs = require('libxmljs');
var rimraf = require('rimraf');
var rcfPathsHelper = null;

module.exports = function (grunt) {

	var version = grunt.file.readJSON('grunt/generatorRcf.json').version;

	// read the packageJSON file to get our config parameters
	var packageJSON = grunt.file.readJSON('package.json'),
		rcfConfig = packageJSON.projectSettings,
		rcfSrcPackage = grunt.file.readJSON(rcfConfig.rcfLocalFolder + '/package.json'),
		projectVersion = packageJSON.version;

	// store the project version in the temporary location  ./projectSettings/projectVersion
	rcfConfig.projectVersion = projectVersion;

	// setup output paths when versioning is used
	rcfConfig.useVersion = rcfConfig.useVersion || 'n';
	if (rcfConfig.useVersion.toUpperCase() === 'Y') {
		rcfConfig.rcfOutputFolder = rcfConfig.releaseFolder + '/series/' + rcfConfig.projectName + '/' + projectVersion + '/';
	} else {
		rcfConfig.rcfOutputFolder = rcfConfig.releaseFolder;
	}

	// initial grunt task configuration
	grunt.initConfig({
		// shortcut to the package.json / projectSettings json object
		rcf: rcfConfig,
		rcfSourcePackage: rcfSrcPackage,
		rcfRoot: rcfConfig.rcfLocalFolder,
		// bumpup
		bumpup: 'package.json',
		// clean - clean the release folder / remove the concat scripts
		clean: {
			release: ['<%= rcf.releaseFolder %>'],
			ec2: ['ec2_release'],
			productHierarchyFiles: '<%= rcf.releaseFolder %>/**/productHierarchy.xml',
			releaseSassFiles: ['<%= rcf.releaseFolder %>/**/scss', '<%= rcf.releaseFolder %>/**/style/*.css.map']
		},

		// exec commands to build the release
		exec: {
			// validate production XML against schemas
			schemaValidate: {
				command: 'java -jar <%= rcf.rcfLocalFolder %>/builders/RCFSchemaValidate/RCFSchemaValidate.jar package.json'
			},

			// check well-formed / validate xml files to be split
			xmlValidateSplit: {
				command: 'java -jar <%= rcf.rcfLocalFolder %>/builders/RCFValidator/RCFValidator.jar <%= rcf.xmlFolder %>'
			},

			// check well-formed / validate *any* xml file (and xsl etc)
			xmlValidate: {
				command: 'java -jar <%= rcf.rcfLocalFolder %>/builders/RCFValidator/RCFValidator.jar <%= rcf.productionFolder %>/project/products'
			},

			// split
			xmlSplit: {
				command: 'java -jar <%= rcf.rcfLocalFolder %>/builders/RCFSplitter/RCFSplitter.jar package.json'
			},

			// generate roswell output
			generateRoswellOutput: {
				command: 'java -jar <%= rcf.rcfLocalFolder %>/builders/RCFTransformer/RCFTransformer.jar package.json y'
			},
			// generate the HTML and JSON output
			generateOutput: {
				command: 'java -jar <%= rcf.rcfLocalFolder %>/builders/RCFTransformer/RCFTransformer.jar package.json'
			},

			// generate the productHierarchy xml files
			generateHierarchy: {
				command: 'java -jar <%= rcf.rcfLocalFolder %>/builders/RCFHierarchyBuilder/RCFHierarchyBuilder.jar package.json'
			},

			generateEmptyActivities: {
				command: 'java -jar <%= rcf.rcfLocalFolder %>/builders/RCFGenerateEmptyActivities/RCFGenerateEmptyActivities.jar -packageFile package.json'
			},

			regenerateProduction: {
				command: 'java -jar <%= rcf.rcfLocalFolder %>/builders/RCFRegenerateIDs/RCFRegenerateIDs.jar package.json'
			},

			updateRCF: {
				cwd: '<%= rcf.rcfLocalFolder %>',
				command: 'git pull origin master && git fetch --tags && git checkout master'
			},

			updateRCFLink: {
				command: 'git add <%= rcf.rcfLocalFolder %>'
			},
			updateXSD: {
				cwd: '<%= rcf.rcfLocalFolder %>/xsd/JuraProductHierarchy',
				command: 'git pull origin master'
			}
		},

		copy: {
			// copy tasks for copying RCF to the release
			rcf: {
				files: [{
					expand: true,
					cwd: '<%= rcf.rcfLocalFolder %>/production/rcf',
					src: ['images/**', 'style/**', 'swf/**', 'vendor/**'],
					dest: '<%= rcf.rcfOutputFolder %>/rcf/'
				}, {
					expand: true,
					cwd: '<%= rcf.rcfLocalFolder %>/viewer/js',
					src: ['rcf.min.js', 'rcf.libs.min.js'],
					dest: '<%= rcf.rcfOutputFolder %>/rcf/js'
				}]
			},
			ec2: {
				files: [{
					expand: true,
					src: ['index.php', 'package.json', 'production/**', '!production/**/scss/**', '!production/**/style/*.css.map'],
					dest: 'ec2_release'
				}, {
					expand: true,
					cwd: '<%= rcfRoot %>/',
					src: ['package.json', 'build/**', 'js-with-source-maps/**', 'production/**', 'xsd/**', 'xsl/**', 'viewer/**'],
					dest: 'ec2_release/<%= rcf.rcfLocalFolder %>'
				}]
			}
		},

		// concat task to concat javascript files / css
		concat: {
			// CSS Files (rcf_core and any 3rd party css)
			rcfCssFiles: {
				src: [
					'<%= rcf.rcfLocalFolder %>/production/rcf/style/rcf_core.css',
					'<%= rcf.rcfLocalFolder %>/production/rcf/style/jplayer.css',
					'<%= rcf.rcfLocalFolder %>/production/rcf/style/owl.carousel.css',
					'<%= rcf.rcfLocalFolder %>/production/rcf/style/owl.theme.css',
					'<%= rcf.rcfLocalFolder %>/production/rcf/style/magnificpopup.css'
				],
				dest: '<%= rcf.rcfOutputFolder %>/rcf/style/rcf_core.css'
			}
		},

		sass: {
			build: {
				options: {
					sourceMap: false,
					sourceComments: false
				},
				files: [{
					expand: true,
					src: ['production/**/scss/*.scss'],
					ext: '.css',
					rename: function (dest, src) {
						var srcFolderPath = path.dirname(src);
						var srcParentFolderPath = path.join(path.dirname(srcFolderPath), 'style');
						var destFileName = path.basename(src);
						return path.join(srcParentFolderPath, destFileName);
					}
				}]
			},
			debug: {
				options: {
					sourceMap: true,
					sourceComments: true
				},
				files: [{
					expand: true,
					src: ['production/**/scss/*.scss'],
					ext: '.css',
					rename: function (dest, src) {
						var srcFolderPath = path.dirname(src);
						var srcParentFolderPath = path.join(path.dirname(srcFolderPath), 'style');
						var destFileName = path.basename(src);
						return path.join(srcParentFolderPath, destFileName);
					}
				}]
			}
		},

		// minify the CSS files
		cssmin: {
			// minify RCF Core CSS files
			rcfCore: {
				options: {
					banner: '/*! RCF (<%= rcfSourcePackage.version %>) "<%= grunt.template.today("yyyy-mm-dd dddd, h:MM:ss TT") %>" */ \n'
				},
				expand: true,
				cwd: '<%= rcf.rcfOutputFolder %>/rcf/style',
				src: ['*.css', '!*.min.css'],
				dest: '<%= rcf.rcfOutputFolder %>/rcf/style'
			},
			// minify Project CSS files, excluding RCF Core CSS files
			projectExcludingRcfCore: {
				options: {
					banner: '/*! <%= rcf.projectName %> (<%= rcf.projectVersion %>) "<%= grunt.template.today("yyyy-mm-dd dddd, h:MM:ss TT") %>" */ \n'
				},
				expand: true,
				src: ['<%= rcf.rcfOutputFolder %>/**/*.css', '!<%= rcf.rcfOutputFolder %>/rcf/**/*.css']
			}
		},

		watch: {
			sass: {
				files: 'production/**/scss/**/*.scss',
				tasks: ['sass:debug']
			}
		},

		// compress the build into a zip
		compress: {
			release: {
				options: {
					archive: './<%= rcf.projectName %>_<%= grunt.file.readJSON("package.json").version %>_<%= grunt.template.today("ddmmyyyy") %>.zip',
					mode: 'zip'
				},
				files: [
					{
						src: ['./<%= rcf.releaseFolder %>/**', '!./**/', '!./**/*humbs.db']
					}
				]
			},
			spkRelease: {
				options: {
					archive: './spk_<%= rcf.projectName %>_<%= grunt.file.readJSON("package.json").version %>_<%= grunt.template.today("ddmmyyyy") %>.zip',
					mode: 'zip'
				},
				files: [
					{
						src: ['./<%= rcf.releaseFolder %>/**', '!./**/', '!./**/*humbs.db']
					}
				]
			}
		},

		replace: {
			absoluteCdnPathsInHtmlFiles: {
				src: ['<%= rcf.releaseFolder %>/**/html/*.html'],
				overwrite: true,
				replacements: [
					{
						from: '"/<%= rcf.releaseFolder %>/',
						to: '"./<%= rcf.releaseFolder %>/'
					},
					{
						from: '\'/<%= rcf.releaseFolder %>/',
						to: '\'./<%= rcf.releaseFolder %>/'
					},
					{
						from: '(/<%= rcf.releaseFolder %>/',
						to: '(./<%= rcf.releaseFolder %>/'
					}
				]
			},
			absoluteCdnPathInManifestFile: {
				src: ['<%= rcf.releaseFolder %>/manifest.json'],
				overwrite: true,
				replacements: [{
					from: '"/<%= rcf.releaseFolder %>/',
					to: '"./<%= rcf.releaseFolder %>/'
				}]
			}
		}
	});

	grunt.loadTasks('grunt');

	grunt.registerTask('build', [
		'buildNoCompression',
		'compress:release'				// compress the release into the named format
	]);

	grunt.registerTask('buildNoCompression', [
		'clean:release',                // clean the release folder
		'exec:schemaValidate',          // validate the production xml against schemas'
		'sass:build',					// run any sass build processes
		'exec:generateOutput',          // transform the xml -> html
		'clean:releaseSassFiles',		// clean any SCSS files from output
		'exec:generateHierarchy',       // generate the productHierarchy xml files
		'copy:rcf',                     // copy the RCF code into the release
		'concat:rcfCssFiles',           // concat the RCF css files
		'cssmin:rcfCore',
		'cssmin:projectExcludingRcfCore',
		'fixJson'                       // tidy up the json files
	]);

	grunt.registerTask('buildSpk', [
		'buildSpkNoCompression',
		'compress:spkRelease'						// compress the release into the named format
	]);

	grunt.registerTask('buildSpkNoCompression', [
		'clean:release',                // clean the release folder
		'exec:schemaValidate',          // validate the production xml against schemas'
		'sass:build',					// run any sass build processes
		'exec:generateOutput',          // transform the xml -> html
		'clean:releaseSassFiles',		// clean any SCSS files from output
		'exec:generateHierarchy',       // generate the productHierarchy xml files
		'copy:rcf',                     // copy the RCF code into the release
		'concat:rcfCssFiles',			// concat the RCF css files
		'cssmin:rcfCore',
		'cssmin:projectExcludingRcfCore',
		'fixJson',                      // tidy up the json files
		'createManifest',
		'clean:productHierarchyFiles'
	]);

	grunt.registerTask('buildForRoswell', [
		'buildForRoswellNoCompression',
		'compress:release'
	]);

	grunt.registerTask('buildForRoswellNoCompression', [
		'clean:release',
		'exec:schemaValidate',
		'sass:build',					// run any sass build processes
		'exec:generateRoswellOutput',
		'clean:releaseSassFiles',		// clean any older sassfiles from output
		'copy:rcf',
		'concat:rcfCssFiles',
		'cssmin:rcfCore',
		'cssmin:projectExcludingRcfCore',
		'fixJson',
		'replace:absoluteCdnPathsInHtmlFiles'
	]);

	//EC2 specific build tasks
	function removeNotRequiredLevelFolders(ec2LevelsFolder) {

		var levels = fs.readdirSync(ec2LevelsFolder);

		levels.forEach(function (levelFolder) {
			var levelFolderLocation = path.normalize('.' + path.sep + ec2LevelsFolder + path.sep + levelFolder + path.sep);
			var levelMetaDataFile = path.normalize(levelFolderLocation + 'metadata.xml'),
				levelMetaDataXml,
				xmlDoc,
				deleteFolder = false;

			if (fs.existsSync(levelMetaDataFile)) {
				levelMetaDataXml = fs.readFileSync(levelMetaDataFile);
				xmlDoc = libxmljs.parseXmlString(levelMetaDataXml);
				deleteFolder = ( !!xmlDoc.get('/metadata/publish') && xmlDoc.get('/metadata/publish').text().toLowerCase() !== 'y' );
			} else {
				deleteFolder = true;
			}

			if (deleteFolder) {
				grunt.log.writeln('removing ' + levelFolderLocation);
				rimraf.sync(levelFolderLocation);
			}
		});
	}

	grunt.registerTask('ec2.postProcess', function () {
		var ec2LevelsFolder = 'ec2_release' + path.sep +
			'production' + path.sep +
			'project' + path.sep +
			'products' + path.sep;

		var userRole = grunt.option('role') || 'godlike';

		removeNotRequiredLevelFolders(ec2LevelsFolder);
		//
		// add admin json file
		var json = {
			'enableSave': 'y',
			'view': userRole
		};
		grunt.log.writeln('saving admin.json for EC2 build');
		grunt.file.write(('ec2_release' + path.sep + rcfConfig.rcfLocalFolder + path.sep + 'viewer' + path.sep + 'admin.json'), JSON.stringify(json, null, 2));
	});

	grunt.registerTask('buildEC2', 'Creates a build for EC2', function () {
		var rcfRoot = grunt.option('rcfRoot');
		var userRole = grunt.option('role') || 'godlike';

		// validate user level
		switch (userRole) {
			case 'godlike':
			case 'editor':
			case 'joepublic':
			case 'demo':
				break;
			default:
				grunt.log.error('Invalid role supplied !\n\nShould be [\'godlike\', \'editor\' or \'joepublic\']');
				return;
		}

		if (rcfRoot && !grunt.file.exists(rcfRoot)) {
			grunt.log.error('rcfRoot: \'' + rcfRoot + '\' does not exist!');
			return;
		}

		if (rcfRoot) {
			grunt.config('rcfRoot', rcfRoot);
		}

		grunt.task.run('clean:ec2');
		grunt.task.run('sass:build');
		grunt.task.run('copy:ec2');
		grunt.task.run('ec2.postProcess');

	});

	// default task will just display the available tools
	grunt.registerTask('default', 'RCF Build Tools', function () {
		var packageJSON = grunt.file.readJSON('package.json');
		var rcfJSON = grunt.file.readJSON(rcfConfig.rcfLocalFolder + '/package.json');
		grunt.log.writeln('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
		grunt.log.writeln('\nRCF Content Build Tools (' + version + ')\n\n');
		grunt.log.writeln('\tProject:\t' + packageJSON.name + ' (' + packageJSON.version + ')');
		grunt.log.writeln('\tRelease folder:\t' + packageJSON.projectSettings.releaseFolder);
		grunt.log.writeln('\tProd folder:\t' + packageJSON.projectSettings.productionFolder);
		grunt.log.writeln('\tRCF Version:\t' + rcfJSON.version);
		grunt.log.writeln('\n\nTools:\n');
		grunt.log.writeln(' grunt build');
		grunt.log.writeln('\n\t - create a zipped build from the \'production\' folder');
		grunt.log.writeln('\n\n grunt buildNoCompression');
		grunt.log.writeln('\n\t - create a build but with NO zip file output');
		grunt.log.writeln('\n\n grunt buildEC2');
		grunt.log.writeln('\n\t - create a build for EC2 deployment');
		grunt.log.writeln('\n\n grunt buildForRoswell');
		grunt.log.writeln('\n\t - create a build for Roswell products');
		grunt.log.writeln('\n\n grunt buildSpk');
		grunt.log.writeln('\n\t - create an spk build with json manifest');
		grunt.log.writeln('\n\n grunt buildSpkNoCompression');
		grunt.log.writeln('\n\t - create an spk build but no zip file');
		grunt.log.writeln('\n\n grunt validate');
		grunt.log.writeln('\n\t - validate all the XML files inside the \'production\' folder');
		grunt.log.writeln('\n\n grunt createEmptyFiles --act=<number> --ref=<number>');
		grunt.log.writeln('\n\t - create empty activities and / or referenceContent in the \'empty_xml\' folder\n\t - output folder cleaned after each run !');
		grunt.log.writeln('\n\n grunt xmlSplit');
		grunt.log.writeln('\n\t - perform a split / generation on xml in the \'' + packageJSON.projectSettings.xmlFolder + '\' folder');
		grunt.log.writeln('\t - xml is created in the \'new_xml\' folder with full production structure');
		grunt.log.writeln('\n\n grunt regenerateProduction');
		grunt.log.writeln('\n\t - regenerates all the ID\'s for the entire project and creates a new \'production folder\' containing the generated files - use with CAUTION !');
		grunt.log.writeln('\n\n grunt updateRCF');
		grunt.log.writeln('\n\t - update the version of RCF used with this project from github');
		grunt.log.writeln('\n\n  grunt exportPseudoIDs .... or ... grunt exportPseudoIDs --level=<level folder name>');
		grunt.log.writeln('\n\t - creates a file called \'pseudo_ids.csv\' containing a csv of activityID,pseudoID of all activity XML files in the project or specified Level folder');
		grunt.log.writeln('\n\n grunt importPseudoIDs');
		grunt.log.writeln('\n\t - will import a \'pseudo_ids.csv\' file and update the existing activity xml file with the value from the csv file (activityID,new pseudo ID)');
		grunt.log.writeln('\n\n grunt exportActivityDetails .... or ... grunt exportActivityDetails --level=<level folder name> --file=<csv file name>');
		grunt.log.writeln('\n\t - creates a file called \'activity_details.csv\' (or uses the passed optional filename) containing a csv of activityID, pseudoID, activity Title of all activity XML files in the project or specified Level folder');
		grunt.log.writeln('\n\n grunt importActivityDetails .... or ... grunt importActivityDetails --file=<csv file name>');
		grunt.log.writeln('\n\t - imports the file specified (or defaults to \'activity_details.csv\') and updates activity xml files with the details from the csv (if any have changed)');
		grunt.log.writeln('\n\n grunt scorm');
		grunt.log.writeln('\n\t - will create a scorm compatible zip file');
		grunt.log.writeln('\n\n grunt watch:sass');
		grunt.log.writeln('\n\y - will watch \'production\' folder (and children) for any modifications to .scss files under an "scss" folder and convert to .css files in the relative ../style folder.');
		grunt.log.writeln('\n\n grunt sass:build');
		grunt.log.writeln('\n\t - will run sass production processes on any \'.scss\' files found directly under an "scss" folder, within the \'production\' folder and output the generated .css files (including SCSS partials) to the relative ../style folder.');
		grunt.log.writeln('\n\n grunt sass:debug');
		grunt.log.writeln('\n\t - will run sass production processes on any \'.scss\' files found directly under an "scss" folder, within the \'production\' folder and output the generated commented .css (and .map) files (including SCSS partials) to the relative ../style folder.');
		grunt.log.writeln('\n\n grunt createNewsItem -outputPath=<output-section-path> -mecID=<mec-id to use>');
		grunt.log.writeln('\n\t - creates a news item "section" at the specified place, containing all the activityset and activities');
	});

	grunt.registerTask('createMissingFiles', 'Create Shared Files', function () {
		// creates the (empty) files for a project if they don't exist
		var options = packageJSON.projectSettings;
		var projectCSS = options.productionFolder + '/project/shared/style/' + options.projectName;
		if (!grunt.file.exists(projectCSS + '.css')) {
			grunt.log.writeln('Creating ' + projectCSS + '.css file');
			grunt.file.write(projectCSS + '.css', '/* ' + options.projectName + ' mobile-first styles */');
		}
		if (!grunt.file.exists(projectCSS + '_768.css')) {
			grunt.log.writeln('Creating ' + projectCSS + '_768.css');
			grunt.file.write(projectCSS + '_768.css', '/* ' + options.projectName + ' desktop styles */');
		}
		if (!grunt.file.exists(projectCSS + '_1024.css')) {
			grunt.log.writeln('Creating ' + projectCSS + '_1024.css');
			grunt.file.write(projectCSS + '_1024.css', '/* ' + options.projectName + ' large desktop styles */');
		}
		if (!grunt.file.exists('index.php')) {
			grunt.log.writeln('Creating index.php redirect file');
			var php = '<?php' + '\n' +
				'\t$json = json_decode(file_get_contents(\'package.json\'));\n' +
				'\theader( \'Location: \' . $json->projectSettings->rcfLocalFolder . \'/viewer/index.php\' );\n' +
				'?>';

			grunt.file.write('index.php', php);
		}
	});

	grunt.registerTask('validate', [
		'exec:schemaValidate',
		'validateActivitySetIds',
		'validateGrammarReferenceItems'
	]);

	grunt.registerTask('updateRCF', [
		'exec:updateRCF',
		'exec:updateXSD',
		'exec:updateRCFLink'
	]);

	grunt.registerTask('xmlSplit', [
		'exec:xmlValidateSplit',
		'exec:xmlSplit',
		'createMissingFiles',
		'exec:schemaValidate'
	]);

	/*
	 can be run :
	 grunt createEmptyFiles --act=10 --ref=10
	 */
	grunt.registerTask('createEmptyFiles', 'Create empty Activities / ReferenceContent files', function () {
		// -act 10 -ref 5
		var activities = grunt.option('act') || 0;
		var referenceItems = grunt.option('ref') || 0;

		var execCmd = grunt.config('exec.generateEmptyActivities.command');
		execCmd += ' -act ' + activities + ' -ref ' + referenceItems;
		grunt.log.writeln('Executing : ' + execCmd);
		grunt.config('exec.generateEmptyActivities.command', execCmd);
		grunt.log.writeln('....' + grunt.config('exec.generateEmptyActivities.command'));
		grunt.task.run('exec:generateEmptyActivities');

	});

	grunt.registerTask('regenerateProduction', 'Regenerate the Production Folder with new IDs', function () {
		grunt.task.run('exec:regenerateProduction');
	});

	grunt.registerTask('fixJson', 'fix the rcf json', function () {
		//
		// remove the 'placeholder' from the JSON
		// - rcfPlaceholder is only in there because of the complicated way the json
		//   is created via xslt
		// - this small task to remove it from the generated json is a lot less work
		//   than having to rewrite the XSLT to handle recursive values etc :)

		// with the new 'versioning' structure, json files could be spread out through the 'release' (cdn) folder
		// so we will need to recursively find all the files and process them accordingly
		//
		var lastPath = '';
		grunt.file.recurse(rcfConfig.rcfOutputFolder, function (abspath, rootdir, subdir, filename) {
			if (filename.toLowerCase().indexOf('.json') > -1) {
				if (lastPath !== subdir) {
					lastPath = subdir;
					grunt.log.writeln('Processing json in [' + lastPath + ']');
				}
				var jsonContents = grunt.file.readJSON(abspath);
				if (jsonContents.answers && jsonContents.answers.length > 0) {
					if (!!(jsonContents.answers[0].rcfPlaceHolder)) {
						jsonContents.answers.splice(0, 1);
						grunt.file.write(abspath, JSON.stringify(jsonContents, null, 2));
					}
				}
			}
		});
	});

	grunt.registerTask('createManifest', function () {

		var packageJson = grunt.file.readJSON('package.json');
		var rcfFolder = packageJson.projectSettings.rcfLocalFolder;
		var releaseFolder = packageJson.projectSettings.releaseFolder;

		var hierarchyFile = rcfPathsHelper.getManifestFilePath(true);
		var outputManifestFile = releaseFolder + path.sep + 'manifest.json';
		var generateManifestStylesheet = rcfFolder + path.sep + 'xsl' + path.sep + 'utilities' + path.sep + 'generate_spk_manifest.xsl';

		var config = {
			options: {
				stylesheet: generateManifestStylesheet
			},
			compile: {
				files: [{
					dest: outputManifestFile,
					src: hierarchyFile
				}]
			}
		};

		grunt.config('xsltproc', config);
		grunt.task.run('xsltproc');
		grunt.task.run('replace:absoluteCdnPathInManifestFile');

	});

	grunt.registerTask('exportPseudoIDs', 'Pseudo ID Extraction', function () {
		var exportLevel = grunt.option('level') || null;
		var exportFolder = './production/project/products/' + ((!!exportLevel ? exportLevel + '/' : ''));
		var exportFileName = grunt.option('file') || 'pseudo_ids.csv';
		var exporter = require('./grunt/exportActivityDetails.js')(grunt);

		grunt.log.writeln('Exporting pseudoIDs to file [' + exportFileName + ']');
		grunt.log.writeln('Inspecting activity xml files ' + (!!exportLevel ? ' from level [' + exportLevel + ']' : ' from all levels'));

		// 'delete' is a reserved word before ES5 (JSHint protecting)
		grunt.file['delete'](exportFileName);

		exporter.extractFromActivityXmlFiles(exportFolder, exportFileName, false);
	});

	grunt.registerTask('importPseudoIDs', 'Pseudo ID updating', function () {
		var importFileName = (grunt.option('file') || 'pseudo_ids.csv');

		// does it exist ?
		grunt.log.writeln('Looking for [', importFileName, ']');

		if (!grunt.file.exists(importFileName)) {
			grunt.log.writeln('file [pseudo_ids.csv] does not exist !');
			return;
		}

		var importer = require('./grunt/importActivityDetails.js')(grunt);
		importer.importActivityDetails(importFileName, './production/project/products/');

	});

	grunt.registerTask('exportActivityDetails', 'Export Activity Details', function () {

		var exportLevel = grunt.option('level') || null;
		var exportFolder = './production/project/products/' + ((!!exportLevel ? exportLevel + '/' : ''));
		var exportFileName = grunt.option('file') || 'activity_details.csv';
		var exporter = require('./grunt/exportActivityDetails.js')(grunt);

		grunt.log.writeln('Exporting activity details to file [' + exportFileName + ']');
		grunt.log.writeln('Reading activity metadata titles from ' + (!!exportLevel ? ' level [' + exportLevel + ']' : ' all levels'));

		// 'delete' is a reserved word before ES5 (JSHint protecting)
		grunt.file['delete'](exportFileName);

		exporter.extractFromActivityXmlFiles(exportFolder, exportFileName, true);

	});

	grunt.registerTask('importActivityDetails', 'Import Activity Details from a previously exported csv file', function () {
		var importFileName = (grunt.option('file') || 'activity_details.csv');
		// does it exist
		grunt.log.writeln('Looking for [', importFileName, ']');
		if (!grunt.file.exists(importFileName)) {
			grunt.log.writeln('file [' + importFileName + '] does not exist !');
			return;
		}
		var importer = require('./grunt/importActivityDetails.js')(grunt);
		importer.importActivityDetails(importFileName, './production/project/products/');
	});

	grunt.registerTask('createNewsItem', 'Create news item section and child activitysets / activites', function() {
		var outputLocation = (grunt.option('outputPath'));
		var mecID = (grunt.option('mecID'));

		if(!outputLocation) {
            console.log('usage: grunt createNewsItem -outputPath=<news-item-section-path> -mecID=<mecID to use>');
		    grunt.fail.fatal('No output section path / name specified !');
			return;
		}
		if(!mecID) {
            console.log('usage: grunt createNewsItem -outputPath=<news-item-section-path> -mecID=<mecID to use>');
		    grunt.fail.fatal('No mec ID provided');
			return;
		}
		var createNewsItem = require('./grunt/createNewsItem.js')(grunt);
		createNewsItem.createNewsItemSection(outputLocation, mecID);

	});

	// load all grunt tasks
	rcfPathsHelper = require('./grunt/rcfPathsHelper.js')(grunt);
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

};
