'use strict';

module.exports = {
	buildFrom: buildFrom
};

var titleBuilder = require('./titleBuilder.js');
var parametersBuilder = require('./parametersBuilder.js');

function buildFrom(activity, activitySet) {

	return {
		id: activity.pseudoId,
		title: titleBuilder.buildFrom(activitySet.title, activitySet.subtitle, activity.title, activity.isAnswerKey),
		parameters: parametersBuilder.buildFrom(activity.id)
	};
}
