'use strict';

var xml = require('../../xml.js');
var xmlMapper = require('../../xmlMapper.js');

module.exports = {
	get: get
};

function get(activityPath) {

	var result = {};

	result.metadataPath = activityPath;

	var metadata = xml.loadXmlFile(activityPath);
	xmlMapper.mapNonEmptyXmlValue(result, 'id', metadata, '/activity/@id');
	xmlMapper.mapNonEmptyXmlValue(result, 'pseudoId', metadata, '/activity/@pseudoID');
	xmlMapper.mapNonEmptyXmlValue(result, 'title', metadata, '/activity/metadata/title');
	xmlMapper.mapYesNoXmlValue(result, 'isAnswerKey', metadata, '/activity/metadata/isAnswerKey');

	return result;
}
