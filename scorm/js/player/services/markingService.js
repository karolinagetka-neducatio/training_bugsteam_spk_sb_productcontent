(function () {
    'use strict';

    var module = angular.module('playerApp');

    module.service('markingService', ['rcfService', 'scormService', 'dialogService', 'BLINK_ROLES', 'GRADABLE_TYPES', 'attemptService', markingService]);

    function markingService(rcfService, scormService, dialogService, BLINK_ROLES, GRADABLE_TYPES, attemptService) {

        return {
            markAnswers: markAnswers,
            clearMarkedAnswers: clearMarkedAnswers,
            markForTeacher: markForTeacher,
            markForStudent: markForStudent,
            getMarkedAnswers : getMarkedAnswers
        };

        function markAnswers(scormInitialised, role, correctAnswersJson, hasAttempt, gradableType, callbacks) {

            rcfService.disableActivity();

            var markedAnswers = getAnswers(correctAnswersJson, gradableType);
            var scores = getScores(markedAnswers);

            if (role === BLINK_ROLES.TEACHER) {
                markForTeacher(scores, callbacks);
            }
            else if (role === BLINK_ROLES.STUDENT) {
                markForStudent(scormInitialised, markedAnswers, scores, hasAttempt, gradableType, callbacks);
            }
        }

        function clearMarkedAnswers() {
            rcfService.hideMarkedAnswers();
            rcfService.enableActivity();
        }

        function markForTeacher(scores, callbacks) {

            var modalOptions = {
                cancelButtonText: 'Reset',
                cancelCallback: callbacks.cancel,
                confirmCallback: callbacks.confirm
            };

            dialogService.showScoresDialog(scores, modalOptions);

        }

        function markForStudent(scormInitialised, markedAnswers, scores, hasAttempt, gradableType, callbacks) {

            var modalOptions = {
                cancelButtonText: 'Try again',
                cancelCallback: callbacks.tryAgain,
                confirmCallback: callbacks.confirm
            };

            if (!hasAttempt) {
                if (gradableType === GRADABLE_TYPES.OPEN_GRADABLE) {
                    attemptService.verifyActivityAttempted(markedAnswers, submitAnswersForStudent, callbacks.continueEditing);
                } else {
                    submitAnswersForStudent();
                }
            } else {
                if (gradableType === GRADABLE_TYPES.CLOSED_GRADABLE) {
                    return dialogService.showScoresDialog(scores, modalOptions);
                }
            }

            function submitAnswersForStudent() {
                var setLessonStatusCompleted = (gradableType === GRADABLE_TYPES.OPEN_GRADABLE || gradableType === GRADABLE_TYPES.OPEN_NON_GRADABLE);
                if (!scormService.submitAnswers(scormInitialised, markedAnswers, scores.totalScore, setLessonStatusCompleted)) {
                    dialogService.showAnswerSubmittedDialog(false);
                }
                else {
                    if (gradableType === GRADABLE_TYPES.OPEN_GRADABLE || gradableType === GRADABLE_TYPES.OPEN_NON_GRADABLE) {
                        return dialogService.showAnswerSubmittedDialog(true, callbacks.activityForReview);
                    }

                    if (gradableType === GRADABLE_TYPES.CLOSED_GRADABLE) {
                        return dialogService.showScoresDialog(scores, modalOptions);
                    }
                }
            }
        }

        function getAnswers(correctAnswersJson, gradableType) {
            //Get marked answers only for closed gradable, otherwise
            //just return user answers
            var userAnswers = rcfService.getUserAnswers();
            return (gradableType === GRADABLE_TYPES.CLOSED_GRADABLE) ? rcfService.getMarkedAnswers(correctAnswersJson, userAnswers) : userAnswers;
        }

        function getMarkedAnswers(correctAnswersJson) {
            return rcfService.getMarkedAnswers(correctAnswersJson, rcfService.getUserAnswers());
        }

        function getPercentageScore(score, totalScore) {
            return Math.round((score / totalScore) * 100) + '%';
        }

        function getScores(markedAnswers) {

            var score = markedAnswers.score;
            var totalScore = rcfService.getPointsAvailable();
            var percentageScore = getPercentageScore(score, totalScore);

            return {
                score: score,
                totalScore: totalScore,
                percentageScore: percentageScore
            };
        }
    }

})();
