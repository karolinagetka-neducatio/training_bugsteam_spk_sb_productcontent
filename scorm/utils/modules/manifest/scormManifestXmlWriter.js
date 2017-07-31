'use strict';

module.exports = {
	write: write
};

var fileSystem = require('fs');

function write(scormManifest, handlebarsTemplate, pathToWriteTo) {

	_validateInputParameters(scormManifest, handlebarsTemplate, pathToWriteTo);

	var xmlString = handlebarsTemplate(scormManifest);

	try {
		fileSystem.writeFileSync(pathToWriteTo, xmlString);
	}
	catch (ex) {
		throw new Error('Failed to write SCORM Manifest XML\n' + ex.message + '\n');
	}
}

function _validateInputParameters(scormManifest, handlebarsTemplate, pathToWriteTo) {

	if (!scormManifest) {
		throw new Error('SCORM Manifest object is null or undefined');
	}

	if (!handlebarsTemplate) {
		throw new Error('handlebarsTemplate is null or undefined');
	}

	if (pathToWriteTo) {
		pathToWriteTo = pathToWriteTo.trim();
	}

	if (!pathToWriteTo) {
		throw new Error('Path to write SCORM manifest XML To is not specified');
	}
}
