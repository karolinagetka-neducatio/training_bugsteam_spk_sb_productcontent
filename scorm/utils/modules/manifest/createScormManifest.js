'use strict';

module.exports = createScormManifest;

var console = require('console');
var projectLevelReader = require('../rcf/projectLevelReader.js');
var projectValidator = require('../rcf/validation/projectValidator.js');
var scormManifestBuilder = require('./builder/scormManifestBuilder.js');
var scormManifestTemplateService = require('./scormManifestTemplateService.js');
var scormManifestXmlWriter = require('./scormManifestXmlWriter.js');

function createScormManifest(projectLevelFolderPath, scormOutputManifestFilePath) {

	var projectLevel = projectLevelReader.read(projectLevelFolderPath);

	var validationErrors = projectValidator.validate(projectLevel);
	if (validationErrors.length > 0) {
		validationErrors.forEach(logError);
		throw new Error('Validation of project level failed');
	}

	var scormManifest = scormManifestBuilder.buildFrom(projectLevel);
	var scormManifestHandlebarsTemplate = scormManifestTemplateService.getHandlebarsTemplate();

	scormManifestXmlWriter.write(scormManifest, scormManifestHandlebarsTemplate, scormOutputManifestFilePath);
}

function logError(error) {
	console.error(error);
}
