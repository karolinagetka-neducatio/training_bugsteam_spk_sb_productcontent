'use strict';

module.exports = {
	getAllInUnit: getAllInUnit
};

function getAllInUnit(sections, unitKey) {

	if (!sections || !unitKey) {
		return {};
	}

	var matchingSections = {};

	Object.keys(sections).forEach(function(sectionKey) {

		var section = sections[sectionKey];

		if (section.unitKey === unitKey) {
			matchingSections[sectionKey] = section;
		}
	});

	return matchingSections;
}

