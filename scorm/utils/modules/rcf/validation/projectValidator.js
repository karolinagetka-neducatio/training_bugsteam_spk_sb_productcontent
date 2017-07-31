'use strict';

var rcfValidationRules = require('./rcfValidationRules.js');

module.exports = {
	validate: validate
};

function validate(projectLevel) {

	var errors = [];
	var validators = Object.keys(rcfValidationRules);
	validators.forEach(runValidator);
	return errors;

	function runValidator(validator) {
		var errorResult = rcfValidationRules[validator](projectLevel);
		if (errorResult) {
			if (Array.isArray(errorResult)) {
				if (errorResult.length > 0) {
					errors = errors.concat(errorResult);
				}
			}
			else {
				errors.push(errorResult);
			}
		}
	}
}
