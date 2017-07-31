'use strict';

var fileSystem = require('../fileSystem.js');

module.exports = {
	validateBranchesPresent : validateBranchesPresent,
	validateBranchesAreReferenced : validateBranchesAreReferenced,
	validateBranchReferences : validateBranchReferences
};

function validateBranchesPresent(rcfBranchCollection, branchDisplayName) {
	var keys = Object.keys(rcfBranchCollection);
	if (keys.length === 0) {
		return branchDisplayName + '(s) must be defined';
	}
}

/**
 * Return error text in array for any rcf branches without a reference
 * @param rcfBranchCollection - an object with every property as an rcf branch, each property key is the branch path
 * @param rcfBranchReferences - an object with a lookup of known branch references, each property key is a branch path, each property value is (true)
 * @param referenceBranchTypeDisplayName - the type of expected reference branch (e.g. 'activity set', 'activity') to be used in an error message if no branch references are found
 * @returns {Array} - array of objects of branches without references
 */
function validateBranchesAreReferenced(rcfBranchCollection, rcfBranchReferences, referenceBranchTypeDisplayName) {
	var result = [];
	var keys = Object.keys(rcfBranchCollection);
	keys.forEach(checkBranchReferenced);
	return result;

	function checkBranchReferenced(rcfBranchKey) {
		if (!rcfBranchReferences[rcfBranchKey]) {
			result.push(rcfBranchKey + ' must have ' + referenceBranchTypeDisplayName + '(s)');
		}
	}
}
function validateBranchReferences(rcfBranchCollection, branchReferenceKeyName, branchReferenceDisplayName, branchReferenceFolderPrefix) {
	var result = [];
	var keys = Object.keys(rcfBranchCollection);
	keys.forEach(checkBranchReference);
	return result;

	function checkBranchReference(rcfBranchKey) {
		var rcfBranch = rcfBranchCollection[rcfBranchKey];
		var branchReferencePath = rcfBranch[branchReferenceKeyName];
		if (branchReferencePath === undefined) { return; }

		var folderName = fileSystem.getFolderName(branchReferencePath);
		folderName = folderName.toLowerCase();

		if (!folderNameStartsWithBranchFolderPrefix(folderName, branchReferenceFolderPrefix)) {
			result.push('\'' + rcfBranch.metadataPath + '\' must have related \'' + branchReferenceDisplayName + '\' folder with name starting \'' + branchReferenceFolderPrefix +'\'. Actual name: \'' + branchReferencePath + '\'');
		}
	}
}

function folderNameStartsWithBranchFolderPrefix(folderName, branchReferenceFolderPrefix) {
	return folderName.indexOf(branchReferenceFolderPrefix.toLowerCase(), 0) === 0;
}
