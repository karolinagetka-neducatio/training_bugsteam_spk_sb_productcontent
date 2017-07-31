'use strict';

module.exports = {
	getAllInActivitySet: getAllInActivitySet
};

function getAllInActivitySet(activities, activitySetKey) {

	if (!activities || !activitySetKey) {
		return {};
	}

	var matchingActivities = {};

	Object.keys(activities).forEach(function(activityKey) {

		var activity = activities[activityKey];

		if (activity.activitySetKey === activitySetKey) {
			matchingActivities[activityKey] = activity;
		}
	});

	return matchingActivities;
}
