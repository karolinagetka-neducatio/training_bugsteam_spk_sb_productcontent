(function() {
	'use strict';

	module.exports = function(grunt) {

		var fs = require('fs');
		var exportHelper = require('./importExportHelper.js');

		function extractFromActivityXmlFiles( exportFolder, exportFileName, exportTitle ) {
			var pseudoIDsFound = 0;
			var activityTitlesFound = 0;

			grunt.file.recurse(exportFolder, function(abspath, rootdir, subdir, filename) {

				var activityDetails,
					activityTitle;

				if(exportHelper.isValidActivityXmlFileName(filename) &&
					(subdir.toLowerCase().indexOf('referencecontent') < 0)
				) {
					// get activity details as array
					activityDetails = getColumnsFromActivityXmlFile(abspath, exportTitle);

					// check for pseudoID
					if(activityDetails[1].length>0) {
						// make quote and comma safe
						activityDetails[1] = exportHelper.makeQuoteAndCommaSafe( activityDetails[1] );
						pseudoIDsFound++;
					}

					if(exportTitle) {
						activityTitle = (activityDetails[2] || '');

						if(activityTitle.length>0) {
							// make quote and comma safe
							activityDetails[2] = exportHelper.makeQuoteAndCommaSafe( activityTitle );
							activityTitlesFound++;
						}
					}

					fs.appendFileSync(exportFileName, activityDetails.join(',') + '\n');
				}
			});

			grunt.log.writeln('... file ./' + exportFileName + ' created with [' + pseudoIDsFound + '] pseudo ids found' + (	exportTitle ? ' and [' + activityTitlesFound + '] activity titles found' : ''));
		}

		function getColumnsFromActivityXmlFile(activityXmlFileName, exportTitle) {
			/*
				currently only exports:
					- activity id
					- pseudo id
					- activity title (* if specified in the parameter 'exportTitle')
			*/
			var fileContents = '',
				xmlDoc,
				activityNode,
				titleNode,
				activityId = '',
				activityTitle = '',
				pseudoID = '';

			// get file contents
			fileContents = exportHelper.getFileContents(activityXmlFileName);

			// get xml document from file contents
			xmlDoc = exportHelper.getXmlDocument(fileContents);

			// get the activity node
			activityNode = xmlDoc.get('/activity');

			// sanity check !
			if(!activityNode) {
				throw 'Activity xml file has no activity element !';
			}

			// get the activity ID
			activityId = exportHelper.getAttributeValue(activityNode.attr('id'));

			// get the pseudo ID
			pseudoID = exportHelper.getAttributeValue(activityNode.attr('pseudoID'));

			// get title if required
			if(exportTitle) {
				titleNode = xmlDoc.get('/activity/metadata/title');
				if(!!titleNode && titleNode.text().length>0) {
					// strip cr/lf from title if any
					activityTitle = titleNode.text().replace(/[\n\r]/g,'').replace(/\s+/g,' ').trim();
				}
			}

			// return array of details
			if(!exportTitle) {
				return [ activityId, pseudoID ];
			} else {
				return [ activityId, pseudoID, activityTitle ];
			}

		}

		return {
			extractFromActivityXmlFiles: extractFromActivityXmlFiles
		};
	};

})();