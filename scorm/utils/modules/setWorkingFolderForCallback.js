'use strict';

module.exports = setWorkingFolderForCallback;

function setWorkingFolderForCallback(workingFolder, callback) {
	var existingCwd = process.cwd();
	try {
		process.chdir(workingFolder);
		callback();
	}
	catch(e) {}
	finally {
		process.chdir(existingCwd);
	}
}