'use strict';

module.exports = {
	useActivityTitlesOnlyForActivities: useActivityTitlesOnlyForActivities
};

var projectPackageJson = require('../../../../package.json');

function useActivityTitlesOnlyForActivities() {

	var value = ((((projectPackageJson || {}).projectSettings || {}).scorm || {}).activity || {}).useActivityTitlesOnly;

	return value === true;
}
