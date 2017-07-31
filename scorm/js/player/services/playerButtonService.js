(function () {

    'use strict';

    /**
     * playerButtonService
     * Encapsulate SCORM Player button specific behaviour
     */

    var module = angular.module('playerApp');

    module.service('playerButtonService', ['BLINK_ROLES', 'GRADABLE_TYPES', 'ACTIVITY_MODE',
        function (BLINK_ROLES, GRADABLE_TYPES, ACTIVITY_MODE) {
            var showPlayerButtonBar = function (scormInitialised, isAnswerKey) {
                return scormInitialised === true ||
                    isAnswerKey === true;
            };

            var showAllAnswersButton = function (isAnswerKey, userRole, gradableType, showingAllAnswers, hasAttempt, checkingAnswer) {
                return isAnswerKey === true ||
                    (userRole === BLINK_ROLES.TEACHER && gradableType === GRADABLE_TYPES.CLOSED_GRADABLE) &&
                    showingAllAnswers === false &&
                    hasAttempt === false &&
                    checkingAnswer === false;
            };

            var showCorrectAnswersButton = function (isAnswerKey, userRole, gradableType, showingCorrectAnswers, hasAttempt) {
                return isAnswerKey === false &&
                    (userRole === BLINK_ROLES.TEACHER && gradableType === GRADABLE_TYPES.CLOSED_GRADABLE) &&
                    showingCorrectAnswers === true &&
                    hasAttempt === true;
            };

            var showNextAnswerButton = function (isAnswerKey, userRole, gradableType, showingCorrectAnswers, hasAttempt, checkingAnswer) {
                return isAnswerKey === true ||
                    (userRole === BLINK_ROLES.TEACHER && gradableType === GRADABLE_TYPES.CLOSED_GRADABLE) &&
                    hasAttempt === false &&
                    showingCorrectAnswers === false &&
                    checkingAnswer === false;
            };

            var showSubmittedAnswerButton = function (isAnswerKey, userRole, gradableType, showingCorrectAnswers, hasAttempt) {
                return isAnswerKey === false &&
                    (userRole === BLINK_ROLES.TEACHER && gradableType === GRADABLE_TYPES.CLOSED_GRADABLE) &&
                    showingCorrectAnswers === false &&
                    hasAttempt === true;
            };

            var showResetButton = function (isAnswerKey, userRole, gradableType, showingAllAnswers, activityMode, checkingAnswer) {
                return isAnswerKey === true ||
                    (gradableType === GRADABLE_TYPES.OPEN_GRADABLE  && activityMode === ACTIVITY_MODE.REVIEW_TEACHER_FEEDBACK && userRole === BLINK_ROLES.STUDENT) ||
                    gradableType === GRADABLE_TYPES.CLOSED_GRADABLE &&
                    (
                        (userRole === BLINK_ROLES.TEACHER && (showingAllAnswers === true || checkingAnswer === true)) ||
                        (userRole === BLINK_ROLES.STUDENT)
                    );
            };

            var showSaveDraftButton = function (isAnswerKey, gradableType, activityMode, showingCorrectAnswers, hasAttempt, checkingAnswer, userRole) {
                return (isAnswerKey === false) &&
                    (gradableType === GRADABLE_TYPES.OPEN_GRADABLE || gradableType === GRADABLE_TYPES.OPEN_NON_GRADABLE || gradableType === GRADABLE_TYPES.CLOSED_GRADABLE) &&
                    activityMode === ACTIVITY_MODE.DEFAULT &&
                    hasAttempt === false &&
                    showingCorrectAnswers === false &&
                    checkingAnswer === false &&
                    userRole === BLINK_ROLES.STUDENT;
            };

            var showSubmitButton = function (isAnswerKey, gradableType, activityMode, showingAllAnswers, hasAttempt, checkingAnswer, userRole) {
                return (
                    (userRole === BLINK_ROLES.TEACHER && gradableType === GRADABLE_TYPES.CLOSED_GRADABLE) ||
                    (userRole === BLINK_ROLES.STUDENT && gradableType !== GRADABLE_TYPES.NON_GRADABLE)) &&
                    isAnswerKey === false &&
                    gradableType !== GRADABLE_TYPES.NON_GRADABLE &&
                    activityMode === ACTIVITY_MODE.DEFAULT &&
                    hasAttempt === false &&
                    showingAllAnswers === false &&
                    checkingAnswer === false;
            };

            var showTryAgainButton = function (isAnswerKey, userRole, activityMode, gradableType, checkingAnswer, hasAttempt) {
                if (isAnswerKey === true) { return false; }
                if (userRole === BLINK_ROLES.TEACHER) { return false; }
                if (gradableType === GRADABLE_TYPES.NON_GRADABLE || gradableType === GRADABLE_TYPES.OPEN_GRADABLE) { return false; }
                if (activityMode === ACTIVITY_MODE.PENDING_TEACHER_FEEDBACK) { return false; }
                if (hasAttempt === true) { return true; }
                if (activityMode === ACTIVITY_MODE.REVIEW_TEACHER_FEEDBACK) { return true; }
                if (checkingAnswer === true) { return true; }
                return false;
            };

            var showScoreButton = function (isAnswerKey, gradableType, showingCorrectAnswers, hasAttempt) {
                return isAnswerKey === false  &&
                    gradableType === GRADABLE_TYPES.CLOSED_GRADABLE &&
                    hasAttempt === true &&
                    showingCorrectAnswers === false;
            };

            return {
                showPlayerButtonBar: showPlayerButtonBar,
                showAllAnswersButton: showAllAnswersButton,
                showCorrectAnswersButton: showCorrectAnswersButton,
                showSubmittedAnswerButton: showSubmittedAnswerButton,
                showNextAnswerButton: showNextAnswerButton,
                showResetButton: showResetButton,
                showSaveDraftButton: showSaveDraftButton,
                showSubmitButton: showSubmitButton,
                showTryAgainButton: showTryAgainButton,
                showScoreButton: showScoreButton
            };
        }]);
})();


