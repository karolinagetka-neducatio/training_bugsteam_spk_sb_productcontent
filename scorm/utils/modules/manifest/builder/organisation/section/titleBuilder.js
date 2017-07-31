'use strict';

module.exports = {
	buildFrom: buildFrom
};

function buildFrom(title, subtitle) {

	var newTitle = title;

	if (subtitle) {
		newTitle += ': ' + subtitle;
	}

	return newTitle;
}
