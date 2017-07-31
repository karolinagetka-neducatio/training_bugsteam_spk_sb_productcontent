(function() {
  
  'use strict';

  angular.module('playerApp', [])
  	.config(function($locationProvider) {
  		$locationProvider.html5Mode({ enabled: false });
	});
}());