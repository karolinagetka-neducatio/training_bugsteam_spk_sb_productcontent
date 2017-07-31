'use strict';

module.exports = {
	buildFrom: buildFrom
};

var projectLevelObjectOrdering = require('../../../rcf/sort/projectLevelObjectOrdering.js');
var unitItemBuilder = require('./unit/itemBuilder.js');

/**
 * Build the unit level structure from the passed variables
 *
 * @param {Object} units - unit objects
 * @param {Object} activitySets - project level activity sets
 * @param {Object} activities - project level activities
 * @param {Object} [sections] - optional project level sections
 *
 */
function buildFrom(units, activitySets, activities, sections) {

	if (!units) {
		return [];
	}

	var organisationItems = [];

	var orderedUnitKeys = projectLevelObjectOrdering.getOrderedKeys(units);
	orderedUnitKeys.forEach(function(unitKey) {

		var unit = units[unitKey];
		var unitItem = unitItemBuilder.buildFrom(unitKey, unit, activitySets, activities, sections);
		organisationItems.push(unitItem);
	});

	return organisationItems;
}
