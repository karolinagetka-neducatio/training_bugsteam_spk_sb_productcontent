'use strict';

module.exports = {
	buildFrom: buildFrom
};

var idBuilder = require('./idBuilder.js');
var projectLevelActivities = require('../../../../rcf/query/projectLevelActivities.js');
var projectLevelObjectOrdering = require('../../../../rcf/sort/projectLevelObjectOrdering.js');
var activityItemBuilder = require('../activity/itemBuilder.js');

function buildFrom(activitySetKey, activitySet, activities) {

	var activitySetItem = {
		id: idBuilder.buildFrom(activitySet.id),
		items: []
	};

	if (activitySet.title !== undefined) {
		activitySetItem.title = activitySet.title;
	}

	var activitiesInActivitySet = projectLevelActivities.getAllInActivitySet(activities, activitySetKey);

	var orderedActivityKeys = projectLevelObjectOrdering.getOrderedKeys(activitiesInActivitySet);
	orderedActivityKeys.forEach(function (activityKey) {

		var activity = activitiesInActivitySet[activityKey];
		var activityItem = activityItemBuilder.buildFrom(activity, activitySet);
		activitySetItem.items.push(activityItem);
	});

	return activitySetItem;
}
