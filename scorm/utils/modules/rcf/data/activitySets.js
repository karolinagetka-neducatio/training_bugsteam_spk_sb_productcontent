'use strict';

var fileSystem = require('../fileSystem.js');
var commonMetadata = require('./commonMetadata.js');
var activitySetKeys = require('./activitySetKeys.js');
var extend = require('util')._extend;

module.exports = {
	get: get
};

function get(projectLevelFolderPath) {

	var result = {};

	var activitySetPaths = fileSystem.getActivitySetMetadataPaths(projectLevelFolderPath);
	activitySetPaths.forEach(getDomainModelForMetadata);

	return result;

	function getDomainModelForMetadata(metadataPath) {
		var metadataResult = commonMetadata.get(metadataPath);
		var folderPath = fileSystem.getFolderPath(metadataPath);
		var keys = activitySetKeys.getParentKeysForActivitySet(folderPath);
		extend(metadataResult, keys);
		result[folderPath] = metadataResult;
	}
}
