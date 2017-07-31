'use strict';

module.exports = {
	folderIsSection : folderIsSection
};

function folderIsSection(folderName) {
	return folderName.toLowerCase().length >= 6 && (folderName.toLowerCase().slice(0, 7) === 'section');
}
