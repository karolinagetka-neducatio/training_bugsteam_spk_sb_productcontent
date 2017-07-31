'use strict';

module.exports = function(grunt) {

	var path = require('path');
	var fs = require('fs');
	var uuid = require('./uuid.js')(grunt);

	function createNewsItemSection(newRcfSectionPath, mecID) {
		if(folderExists(newRcfSectionPath)) {
			grunt.fail.fatal('A news item / section already exists at location [' + newRcfSectionPath + ']');
			return;
		}

		grunt.log.writeln('creating path [' + newRcfSectionPath + ']');

		// synchronous, yeah, but so ? this is a command line util ! :)
		fs.mkdirSync(newRcfSectionPath);
		createNewsItemSectionMetadata(mecID, newRcfSectionPath);

		var startingDifficulty = 101;
		// create the three activity sets
		[
			'ActivitySet_01',
			'ActivitySet_02',
			'ActivitySet_03'
		].forEach(function(activitySetName) {

			var activitySetPath = path.join(newRcfSectionPath, activitySetName);
			var activitySetMecID = mecID + '-' + startingDifficulty;

			grunt.log.writeln('creating activity set [' + activitySetPath + ']');

			fs.mkdirSync(activitySetPath);
			createNewsItemActivitySetMetadata(activitySetMecID, activitySetPath);
			createIntroNewsItem(activitySetPath, activitySetMecID, startingDifficulty);
			createNewsItemActivities(activitySetPath, activitySetMecID, startingDifficulty);
			startingDifficulty++;

		});
	}

	function createIntroNewsItem(activitySetPath, mecID, difficulty) {
		//
		var introPageFolderName = path.join(activitySetPath, 'Activity_00');

		// create intro page folders for this difficulty
		grunt.log.writeln('creating intro page [' + introPageFolderName + ']');
		fs.mkdirSync(introPageFolderName);

		// create an activity ID / uuid
		var introActivityId = uuid.create().toString();

		// get the template activity xml for the intro page
		var introActivityXml = getNewsItemIntroActivityXml(introActivityId, mecID, difficulty );

		// write the intro activity xml
		var fileName = path.join(introPageFolderName, (introActivityId + '.xml'));
		grunt.log.writeln('writing file ' + fileName);
		fs.writeFileSync( fileName,  introActivityXml);

		// write the two empty css files
		createEmptyCssFiles(path.join(introPageFolderName, introActivityId));
	}

	function createNewsItemActivities(activitySetPath, mecID, difficulty) {

		for(var i=1; i < 3; i++) {
			var activityFolder = path.join(activitySetPath, 'Activity_0' + (i)),
				activityId = uuid.create().toString(),
				baseFileName = path.join(activityFolder, activityId);

			// create activity_NN folder
			fs.mkdirSync(activityFolder);
			var activityMecID = mecID + '_' + i;
			// get activity xml
			var activityXml = getNewsItemActivityXml(activityId, activityMecID, difficulty);

			// create activity xml file
			fs.writeFileSync(baseFileName + '.xml', activityXml);

			// create empty css files
			createEmptyCssFiles(baseFileName);
		}
	}

	function createNewsItemSectionMetadata(mecID, sectionPath) {
		var metadataXml = getNewsItemSectionMetadata(mecID);
		fs.writeFileSync( path.join(sectionPath, 'metadata.xml'), metadataXml);
	}

	function createNewsItemActivitySetMetadata(activitySetMecID, activitySetPath) {
		var metadataXml = getNewsItemActivitySetMetadata(activitySetMecID);
		fs.writeFileSync( path.join(activitySetPath, 'metadata.xml'), metadataXml);
	}

	function getNewsItemSectionMetadata(mecID) {
		return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + 
'<metadata>\n' +
'  <title/>\n' +
'  <type>NewsItem</type>\n' +
'  <isNewsItem>y</isNewsItem>\n' +
'  <id>' + mecID + '</id>\n' +
'</metadata>';
	}

	function getNewsItemActivitySetMetadata(mecID) {
return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
'<metadata>\n' +
'  <id>' + mecID + '</id>\n' +
'  <title/>\n' +
'  <subtitle/>\n' +
'  <description/>\n' +
'  <activityTypes>\n' +
'    <activityType>News Item</activityType>\n' +
'  </activityTypes>\n' +
'  <topics/>\n' +
'  <groups/>\n' +
'  <levels/>\n' +
'  <exam/>\n' +
'  <ages/>\n' +
'  <dialect/>\n' +
'  <contentSets/>\n' +
'  <grammarReferences/>\n' +
'</metadata>';
	}

	function getNewsItemIntroActivityXml(activityId, mecID, difficulty) {
		var date = new Date(),

			difficultyClass = {
				101: 'Easy',
				102: 'Average',
				103: 'Difficult'
			}[difficulty],

			currentDate = (date.getDate() + '/' + Number(date.getMonth()+1) + '/' + date.getFullYear());

		return '<?xml version="1.0" encoding="UTF-8"?>\n' +
'<activity id="' + activityId + '" pseudoID="' + mecID + '_0" class="mm_newsItemIntro mm_difficulty' + difficultyClass + '">\n' +
'  <main>\n' +
'    <block class="mm_newsItemHeader">\n' +
'      <block class="mm_imageContainer">\n' +
'        <image src=""/>\n' +
'      </block>\n' +
'      <block class="mm_newsItemHeadline">\n' +
'        <h2 class="mm_newsItemTitle"></h2>\n' +
'        <p class="mm_newsItemDate">'+ currentDate + '</p>\n' +
'      </block>\n' +
'    </block>\n' +
'    <block class="mm_rootBlock">\n' +
'      <block class="mm_newsItemContent">\n' +
'        <p></p>\n' +
'      </block>\n' +
'    </block>\n' +
' </main>\n' +
'</activity>';
	}

	function getNewsItemActivityXml(activityId, mecID, difficulty) {
		var difficultyClass = {
			101: 'Easy',
			102: 'Average',
			103: 'Difficulty'
		}[difficulty];

		return '<?xml version="1.0" encoding="UTF-8"?>\n' +
'<activity id="' + activityId + '" pseudoID="' + mecID + '" class="mm_newsItemActivity mm_difficulty' + difficultyClass + '">\n' +
'  <activityHead>\n' +
'    <activityTitle/>\n' +
'    <activitySubtitle/>\n' +
'    <activityDescription/>\n' +
'  </activityHead>\n' +
'  <rubric lang="EN">\n' +
'    <p></p>\n' +
'  </rubric>\n' +
'  <main>\n' +
'    <multiPanel>\n' +
'      <hints>\n' +
'        <hintBlock lang="EN">\n' +
'          <p></p>\n' +
'        </hintBlock>\n' +
'      </hints>\n' +
'      <!--3. reading blocks-->\n' +
'      <slidingBlock slideFrom="right">\n' +
'        <slidingButton caption="Read"/>\n' +
'        <slidingPanelTitle>Read</slidingPanelTitle>\n' +
'        <block>\n' +
'        </block>\n' +
'      </slidingBlock>\n' +
'    </multiPanel>\n' +
'    <!--4. image blocks-->\n' +
'    <block class="mm_imageContainer">\n' +
'      <image src=".jpg"/>\n' +
'    </block>\n' +
'    <!--6. root block-->\n' +
'    <block class="mm_rootBlock">\n' +
'        <block class="mm_newsItemActivityContent">\n' +
'        </block>\n' +
'    </block>\n' +
'  </main>\n' +
'</activity>';

	}

	function createEmptyCssFiles(outputPathAndFileName) {
		fs.writeFileSync(outputPathAndFileName + '.css', '');
		fs.writeFileSync(outputPathAndFileName + '_768.css', '');
	}

	function folderExists(folderPath) {
		try {
			return fs.statSync(folderPath).isDirectory();
		} catch(err) {
			return false;
		}
	}

	return {
		createNewsItemSection: createNewsItemSection
	};

};
