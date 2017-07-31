'use strict';

var objectKeys = require('../../object/objectKeys.js');
var rcfBranchRules = require('./rcfBranchRules.js');
var projectPackageJson = require('../projectPackageJson.js');

module.exports = {
	unitsPresent : unitsPresent,
	unitsAreReferenced : unitsAreReferenced,
	activitySetsPresent : activitySetsPresent,
	activitySetsAreReferenced : activitySetsAreReferenced,
	projectLevel : projectLevelFunc,
	seriesId : seriesId,
	title : title,
	units : unitsFunc,
	sections : sectionsFunc,
	activitySets: activitySetsFunc,
	activities : activitiesFunc,
	activitySetKeys : activitySetKeys,
	activityKeys : activityKeys
};

function unitsPresent(projectLevel) {
	return rcfBranchRules.validateBranchesPresent(projectLevel.units, 'unit');
}

function unitsAreReferenced(projectLevel) {
	var unitKeysReferencedByActivitySets = objectKeys.createLookupOfChildKeyUniqueValues(projectLevel.activitySets, 'unitKey');
	return rcfBranchRules.validateBranchesAreReferenced(projectLevel.units, unitKeysReferencedByActivitySets, 'activity set');
}

function activitySetsPresent(projectLevel) {
	return rcfBranchRules.validateBranchesPresent(projectLevel.activitySets, 'activity set');
}

function activitySetsAreReferenced(projectLevel) {
	var activitySetKeysReferencedByActivities = objectKeys.createLookupOfChildKeyUniqueValues(projectLevel.activities, 'activitySetKey');
	return rcfBranchRules.validateBranchesAreReferenced(projectLevel.activitySets, activitySetKeysReferencedByActivities, 'activity');
}

function projectLevelFunc(projectLevel) {
	if (!projectLevel) {
		throw new Error('projectLevel is null or undefined');
	}
}

function seriesId(projectLevel) {
	if (!projectLevel.seriesId) {
		return('/metadata/series must be specified in \'' + projectLevel.metadataPath + '\'');
	}
}

function title(projectLevel) {
	if (!projectLevel.title) {
		return('/metadata/title must be specified in \'' + projectLevel.metadataPath + '\'');
	}
}

function unitsFunc(projectLevel) {
	var units = projectLevel.units;
	if (units === undefined) { return; }

	var errors = [];
	Object.keys(units).forEach(function (unitKey) {
		var unit = units[unitKey];

		if (!unit.id) {
			errors.push('/metadata/id must be specified in \'' + unit.metadataPath + '\'');
		}

		if (!unit.title) {
			errors.push('/metadata/title must be specified in \'' + unit.metadataPath + '\'');
		}
	});
	return errors;
}

function sectionsFunc(projectLevel) {
	var sections = projectLevel.sections;
	if (sections === undefined) { return; }

	var errors = [];
	Object.keys(sections).forEach(function (sectionKey) {
		var section = sections[sectionKey];

		if (!section.id) {
			errors.push('/metadata/id must be specified in \'' + section.metadataPath + '\'');
		}

		if (!section.title) {
			errors.push('/metadata/title must be specified in \'' + section.metadataPath + '\'');
		}
	});
	return errors;
}

function activitySetsFunc(projectLevel) {
	var activitySets = projectLevel.activitySets;
	if (activitySets === undefined) { return; }

	var errors = [];
	Object.keys(activitySets).forEach(function (activitySetKey) {
		var activitySet = activitySets[activitySetKey];

		if (!activitySet.id) {
			errors.push('/metadata/id must be specified in \'' + activitySet.metadataPath + '\'');
		}

		if (!activitySet.title && activitySet.subtitle) {
			errors.push('/metadata/title must be specified if /metadata/subtitle is specified, in \'' + activitySet.metadataPath + '\'');
		}
	});
	return errors;
}

function activitiesFunc(projectLevel) {
	var activities = projectLevel.activities;
	if (activities === undefined) { return; }

	var errors = [];
	Object.keys(activities).forEach(function (activityKey) {
		var activity = activities[activityKey];

		if (!activity.id) {
			errors.push('/activity@id must be specified in \'' + activity.metadataPath + '\'');
		}

		if (!activity.pseudoId) {
			errors.push('/activity@pseudoID must be specified in \'' + activity.metadataPath + '\'');
		}

		if (!activity.title) {
			if (activity.isAnswerKey === true) {
				errors.push('/activity/metadata/title must be specified for activity with /activity/metadata/isAnswerKey set to \'y\' in \'' + activity.metadataPath + '\'');
			} else if (projectPackageJson.useActivityTitlesOnlyForActivities()) {
				errors.push('/activity/metadata/title must be specified in \'' + activity.metadataPath + '\' where package.json setting projectSettings.scorm.activity.useActivityTitlesOnly is \'true\'');
			} else {
				var activitySet = projectLevel.activitySets[activity.activitySetKey] || {metadataPath: '(activitySet metadata.xml)'};
				if (!activitySet.title) {
					errors.push('/activity/metadata/title must be specified in \'' + activity.metadataPath + '\', or /metadata/title must be specified in \'' + activitySet.metadataPath + '\'');
				}
			}
		}
	});
	return errors;
}

function activitySetKeys(projectLevel) {
	var result = [];
	result = result.concat(rcfBranchRules.validateBranchReferences(projectLevel.activitySets, 'unitKey', 'Unit', 'Unit_'));
	result = result.concat(rcfBranchRules.validateBranchReferences(projectLevel.activitySets, 'sectionKey', 'Section', 'Section_'));
	return result;
}

function activityKeys(projectLevel) {
	return rcfBranchRules.validateBranchReferences(projectLevel.activities, 'activitySetKey', 'Activity Set', 'ActivitySet_');
}
