'use strict';

var fileSystem = require('./fileSystem.js');

module.exports = {
	getFirstPublishedLevelFolderName : getFirstPublishedLevelFolderName
};

function getFirstPublishedLevelFolderName(scormOutputCdnPath) {
	var allLevelFolderNames = fileSystem.getLevelFolderNames(scormOutputCdnPath);
	allLevelFolderNames.sort();
	if (allLevelFolderNames.length === 0) { throw new Error('no published levels'); }

	return allLevelFolderNames[0];
}

