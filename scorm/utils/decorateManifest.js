'use strict';

var args = process.argv.slice(2);
var fs = require('fs');
var path = require('path');
var xml = require('./modules/xml.js');
var decorateManifestXmlDocument = require('./modules/decorateManifestXmlDocument.js');

// get scorm output path from command parameters
var scormOutputPath = args[0];

// get full file/path to manifest file
var manifestFileName = path.join(scormOutputPath, 'imsmanifest.xml');

// read the manifest into an xml document
var manifestDocument = xml.loadXmlFile(manifestFileName);

// decorate the document with the gradable values
manifestDocument = decorateManifestXmlDocument(scormOutputPath, manifestDocument);

// write contents back to imsmanifest.xml file
fs.writeFileSync(manifestFileName, manifestDocument.toString());
