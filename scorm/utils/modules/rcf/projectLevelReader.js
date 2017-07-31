'use strict';

var level = require('./data/level.js');
var units= require('./data/units.js');
var section= require('./data/section.js');
var activitySets = require('./data/activitySets.js');
var activities= require('./data/activities.js');
var keyIndexer = require('./keyIndexer.js');

module.exports = {
	read: read
};

function read(projectLevelFolderPath) {

	var result = level.get(projectLevelFolderPath);

	result.units = units.get(projectLevelFolderPath);
	keyIndexer.indexByKeyNameAscending(result.units);

	result.sections = section.get(projectLevelFolderPath);
	keyIndexer.indexByKeyNameAscending(result.sections);

	result.activitySets = activitySets.get(projectLevelFolderPath);
	keyIndexer.indexByKeyNameAscending(result.activitySets);

	result.activities = activities.get(projectLevelFolderPath);
	keyIndexer.indexByKeyNameAscending(result.activities);

	return result;

}
