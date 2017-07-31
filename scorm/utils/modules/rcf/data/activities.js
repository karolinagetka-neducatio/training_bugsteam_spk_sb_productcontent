'use strict';

var fileSystem = require('../fileSystem.js');
var activity = require('./activity.js');

module.exports = {
	get: get
};

function get(projectLevelFolderPath) {

	var result = {};

	var activityPaths = fileSystem.getActivityPaths(projectLevelFolderPath);
	activityPaths.forEach(getDomainModelForMetadata);

	return result;

	function getDomainModelForMetadata(metadataPath) {
		var metadataResult = activity.get(metadataPath);
		var folderPath = fileSystem.getFolderPath(metadataPath);
		result[folderPath] = metadataResult;

		metadataResult.activitySetKey = fileSystem.getFolderPath(folderPath);
	}
}
