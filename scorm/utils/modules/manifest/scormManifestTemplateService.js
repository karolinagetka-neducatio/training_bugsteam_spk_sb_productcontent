'use strict';

module.exports = {
	getHandlebarsTemplate: getHandlebarsTemplate
};

var handlebars = require('handlebars');
var path = require('path');
var fileSystem = require('fs');

function getHandlebarsTemplate() {

	var itemsTemplatePath = path.resolve(__dirname, './templates/items.handlebars');
	var items = fileSystem.readFileSync(itemsTemplatePath).toString();

	var nonActivityItemTemplatePath = path.resolve(__dirname, './templates/nonActivityItem.handlebars');
	var nonActivityItem = fileSystem.readFileSync(nonActivityItemTemplatePath).toString();

	var activityItemTemplatePath = path.resolve(__dirname, './templates/activityItem.handlebars');
	var activityItem = fileSystem.readFileSync(activityItemTemplatePath).toString();

	handlebars.registerPartial({
		'items': items,
		'nonActivityItem': nonActivityItem,
		'activityItem': activityItem
	});

	var scormManifestTemplatePath = path.resolve(__dirname, './templates/scormManifest.handlebars');
	var source = fileSystem.readFileSync(scormManifestTemplatePath).toString();

	return handlebars.compile(source);
}
