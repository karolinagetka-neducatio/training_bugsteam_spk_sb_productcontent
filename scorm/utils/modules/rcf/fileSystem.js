'use strict';

var glob = require('glob');
var path = require('path');

module.exports = {
	getLevelMetadataPath: getLevelMetadataPath,
	getUnitMetadataPaths : getUnitMetadataPaths,
	getSectionMetadataPaths : getSectionMetadataPaths,
	getActivitySetMetadataPaths: getActivitySetMetadataPaths,
	getActivityPaths : getActivityPaths,
	getFolderPath : getFolderPath,
	getFolderName : getFolderName,
	getLevelFolderNames : getLevelFolderNames,
	getProjectLevelFolderByName : getProjectLevelFolderByName
};

function getLevelFolderNames(projectFolderPath) {
	var paths = searchFileSystem(projectFolderPath, '**/level_*/');
	return paths.map(getFolderName);
}

function getProjectLevelFolderByName(productionFolderPath, levelName) {
	var searchResults = searchFileSystem(productionFolderPath, '**/' + levelName + '/');
	if (searchResults.length > 1) {
		throw new Error('should only be one level folder: ' + levelName);
	}
	return (searchResults.length === 1) ? searchResults[0] : null;
}

function getLevelMetadataPath(projectLevelFolderPath) {
	var searchResults = searchFileSystem(projectLevelFolderPath, 'metadata.xml');
	if (searchResults.length > 1) {
		throw new Error('level folder should only have one metadata.xml file: ' + projectLevelFolderPath);
	}
	return (searchResults.length === 1) ? searchResults[0] : null;
}

function getFolderPath(filePath) {
	return path.dirname(filePath);
}

function getFolderName(folderPath) {
	return path.basename(folderPath);
}

function getUnitMetadataPaths(projectLevelFolderPath) {
	return searchFileSystem(projectLevelFolderPath, '**/unit_*/metadata.xml');
}

function getSectionMetadataPaths(projectLevelFolderPath) {
	return searchFileSystem(projectLevelFolderPath, '**/section_*/metadata.xml');
}

function getActivitySetMetadataPaths(projectLevelFolderPath) {
	return searchFileSystem(projectLevelFolderPath, '**/activityset_*/metadata.xml');
}

function getActivityPaths(projectLevelFolderPath) {
	return searchFileSystem(projectLevelFolderPath, '**/activity_*/????????????????????????????????.xml');
}

function searchFileSystem(folderPath, searchPattern) {

	var globOptions = {
		cwd: folderPath,
		silent : true,
		nocase : true,
		realpath : true
	};

	return glob.sync(searchPattern, globOptions);
}
