'use strict';

module.exports = {
    loadXmlFile: loadXmlFile,
    getNonEmptyValue : getNonEmptyValue
};

var fs = require('fs');
var libxmljs = require('libxmljs');

function loadXmlFile(filePath) {

    if (!(!!filePath)) {
        throw new Error('No xml path supplied!');
    }

    var xml = fs.readFileSync(filePath);
    var xmlDom;
    try {
        xmlDom = libxmljs.parseXmlString(xml);
    } catch (e) {
        console.log(xml);
        console.log(filePath);
        throw e;
    }
    return xmlDom;
}

function getNonEmptyValue(xmlDom, xPath) {
    if (xmlDom === null) {
        return null;
    }
    var xPathResult = xmlDom.get(xPath);
    if (typeof xPathResult === 'undefined') {
        return null;
    }
    var value = '';

    //Handle xpath results pointing to an element
    if (xPathResult.text) {
        value = xPathResult.text().trim();
    } else {
        //Handle xpath results pointing to an attribute
        if (xPathResult.value) {
            value = xPathResult.value().trim();
        }
    }

    if (value === '') {
        return null;
    }
    return value;
}
