'use strict';

var titleBuilderScenarios = require('./titleBuilderScenarios.js');

module.exports = {
	buildFrom: buildFrom
};

function buildFrom(activitySetTitle, activitySetSubTitle, activityTitle, isAnswerKey) {

	var result = titleBuilderScenarios.whenIsAnswerKeyActivity(activityTitle, isAnswerKey) ||
	titleBuilderScenarios.whenUseActivityTitlesOnlyForActivities(activityTitle) ||
	titleBuilderScenarios.whenTitles([activitySetTitle, activitySetSubTitle, activityTitle]) ||
	titleBuilderScenarios.whenTitles([activitySetTitle, activitySetSubTitle]) ||
	titleBuilderScenarios.whenTitles([activitySetTitle, activityTitle]) ||
	titleBuilderScenarios.whenTitles([activitySetTitle]) ||
	titleBuilderScenarios.whenTitles([activityTitle]);

	if (result) {
		return result.activityTitle;
	}
}
