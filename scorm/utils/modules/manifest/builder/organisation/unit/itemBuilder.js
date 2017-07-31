'use strict';

module.exports = {
	buildFrom: buildFrom
};

var idBuilder = require('./idBuilder.js');
var titleBuilder = require('./titleBuilder.js');
var projectLevelSections = require('../../../../rcf/query/projectLevelSections.js');
var projectLevelActivitySets = require('../../../../rcf/query/projectLevelActivitySets.js');
var projectLevelObjectOrdering = require('../../../../rcf/sort/projectLevelObjectOrdering.js');
var sectionItemBuilder = require('../section/itemBuilder.js');
var activitySetItemBuilder = require('../activitySet/itemBuilder.js');

/**
 * Build the unit level structure from the passed variables
 *
 * @param {string} unitKey - unit key
 * @param {Object} unit - unit object
 * @param {Object} activitySets - project level activity sets
 * @param {Object} activities - project level activities
 * @param {Object} [sections] - optional project level sections
 *
 */
function buildFrom(unitKey, unit, activitySets, activities, sections) {

	var unitItem = {
		id: idBuilder.buildFrom(unit.id),
		title: titleBuilder.buildFrom(unit.title, unit.subtitle),
		items: []
	};

	if(sections) {

		var sectionsInUnit = projectLevelSections.getAllInUnit(sections, unitKey);
		var orderedSectionKeys = projectLevelObjectOrdering.getOrderedKeys(sectionsInUnit);

		orderedSectionKeys.forEach(function(sectionKey) {
			var section = sectionsInUnit[sectionKey];
			var sectionItem = sectionItemBuilder.buildFrom(sectionKey, section, activitySets, activities);
			unitItem.items.push(sectionItem);
		});
	}

	var activitySetsInUnit = projectLevelActivitySets.getAllDirectlyUnderUnit(activitySets, unitKey);

	var orderedActivitySetKeys = projectLevelObjectOrdering.getOrderedKeys(activitySetsInUnit);
	orderedActivitySetKeys.forEach(function (activitySetKey) {

		var activitySet = activitySetsInUnit[activitySetKey];
		var activitySetItem = activitySetItemBuilder.buildFrom(activitySetKey, activitySet, activities);
		unitItem.items.push(activitySetItem);
	});

	return unitItem;
}
