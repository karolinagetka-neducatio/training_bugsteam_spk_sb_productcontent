'use strict';

module.exports = {
	createLookupOfChildKeyUniqueValues : createLookupOfChildKeyUniqueValues
};

/* createLookupOfChildKeyUniqueValues
 Build a lookup table:
 e.g. input:
 obj ->
 	child
 		<keyName> : foo
 	child
 		<keyName> : foo
 	child
 		<keyName> : bar

 output:
 	{
 		foo : true,
 		bar : true
 	}
 */
function createLookupOfChildKeyUniqueValues(obj, childKeyName) {
	var result = {};
	Object.keys(obj).forEach(lookupKeyValue);
	return result;

	function lookupKeyValue(keyName) {
		var keyValue = obj[keyName][childKeyName];
		if (keyValue && !result[keyValue]) {
			result[keyValue] = true;
		}
	}
}