'use strict';
var scorm = require('./scorm.js');
var xml = require('./xml.js');
var console = require('console');
var setWorkingFolderForCallback = require('./setWorkingFolderForCallback.js');

module.exports = validateScormManifest;

function validateScormManifest(projectRootFolderPath, schemaFolderPath) {

	return new Promise(function(resolve, reject) {

		var schemaPath = scorm.getSchemaPath(schemaFolderPath);
		var schema = xml.loadXmlFile(schemaPath);
		var manifestPath = scorm.getManifestPath(projectRootFolderPath);
		var manifest = xml.loadXmlFile(manifestPath);

		//Implements a workaround for libxmljs bug: https://github.com/polotek/libxmljs/issues/261,
		//set node working directory temporarily so xsd relative paths handled correctly
		setWorkingFolderForCallback(schemaFolderPath, validate);
		function validate() {
			var result = manifest.validate(schema);
			if (result) {
				resolve();
			} else {
				var errorMessages = manifest.validationErrors.map(function(obj) { return obj.message; });
				console.log(errorMessages);
				reject();
			}
		}
	});
}

