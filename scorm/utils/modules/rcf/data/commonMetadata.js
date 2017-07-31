'use strict';

var xml = require('../../xml.js');
var xmlMapper = require('../../xmlMapper.js');

module.exports = {
	get: get
};

function get(metadataPath) {

	var result = {};

	result.metadataPath = metadataPath;

	var metadata = xml.loadXmlFile(metadataPath);
	xmlMapper.mapNonEmptyXmlValue(result, 'id', metadata, '/metadata/id');
	xmlMapper.mapNonEmptyXmlValue(result, 'title', metadata, '/metadata/title');
	xmlMapper.mapNonEmptyXmlValue(result, 'subtitle', metadata, '/metadata/subtitle');

	return result;
}
