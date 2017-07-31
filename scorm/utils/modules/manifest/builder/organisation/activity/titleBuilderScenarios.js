'use strict';

var projectPackageJson = require('../../../../rcf/projectPackageJson.js');

module.exports = {
	whenIsAnswerKeyActivity: whenIsAnswerKeyActivity,
	whenUseActivityTitlesOnlyForActivities: whenUseActivityTitlesOnlyForActivities,
	whenTitles: whenTitles
};

function whenUseActivityTitlesOnlyForActivities(activityTitle) {
	if (projectPackageJson.useActivityTitlesOnlyForActivities() === true) {
		return {
			activityTitle: activityTitle
		};
	}
}

function whenIsAnswerKeyActivity(activityTitle, isAnswerKey) {
	if (isAnswerKey === true) {
		return {
			activityTitle: activityTitle
		};
	}
}

function whenTitles(titles) {
	var allTitlesSet = titles.length > 0 && titles.every(isTruthy);
	if (allTitlesSet) {
		return {
			activityTitle: titles.join(': ')
		};
	}
}

function isTruthy(title) {
	return Boolean(title);
}
