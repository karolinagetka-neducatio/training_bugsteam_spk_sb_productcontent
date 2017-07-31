'use strict';

var htmlUtils = require('./htmlUtils.js');

module.exports = decorateManifestDocument;

function decorateManifestDocument(scormOutputPath, manifestDocument) {

    // get all <item> elements with '@parameters' attribute (these are the activity items)
    var activityElements = manifestDocument.find('//xmlns:item[@parameters]', 'http://www.imsproject.org/xsd/imscp_rootv1p1p2');
    //
    var activityId;

    // loop through each activity element
    activityElements.forEach(function(activity) {
        // we know the 'parameters' attribute is here as we asked for it in the xpath above
        activityId = activity.attr('parameters')
            .value() 	// get the value
            .split('=') // split it at the '='
            .pop();		// get the value of the parameter

        // create new attribute 'gradableType' on the <item> element from the activity html file
        var htmlContent = htmlUtils.getActivityHtmlContent(scormOutputPath, activityId);
        htmlUtils.validateSingleContentType(activityId, htmlContent);
        activity.attr({
            //'gradableType': getActivityGradableType(activityId)

            'mm:gradableType': htmlUtils.getActivityGradableTypeValueFromHtmlFile(htmlContent)
        });
    });

    // return the changed document xml
    return manifestDocument;
    //
}
