'use strict';

var fs = require('fs');
var path = require('path');

module.exports = {
    getActivityGradableTypeValueFromHtmlFile: getActivityGradableTypeValueFromHtmlFile,
    getActivityHtmlContent: getActivityHtmlContent,
    validateSingleContentType: validateSingleContentType
};

var regExpGradable = new RegExp(/(?:.*)data-gradableType=\"(.*?)\"/);
var regExpTeacherMarks = new RegExp(/(?:.*)data-teacherPointsAvailable=\"(.*?)\"/);
var regExpComputerMarks = new RegExp(/(?:.*)data-pointsAvailable=\"(.*?)\"/);

function getActivityHtmlContent(scormOutputPath, activityId){
    // build activity HTML file / pathname
    var activityHtmlFileName = path.join(scormOutputPath, 'cdn', 'html', activityId + '.html');
    // read activity html contents
    return fs.readFileSync(activityHtmlFileName, 'utf8');
}

function getActivityGradableTypeValueFromHtmlFile(activityHtmlContents) {

    var matches = regExpGradable.exec(activityHtmlContents);

    if(matches) {
        return matches[1];
    } else {
        throw new Error('Activity must contain a gradable type.');
    }
}

function validateSingleContentType(activityId, activityHtmlContent){
    // get reg exp matches
    var matches =  regExpComputerMarks.exec(activityHtmlContent);
    var computerMarks = 0;
    if(matches){
        computerMarks = Number(matches[1]);
    }

    matches = regExpTeacherMarks.exec(activityHtmlContent);
    var teacherMarks = 0;

    if(matches){
        teacherMarks = Number(matches[1]);
    }

    if(teacherMarks > 0 && computerMarks > 0){
        throw new Error('Activity: ' + activityId + ' contains mixed content which is currently unsupported by Blink');
    }
}
