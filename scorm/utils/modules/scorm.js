'use strict';

module.exports = {
	getManifestPath : getManifestPath,
	getSchemaPath : getSchemaPath
};

var path = require('path');

function getManifestPath(projectRootFolderPath) {
	return path.resolve(projectRootFolderPath, 'scorm-output/imsmanifest.xml');
}

function getSchemaPath(schemaFolderPath) {
	return path.resolve(schemaFolderPath, 'macmillan-scorm-extension.xsd');
}
