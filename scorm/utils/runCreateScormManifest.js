'use strict';

var args = process.argv.slice(2);
var productionFolderPath = args[0];
var scormOutputCdnPath = args[1];
var scormOutputManifestFilePath = args[2];

var createScormManifest = require('./modules/manifest/createScormManifest.js');
var scormOutputFileSystem = require('./modules/rcf/scormOutputFileSystem.js');
var fileSystem = require('./modules/rcf/fileSystem.js');

var levelFolderName = scormOutputFileSystem.getFirstPublishedLevelFolderName(scormOutputCdnPath);
var projectLevelFolderPath = fileSystem.getProjectLevelFolderByName(productionFolderPath, levelFolderName);

createScormManifest(projectLevelFolderPath, scormOutputManifestFilePath);
