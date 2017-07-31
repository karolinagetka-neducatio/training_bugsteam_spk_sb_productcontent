(function () {

	'use strict';

	var module = angular.module('playerApp');

	module.service('rcfService', ['$window', '$log',
		function ($window, $log) {
			$window.RCF.Application.initialize({
				swfFallbackURL: $window.swfFallbackURL + '/',
				minWidth768: $window.minWidth768
			});

			var showMarkedAnswers = function (correctAnswers) {
                $window.RCF.Application.showMarkedAnswers(correctAnswers);
			};

            var showUserAnswers = function () {
                $window.RCF.Application.showUserAnswers();
            };

			var hideMarkedAnswers = function () {
                $window.RCF.Application.hideMarkedAnswers();
			};

			var getMarkedAnswers = function (correctAnswers, userAnswers) {
				return $window.RCF.MarkingEngine.getMarkedAnswers(correctAnswers, userAnswers);
			};

			var showCorrectAnswers = function (correctAnswers) {
                $window.RCF.Application.setAnswers(correctAnswers);
			};

			var showNextAnswer = function (correctAnswers) {
				return $window.RCF.Application.showNextAnswer(correctAnswers); // returns true/false
			};

			var resetAnswers = function () {
                $window.RCF.Application.resetAnswers();
			};

			var getUserAnswers = function () {
				return $window.RCF.Application.getUserAnswers();
			};

			var tryAgain = function (markedAnswers) {
                $window.RCF.Application.tryAgain(markedAnswers);
			};

			var updateContent = function (activity) {
				return $window.RCF.Utils.loadDependencies(activity)
					.then(function() {
						$window.RCF.Application.updateContent(activity);
					}, function(error) {
						console.log('error loading Phaser JS library', error);
						$window.alert('Error loading Phaser JS library', error);
					});
			};

			var getGradableType = function () {
				if (!$window.RCF.Application.getGradableType) {
					$log.warn('Warning: Could not determine gradable type of activity. SCORM Player requires at least RCF version 2.0.82. Current RCF version: ' + $window.RCF.Version.version);
					return;
				}

				return $window.RCF.Application.getGradableType();
			};

			var isAnswerKeyActivity = function () {
				if (!$window.RCF.Application.isAnswerKeyActivity) {
					$log.warn('Warning: Could not determine if activity is answer key. SCORM Player requires at least RCF version 2.0.83. Current RCF version: ' + $window.RCF.Version.version);
					return;
				}

				return $window.RCF.Application.isAnswerKeyActivity();
			};

            var getPointsAvailable = function () {

				if (!$window.RCF.Application.getPointsAvailable || !$window.RCF.Application.getTeacherPointsAvailable) {
					$log.warn('Warning: Could not determine points available. SCORM Player requires at least RCF version 2.1.10. Current RCF version: ' + $window.RCF.Version.version);
					return;
				}

                return parseInt($window.RCF.Application.getPointsAvailable()) + parseInt($window.RCF.Application.getTeacherPointsAvailable());
            };

            var disableActivity = function () {
                $window.RCF.Application.disableActivity();
            };

            var enableActivity = function() {
                $window.RCF.Application.enableActivity();
            };

            var getAttemptedAnswerCount = function(userAnswers) {

				if (!$window.RCF.MarkingEngine.getAttemptedAnswerCount) {
					$log.warn('Warning: Could not getAttemptedAnswerCount. SCORM Player requires at least RCF version 2.1.10. Current RCF version: ' + $window.RCF.Version.version);
					return;
				}

            	return $window.RCF.MarkingEngine.getAttemptedAnswerCount(userAnswers);
			};

			return {
				// api
				showMarkedAnswers: showMarkedAnswers,
				hideMarkedAnswers: hideMarkedAnswers,
                showUserAnswers: showUserAnswers,
				getMarkedAnswers: getMarkedAnswers,
				showCorrectAnswers: showCorrectAnswers,
				showNextAnswer: showNextAnswer,
				resetAnswers: resetAnswers,
				getUserAnswers: getUserAnswers,
				tryAgain: tryAgain,
				updateContent: updateContent,
				getGradableType: getGradableType,
				isAnswerKeyActivity: isAnswerKeyActivity,
                getPointsAvailable: getPointsAvailable,
                disableActivity: disableActivity,
                enableActivity: enableActivity,
				getAttemptedAnswerCount : getAttemptedAnswerCount
			};
		}]);
})();
