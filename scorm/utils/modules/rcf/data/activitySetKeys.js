'use strict';

var fileSystem = require('../fileSystem.js');
var sectionRules = require('../validation/sectionRules.js');

module.exports = {
	getParentKeysForActivitySet: getParentKeysForActivitySet
};

function getParentKeysForActivitySet(activitySetFolderPath) {

	var parentFolderPath = fileSystem.getFolderPath(activitySetFolderPath);
	var parentFolderName = fileSystem.getFolderName(parentFolderPath);

	var result = {};

	if (sectionRules.folderIsSection(parentFolderName)) {
		result.sectionKey = parentFolderPath;
		result.unitKey = fileSystem.getFolderPath(parentFolderPath);
	}
	else {
		result.unitKey = parentFolderPath;
	}

	return result;
}
