'use strict';
var args = process.argv.slice(2);
var projectRootFolderPath= args[0];
var path = require('path');
var schemaFolderPath =  path.resolve(__dirname, 'libxmljs-compliant-schema');

var validateScormManifest = require('./modules/validateScormManifest.js');
validateScormManifest(projectRootFolderPath, schemaFolderPath).then(resolve, reject);

function resolve() {
	process.exit(0);
}


function reject() {
	process.exit(1);
}
