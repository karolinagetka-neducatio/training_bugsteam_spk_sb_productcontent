'use strict';

module.exports = {
	buildFrom: buildFrom
};

var idBuilder = require('./organisation/idBuilder.js');
var itemsBuilder = require('./organisation/itemsBuilder.js');

function buildFrom(projectLevel) {

	return {
		organisations: [
			{
				id: idBuilder.buildFrom(projectLevel.seriesId, projectLevel.levelId),
				title: projectLevel.title,
				items: itemsBuilder.buildFrom(projectLevel.units, projectLevel.activitySets, projectLevel.activities, projectLevel.sections)
			}
		]
	};
}
