'use strict';

var xml = require('./xml.js');

module.exports = {
	mapNonEmptyXmlValue : mapNonEmptyXmlValue,
	mapYesNoXmlValue : mapYesNoXmlValue
};

function mapNonEmptyXmlValue(obj, key, xmlDom, xPath) {
	var value = xml.getNonEmptyValue(xmlDom, xPath);
	if (value === null) {
		return;
	}
	obj[key] = value;
}

/**
 * Map a value where the xml xpath value could be Y/y, N/n or not present
 * to a javascript boolean primitive
 * @param obj
 * @param key
 * @param xmlDom
 * @param xPath
 */
function mapYesNoXmlValue(obj, key, xmlDom, xPath) {
	var value = xml.getNonEmptyValue(xmlDom, xPath);
	var booleanValue = false;
	if (value !== null && (value.toLowerCase() === 'y')) {
		booleanValue = true;
	}
	obj[key] = booleanValue;
}
