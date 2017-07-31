(function () {
	'use strict';

	var module = angular.module('playerApp');

	module.service('attemptService', ['$window', 'rcfService', 'dialogService', attemptService]);

	function attemptService($window, rcfService, dialogService) {

		return {
			verifyActivityAttempted : verifyActivityAttempted

		};

		//Note that 'markedAnswers' is a superset of userAnswers, valid to call this with markedAnswers too
		function verifyActivityAttempted(userAnswers, submitCallback, cancelCallback) {

			//Always valid if nothing to answer
			if (userAnswers.answers.length === 0) { return true; }

			var attemptedAnswerCount = rcfService.getAttemptedAnswerCount(userAnswers);

			//Continue with submit automatically if value has been supplied for every answer interaction
			if (attemptedAnswerCount === userAnswers.answers.length) {
				submitCallback();
				return;
			}

			//If user has not filled in anything
			if (attemptedAnswerCount === 0) {
				//Do not allow submitting a completely blank activity,
				//Only show OK button
				dialogService.showOkDialog({
					title : 'Your answer is not complete',
					callback : cancelCallback
				});
				return;

			} else {
				//Give the user the choice to submit partially complete activity
				dialogService.showConfirmDialog({
					title : 'Your answer is not complete',
					text: 'Submit it now?',
					confirmButtonText: 'Submit',
					cancelButtonText: 'Cancel',
					confirmCallback : nextTick.bind(null, submitCallback),
					cancelCallback : nextTick.bind(null, cancelCallback)
				});
				return;
			}
		}

		//Wait one before invoking callback, so the current dialog closing does not interfere
		//with any subsequent dialog that the callback might request
		function nextTick(callback) {
			$window.setTimeout(callback, 500);
		}
	}
	
})();
