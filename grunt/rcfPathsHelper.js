'use strict';

module.exports = function(grunt){
	var path = require('path');
	var upath = require('upath');
	var fs = require('fs');

	var fullPath;

	function walkForFolder (dir, required) {
	 	var results = [];
    	var list = fs.readdirSync(dir);
    	list.forEach(function(file) {
        	fullPath = upath.join(dir, file);
        	var stat = fs.statSync(fullPath);
        	if (stat && stat.isDirectory()) {
        		if ( file === required ) {
        			results.push(fullPath);
        		} else {
        			results = results.concat(walkForFolder(fullPath, required));
        		}
        	}
    	});
    	return results;
	}

	function findFolderLocation(root, folderName) {
		return walkForFolder(root, folderName)[0];
	}

	function findAmbiguousFolderLocations(root, folderName) {
		var locations = walkForFolder(root, folderName);
		if (locations.length === 0) {
			throw 'could not find expected folder ' + folderName + ' under ' + root;
		}
		if (locations.length > 1) {
			for (var i = 0; i < locations.length; i++) {
				if (fileNameContains(locations[i], '/level_') && !fileNameContains(locations[i], '/assets')) {
					return locations[i];
				}
			}
		}
		return locations[0];
	}

	function fileNameContains(fileName, pattern) {
		return fileName.toLowerCase() !== fileName.toLowerCase().replace(pattern, '');
	}

	function findSharedStyles(root) {
		var styles = findFolderLocation(root, 'shared') + '/style';
		var packageJson = grunt.file.readJSON('package.json');

		var projectName = packageJson.projectSettings.projectName;

		return {
			css: upath.join(styles, projectName + '.css'),
			css768: upath.join(styles, projectName + '_768.css'),
			css1024: upath.join(styles, projectName + '_1024.css')
		};
	}

	function getCssFilePathsForLevel() {

		var levelFolderPath = getPublishedLevelFolderPath();

		return {
			css: upath.join(levelFolderPath, 'assets/style/level.css'),
			css768: upath.join(levelFolderPath, 'assets/style/level_768.css'),
			css1024: upath.join(levelFolderPath, 'assets/style/level_1024.css')
		};
	}

	function getManifestFilePath() {

		var productHierarchyFilePath = getPublishedLevelFolderPath() + '/productHierarchy.xml';

		if(!grunt.file.exists(productHierarchyFilePath)) {
			grunt.fail.fatal('Manifest file does not exist: ' + productHierarchyFilePath);
		}

		return productHierarchyFilePath;
	}

    function getPublishedLevelFolderPath(locationFixed) {

		var packageJson = grunt.file.readJSON('package.json');

		var rcfConfig = packageJson.projectSettings;
 		rcfConfig.useVersion = rcfConfig.useVersion || 'n';

		var versionPath = !locationFixed && rcfConfig.useVersion.toUpperCase()==='Y' ? path.sep + packageJson.version : '';

		var releaseFolder = rcfConfig.releaseFolder;

		var seriesName = rcfConfig.projectName;
		var outputLevelsFolder = path.normalize( releaseFolder + path.sep + 'series' + path.sep + seriesName + versionPath);

		return outputLevelsFolder + path.sep + getPublishedLevelFolder( outputLevelsFolder );
	}

	function getPublishedLevelFolder( publishedFoldersLocation ) {
		var publishedLevels = fs.readdirSync( publishedFoldersLocation );
		for(var i=0; i < publishedLevels.length; i++) {
			var publishedLevelName = publishedLevels[i];
			if(publishedLevelName.toLowerCase().substring(0,6)==='level_') {
				return publishedLevelName;
			}
		}
		return null;
	}

	return {
		findFolderLocation : findFolderLocation,
		findAmbiguousFolderLocations : findAmbiguousFolderLocations,
		findSharedStyles: findSharedStyles,
		getCssFilePathsForLevel: getCssFilePathsForLevel,
		getManifestFilePath: getManifestFilePath
	};
};
