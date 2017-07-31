(function () {

	'use strict';
	var module = angular.module('playerApp');

	module.service('locationService', ['$window',
		function ($window) {
			var search = function () {

                //From http://stackoverflow.com/a/2880929
                var match,
                    pl     = /\+/g,  // Regex for replacing addition symbol with a space
                    search = /([^&=]+)=?([^&]*)/g,
                    decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); },
                    query  = $window.location.search.substring(1),
					queryParent = $window.parent.location.search.substring(1);

                var urlParams = {};

                match = search.exec(queryParent);
				while (match) {
					urlParams[decode(match[1])] = decode(match[2]);
					match = search.exec(queryParent);
				}

				match = search.exec(query);
				while (match) {
					urlParams[decode(match[1])] = decode(match[2]);
					match = search.exec(query);
				}
                return urlParams;
			};

			return {
				search: search
			};
		}]);
})();
