(function () {
    'use strict';

    var module = angular.module('playerApp');

    module.service('dialogService', ['$window', dialogService]);


    function dialogService($window) {
        // to be expanded with other dialog types for open-gradable marking etc !
        return {
            showScoresDialog: showScoresDialog,
            showOkDialog: showOkDialog,
            showConfirmDialog: showConfirmDialog,
            showSaveDraftDialog: showSaveDraftDialog,
            showAttemptErrorDialog: showAttemptErrorDialog,
            showAnswerSubmittedDialog: showAnswerSubmittedDialog
        };

        function showOkDialog(options) {
            $window.swal({
                title: options.title || '',
                text: options.text || '',
                html: true,
                type: options.type || 'info'
            }, function () {
                if (typeof (options.callback) === 'function') {
                    options.callback();
                }
            });
        }

        function showConfirmDialog(options) {
            $window.swal({
                title: options.title || '',
                text: options.text || '',
                html: options.html || true,
                showCancelButton: options.showCancelButton || true,
                confirmButtonText: options.confirmButtonText || 'Check answers',
                cancelButtonText: options.cancelButtonText || 'Cancel',
                closeOnConfirm: true,
                closeOnCancel: true,
                imageUrl: 'images/sa-icon.png'
            }, function (isConfirm) {
                if (isConfirm) {
                    options.confirmCallback();
                }
                else {
                    options.cancelCallback();
                }
            });
        }

        function showScoresDialog(scores, options) {

            var modalOptions = {
                title: 'Your score is ' + scores.score + ' out of ' + scores.totalScore,
                text: '<span class="percentage-score">' + scores.percentageScore + '</span>',
                cancelButtonText: options.cancelButtonText,
                cancelCallback: options.cancelCallback,
                confirmCallback: options.confirmCallback
            };

            return showConfirmDialog(modalOptions);
        }

        function showAttemptErrorDialog(callback) {

            var options = {
                title: 'Attempt error',
                text: 'Sorry, that student activity attempt is not available',
                type: 'warning',
                callback: callback
            };

            return showOkDialog(options);
        }

        function showSaveDraftDialog(success, ANSWERS_OR_DRAFT) {

            var options = {
                saveDraftSuccess: {
                    title: 'Success',
                    text: ANSWERS_OR_DRAFT + ' saved.',
                    type: 'success'
                },
                saveDraftError: {
                    title: 'Error',
                    text: 'Something went wrong, please try to save your ' + ANSWERS_OR_DRAFT.toLowerCase() + ' again.',
                    type: 'error'
                }
            };

            return success ? showOkDialog(options.saveDraftSuccess) : showOkDialog(options.saveDraftError);
        }

		function showAnswerSubmittedDialog(success, callback) {

            var options;

            if (!success) {

                options = {
                    title: 'Activity not submitted',
                    text: 'Something went wrong, please try to resubmit your activity.',
					type: 'warning',
					callback: callback
                };

                return showOkDialog(options);
            }

            options = {
                title: 'Your answer has been submitted',
                text: 'Your teacher can view your answer. You will then be notified when your answer has been marked.',
				type: 'success',
				callback: callback
            };

            return showOkDialog(options);
        }

    }


})();
