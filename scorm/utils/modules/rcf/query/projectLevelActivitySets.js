'use strict';

module.exports = {
	getAllDirectlyUnderUnit: getAllDirectlyUnderUnit,
	getAllInSection: getAllInSection
};

function getAllDirectlyUnderUnit(activitySets, unitKey) {

	return filterActivitySets(activitySets, function (activitySet) {
		return (activitySet.unitKey === unitKey) && !activitySet.sectionKey ;
	});
}

function getAllInSection(activitySets, sectionKey) {

	return filterActivitySets(activitySets, function (activitySet) {
		return activitySet.sectionKey === sectionKey;
	});
}

function filterActivitySets(activitySets, matchFunction) {

	if (!activitySets) {
		return {};
	}

	var matchingActivitySets = {};

	Object.keys(activitySets).forEach(function(activitySetKey) {

		var activitySet = activitySets[activitySetKey];

		if (matchFunction(activitySet)) {
			matchingActivitySets[activitySetKey] = activitySet;
		}
	});

	return matchingActivitySets;
}
