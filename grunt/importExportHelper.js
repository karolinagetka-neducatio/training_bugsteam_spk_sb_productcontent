(function() {

	'use strict';

	var fs = require('fs');
	var libxmljs = require('libxmljs');

	// string utils
	function endsWith(value, str) {
		return (value.slice(-str.length)===str);
	}

	function startsWith(value, str) {
		return (value.lastIndexOf(str, 0) === 0);
	}

	function makeQuoteAndCommaSafe(value) {
		if(value.indexOf('"')>-1 || value.indexOf(',')>-1) {
			value = '"' + value.replace(/\"/g, '""') + '"';
		}
		return value;
	}

	// is valid activity xml file name
	function isValidActivityXmlFileName(filename) {
		var guid = filename.split('.')[0],
			ext = filename.split('.')[1];

		return (
			!!ext &&
			ext.toLowerCase()==='xml' &&
			guid.length===32);
	}

	// get file contents as a string
	function getFileContents(activityXmlFile) {
		try {
			return fs.readFileSync(activityXmlFile);
		} catch(ex) {
			console.log('Error reading activity xml file [', activityXmlFile, ']\n', ex);
			throw 'Error reading Activity XML File';
		}
	}

	// parse the xml or throw an exception! return a dom
	function getXmlDocument(xmlString) {
		try {
			return libxmljs.parseXmlString(xmlString, {noblanks: false});
		} catch(ex) {
			console.log('Invalid Xml !', ex);
			throw 'Invalid Xml ' + ex;
		}
	}

	// helper function to get attribute value
	function getAttributeValue(attr) {
		return (!!attr ? attr.value() : '');
	}

	function stripAnyLeadingAndTrailingQuotes(value) {
		if(startsWith(value, '"') && endsWith(value, '"')) {
			value = value.slice(1, value.length-1);
		}
		return value;
	}

	module.exports = {
		endsWith: endsWith,
		startsWith: startsWith,
		isValidActivityXmlFileName: isValidActivityXmlFileName,
		getFileContents: getFileContents,
		getXmlDocument: getXmlDocument,
		getAttributeValue: getAttributeValue,
		makeQuoteAndCommaSafe: makeQuoteAndCommaSafe,
		stripAnyLeadingAndTrailingQuotes: stripAnyLeadingAndTrailingQuotes
	};

})();
