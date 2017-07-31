'use strict';

module.exports = {
	buildFrom: buildFrom
};

var idBuilder = require('./idBuilder.js');
var titleBuilder = require('./titleBuilder.js');
var projectLevelActivitySets = require('../../../../rcf/query/projectLevelActivitySets.js');
var projectLevelObjectOrdering = require('../../../../rcf/sort/projectLevelObjectOrdering.js');
var activitySetItemBuilder = require('../activitySet/itemBuilder.js');

function buildFrom(sectionKey, section, activitySets, activities) {

	var sectionItem = {
		id: idBuilder.buildFrom(section.id),
		title: titleBuilder.buildFrom(section.title, section.subtitle),
		items: []
	};

	var activitySetsInSection  = projectLevelActivitySets.getAllInSection(activitySets, sectionKey);

	var orderedActivitySetKeys = projectLevelObjectOrdering.getOrderedKeys(activitySetsInSection);
	orderedActivitySetKeys.forEach(function (activitySetKey) {
		var activitySet = activitySetsInSection[activitySetKey];
		var activitySetItem = activitySetItemBuilder.buildFrom(activitySetKey, activitySet, activities);
		sectionItem.items.push(activitySetItem);
	});

	return sectionItem;
}
