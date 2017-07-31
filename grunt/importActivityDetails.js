(function() {

 	'use strict';

 	module.exports = function(grunt) {

		var fs = require('fs');
		var importHelper = require('./importExportHelper.js');

		// builds a mapping dictionary / json object to lookup changes by activity id
		function getMappingObject(csvFileName) {
			var fileContents = fs.readFileSync(csvFileName, 'utf8');
			var activityMapping = {};
			// split on cr / lf or both
			var pseudoArray = fileContents.split(/\r|\r?\n/g);

			for(var row=0; row < pseudoArray.length; row++) {

				var rowDetails = pseudoArray[row];

				if(rowDetails.trim().length<1) {
					continue;
				}

				var items = pseudoArray[row].split(','),
					guid = items[0],
					pseudoID = items[1],
					activityTitle = '';

				if(pseudoID.length>0) {
					// handle quotes inside pseudo ID's - shouldn't be, but ....
					pseudoID = importHelper.stripAnyLeadingAndTrailingQuotes(pseudoID);
				}

				// handle activity titles
				if(items.length>2) {
					// handle any activity titles which might have had a comma inside
					// rebuild the activity title from any spurious columns
					var merge = 2;
					while(merge<items.length) {
						activityTitle += items[merge] + ((merge < items.length-1) ? ',' : '');
						merge++;
					}
					activityTitle = importHelper.stripAnyLeadingAndTrailingQuotes(activityTitle);
				}

				activityMapping[guid] = {
					pseudoID: pseudoID,
					title: activityTitle
				};

			}
			return activityMapping;
		}


		function getMetaDataNode(activityNode) {
			var metaDataNode = activityNode.get('metadata');
			var firstActivityChildNode;

			// create if it doesn't exist
			if(!(!!metaDataNode)) {
				// metadata should always be the first child under the activity, so prepend it
				// to the first child / first sibling
				firstActivityChildNode = activityNode.child(0);
				metaDataNode = firstActivityChildNode.addPrevSibling(activityNode.node('metadata'));
			}
			return metaDataNode;
		}

		function updatePseudoId(activityNode, pseudoId) {
			var existingPseudoId = importHelper.getAttributeValue(activityNode.attr('pseudoID'));

			if(existingPseudoId!==pseudoId) {
				activityNode.attr({
					'pseudoID': pseudoId.replace(/\"\"/g,'"')
				});
			}
		}

		function updateMetadataTitle(activityNode, activityTitle) {
			// check if we need to add <metadata>
			var metaDataNode = getMetaDataNode(activityNode);
			var titleNode = metaDataNode.get('title');

			// check for titleNode - there *should* always be a <title> node according to the
			// schema !
			if(!(!!titleNode)) {
				titleNode = metaDataNode.node('title');
			}
			titleNode.text(activityTitle.replace(/\"\"/g,'"'));
		}

		function updateActivityXmlFile(activityXmlFile, mapping) {
			var fileContents = importHelper.getFileContents(activityXmlFile);
			var xmlDoc = importHelper.getXmlDocument(fileContents);
			var originalXml = xmlDoc.toString();
			var activityNode = xmlDoc.get('/activity');
			var newPseudoId = (mapping ? (mapping.pseudoID || '') : '');

			// if we have a pseudoID from the mapping, then update it
			if(newPseudoId.length>0) {
				updatePseudoId(activityNode, newPseudoId);
			}

			// if we have a title from the mapping then update it
			var newTitle = (mapping ? (mapping.title || '') : '');
			if(newTitle.length>0) {
				updateMetadataTitle(activityNode, newTitle);
			}

			// if the xml has changed at all, then save changes to the file
			// - return true if changed, false if not
			if(xmlDoc.toString()!==originalXml) {
				grunt.file.write(activityXmlFile, xmlDoc.toString());
				return true;
			}
			return false;
		}

		function importActivityDetails(csvFileName, productionFolder) {
			var mappingObject = getMappingObject(csvFileName);
			var filesUpdated = 0;

			grunt.file.recurse(productionFolder, function(abspath, rootdir, subdir, filename) {
				var guid = filename.split('.')[0];

				if(importHelper.isValidActivityXmlFileName(filename) &&
					(subdir.toLowerCase().indexOf('referencecontent') <0)
				) {
					if(!!mappingObject[guid] && (updateActivityXmlFile(abspath, mappingObject[guid]) ) ) {
						filesUpdated++;
					}
				}

			});
			console.log('updated [', filesUpdated, '] activity xml files with changes from the file [', csvFileName, ']');
		}

		return {
			importActivityDetails: importActivityDetails
		};

 	};

})();