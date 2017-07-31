'use strict';

module.exports = {
	indexByKeyNameAscending : indexObjectPropertiesByKeyNameAscending
};

function indexObjectPropertiesByKeyNameAscending(obj) {

	if (!isObject(obj)) {
		throw new Error('must be an object');
	}
	
	//Note : this is a case sensitive sort by design
	var keys = Object.keys(obj).sort();

	var i = 0;
	keys.forEach(indexProperty);

	function indexProperty(key) {
		if (!isObject(obj[key])) {
			return;
		}
		obj[key].index = i;
		i++;
	}
}

function isObject(obj) {
	return obj === Object(obj);
}