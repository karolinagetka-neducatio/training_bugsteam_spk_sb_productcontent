'use strict';

var fileSystem = require('../fileSystem.js');
var commonMetadata = require('./commonMetadata.js');

module.exports = {
	get: get
};

function get(projectLevelFolderPath) {

	var result = {};

	var metadataPaths = fileSystem.getUnitMetadataPaths(projectLevelFolderPath);
	metadataPaths.forEach(getDomainModelForMetadata);

	return result;

	function getDomainModelForMetadata(metadataPath) {
		var metadataResult = commonMetadata.get(metadataPath);
		var folderPath = fileSystem.getFolderPath(metadataPath);
		result[folderPath] = metadataResult;
	}
}
