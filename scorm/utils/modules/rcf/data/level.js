'use strict';

var fileSystem = require('../fileSystem.js');
var xml = require('../../xml.js');
var xmlMapper = require('../../xmlMapper.js');

module.exports = {
	get: get
};

function get(projectLevelFolderPath) {

	var result = {};

	var levelMetadataPath = fileSystem.getLevelMetadataPath(projectLevelFolderPath);
	if (levelMetadataPath === null) {
		return result;
	}

	result.metadataPath = levelMetadataPath;

	var levelMetadata = xml.loadXmlFile(levelMetadataPath);

	xmlMapper.mapNonEmptyXmlValue(result, 'title', levelMetadata, '/metadata/title');
	result.levelId = fileSystem.getFolderName(projectLevelFolderPath);
	xmlMapper.mapNonEmptyXmlValue(result, 'seriesId', levelMetadata, '/metadata/series');

	return result;
}



