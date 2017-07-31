'use strict';

module.exports = {
	buildFrom: buildFrom
};

function buildFrom(seriesId, levelId) {

	return seriesId + '_' + levelId;
}
