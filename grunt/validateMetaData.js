'use strict';


module.exports = function(grunt) {

	var path = require('path');
	var libxmljs = require('libxmljs');

	// register the grunt tasks
	grunt.registerTask('validateActivitySetIds', '', validateActivitySetIds);
	grunt.registerTask('validateGrammarReferenceItems', '', validateGrammarReferenceItems);

	function validateActivitySetIds() {
		var activitySetMetaDataFiles = grunt.file.expand('./production/**/ActivitySet_*/metadata.xml');
		var activitySetIds = {};
		var isEverythingOk = true;

		grunt.log.writeln('checking for duplicate ids in ' + activitySetMetaDataFiles.length + ' ActivitySet_nn/metadata.xml files');
		activitySetMetaDataFiles.forEach(function(activitySetMetaDataFileName) {
			var xmlDoc = getXmlDomFromFile(activitySetMetaDataFileName);
			var activitySetIdElement = xmlDoc.get('/metadata/id');
			if(!activitySetIdElement) {
				grunt.log.error('activity set metadata file has NO id element : [' + activitySetMetaDataFileName + ']');
				return;
			}

			var activitySetId = activitySetIdElement.text();

			if(!!activitySetIds[activitySetId]) {
				isEverythingOk = false;
				grunt.log.error('duplicate activity set id [' + activitySetId + '] in \n' + activitySetIds[activitySetId] + '\n... and ...\n' + activitySetMetaDataFileName + '\n');
				return;
			}
			activitySetIds[activitySetId] = activitySetMetaDataFileName;
		});

		if(!isEverythingOk) {
			grunt.fail.fatal('Some ActivitySet_**/metadata.xml files have duplicate <id> element values');
		}
	}

	function validateGrammarReferenceItems() {
		// get list of files via glob pattern
		var grammarReferenceXmlFiles = grunt.file.expand('./production/**/referenceContent/*.xml');
		var activitySetMetaDataFiles = grunt.file.expand('./production/**/ActivitySet_*/metadata.xml');
		var activityXmlFiles = grunt.file.expand('./production/**/Activity_*/*.xml');
		// everything ok ?
		var isEverythingOk = true;

		// lookup objects
		var grammarReferenceFiles = {};
		var activitySetFilesById = {};
		var activityXmlFilesByActivityId = {};

		// cache grammar reference items
		grunt.log.writeln('caching ' + grammarReferenceXmlFiles.length + ' real referenceContent items');
		grammarReferenceFiles = getGrammarReferenceFileList(grammarReferenceXmlFiles);

		// cache activity IDs and pseudo IDs
		grunt.log.writeln('caching ' + activityXmlFiles.length + ' activity IDs and PseudoIDs');
		activityXmlFilesByActivityId = getActivityXmlFilesByActivityId(activityXmlFiles);

		// loop through activitySet metadata xml files to grab all activityset ids
		grunt.log.writeln('looking for activitySet ids in ' + activitySetMetaDataFiles.length + ' activitySet metadata.xml files');
		activitySetFilesById = getActivitySetFilesById(activitySetMetaDataFiles);

		// loop through activity set metadata files again and make sure the grammarReference items referenced actually exist
		grunt.log.writeln('checking ' + activitySetMetaDataFiles.length + ' ActivitySet_nn / metadata.xml files for incorrect / missing ids');
		activitySetMetaDataFiles.forEach(function(activitySetMetaDataFileName) {
			var grammarReferenceIds = getGrammarReferenceIdsFromActivitySetMetadata(activitySetMetaDataFileName);
			if(grammarReferenceIds.length > 0 ) {
				// check existence of ids
				grammarReferenceIds.forEach(function(grammarReferenceId) {
					// first check referenceContent items
					if(!!grammarReferenceFiles[grammarReferenceId]) {
						return;
					}
					// check activities with id
					if(!!activityXmlFilesByActivityId[grammarReferenceId]) {
						return;
					}
					// check activities with pseudo id
					if(!!activitySetFilesById[grammarReferenceId]) {
						return;
					}
					// can't find it anywhere
					isEverythingOk = false;
					grunt.log.error('activity set metadata [' + activitySetMetaDataFileName,'] refers to grammar reference item [' + grammarReferenceId + '] which could not be found');
				});
			}
		});
		if(!isEverythingOk) {
			grunt.fail.fatal('Errors in grammarReference references in ActivitySet_**/metadata.xml files');
		}
	}

	/* ------- helper functions ----------------- */
	function getGrammarReferenceFileList(grammarReferenceXmlFiles) {

		var grammarReferenceFiles = {};

		grammarReferenceXmlFiles.forEach(function(referenceContentFileName) {
			var grammarReferenceMetadata = getGrammarReferenceMetadata(referenceContentFileName);
			if(!grammarReferenceMetadata.validFile) {
				grunt.log.error('Grammar Reference File [' + referenceContentFileName + '] - id does not match referenceContentFileName!');
				return;
			}
			grammarReferenceFiles[grammarReferenceMetadata.id] = referenceContentFileName;
		});

		return grammarReferenceFiles;
	}

	function getActivityXmlFilesByActivityId(activityXmlFiles) {
		var activityXmlFilesByActivityId = {};

		activityXmlFiles.forEach(function(activityFileName) {
			var activityMetaData = getActivityMetaData(activityFileName);
			var activityId = activityMetaData.id;

			if(activityId.length>0) {
				if(!!activityXmlFilesByActivityId[activityId]) {
					grunt.log.error('Duplicate Activity ID [' + activityId,'] used in \n' + activityXmlFilesByActivityId[activityId] + '\n... and ...\n' + activityFileName + '\n');
				}
				activityXmlFilesByActivityId[activityId] = activityFileName;
			}
		});

		return activityXmlFilesByActivityId;
	}

	function getActivitySetFilesById(activitySetMetaDataFiles) {
		var activitySetFilesById = {};

		activitySetMetaDataFiles.forEach(function(activitySetMetaDataFileName) {
			var xmlDoc = getXmlDomFromFile(activitySetMetaDataFileName);
			var activitySetIdElement = xmlDoc.get('/metadata/id');

			if(!activitySetIdElement) {
				grunt.log.error('activity set metadata file has NO id element : [' + activitySetMetaDataFileName + ']');
				return;
			}

			var activitySetId = activitySetIdElement.text();

			if(!!activitySetFilesById[activitySetId]) {
				grunt.log.error('duplicate activity set id [' + activitySetId + '] in \n' + activitySetFilesById[activitySetId] + '\n... and ...\n' + activitySetMetaDataFileName + '\n');
				return;
			}
			activitySetFilesById[activitySetId] = activitySetMetaDataFileName;
		});

		return activitySetFilesById;
	}

	function getGrammarReferenceMetadata(grammarReferenceFileName) {
		var xmlDoc = getXmlDomFromFile(grammarReferenceFileName);
		var fileNameGuid = grammarReferenceFileName.split( path.sep ).pop().replace('.xml', '');
		var internalGuid = getAttributeValue(xmlDoc.root().attr('id'));
		return {
			id: internalGuid,
			validFile: (internalGuid===fileNameGuid)
		};
	}

	function getActivityMetaData(activityXmlFileName) {
		var xmlDoc = getXmlDomFromFile(activityXmlFileName);
		var internalGuid = getAttributeValue(xmlDoc.root().attr('id'));
		var internalPseuodId = getAttributeValue(xmlDoc.root().attr('pseudoID'));

		return {
			id: internalGuid,
			pseudoId: internalPseuodId
		};
	}

	function getGrammarReferenceIdsFromActivitySetMetadata(activitySetMetaDataFileName) {
		var xmlDoc = getXmlDomFromFile(activitySetMetaDataFileName);
		var grammarReferenceItems = xmlDoc.find('//grammarReferences/grammarReference');
		var grammarReferenceIds = [];

		if(!!grammarReferenceItems) {
			grammarReferenceItems.forEach(function(grammarReferenceElement) {
				grammarReferenceIds.push(grammarReferenceElement.text());
			});
		}

		return grammarReferenceIds;
	}

	function getAttributeValue(attr) {
		return (!!attr ? attr.value() : '');
	}

	function getXmlDomFromFile(fileName) {
		var xml = grunt.file.read(fileName);
		return libxmljs.parseXmlString(xml);
	}

};