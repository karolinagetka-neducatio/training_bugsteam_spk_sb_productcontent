'use strict';

module.exports = {
	getOrderedKeys: getOrderedKeys
};

function getOrderedKeys(object) {

	return Object.keys(object).sort(function(key1, key2) {
		if (!object[key1].hasOwnProperty('index') || !object[key2].hasOwnProperty('index')) {
			throw new Error('object missing index key');
		}

		return object[key1].index - object[key2].index;
	});
}
