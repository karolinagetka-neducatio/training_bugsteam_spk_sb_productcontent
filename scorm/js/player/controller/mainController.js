(function () {

    'use strict';

    var module = angular.module('playerApp');

    module.controller('mainController',
        ['$scope', '$sce', 'rcfService', 'scormService', 'activityContentService', 'blinkService', 'BLINK_ROLES', 'ACTIVITY_MODE', 'playerButtonService', 'locationService', 'markingService', 'dialogService', 'GRADABLE_TYPES',
            function ($scope, $sce, rcfService, scormService, activityContentService, blinkService, BLINK_ROLES, ACTIVITY_MODE, playerButtonService, locationService, markingService, dialogService, GRADABLE_TYPES) {
                var activityId = getUrlParameterFromName('activity_id');

                if (activityId.length === 0) {
                    console.log('ERROR (No \'activity_id\' specified)\n\nInvalid Activity.');
                }

                $scope.activityLoaded = false;
                $scope.hasAttempt = false;
                $scope.activityId = activityId;
                $scope.showDraftTimestamp = false;
                $scope.ANSWERS_OR_DRAFT = 'Draft';

                var scormStatus = scormService.init();

                $scope.scormInitialised = scormStatus.initialised;

                $scope.userRole = blinkService.userRole() || BLINK_ROLES.STUDENT;

                $scope.isStudent = function () {
                    return $scope.userRole === BLINK_ROLES.STUDENT;
                };

                $scope.attempt = blinkService.getAttempt();

                var onError = function (reason) {
                    $scope.error = reason.data;
                };

                var correctAnswersJson;
                activityContentService.getContent(activityId)
                    .then(function (activityContent) {
                        correctAnswersJson = activityContent.activityJson;
                        $scope.activityHtml = $sce.trustAsHtml(activityContent.activityHtml);
                    }).catch(onError);

                $scope.layout = {
                    marking: false,
                    showingAllAnswers: false,
                    showingCorrectAnswers: null,
                    showingSubmittedAnswers: false,
                    checkingAnswer: false
                };

                $scope.callbacks = {
                    confirm: function () {
                        return $scope.checkAnswerButton();
                    },
                    cancel: function () {
                        return $scope.cancelButton();
                    },
                    activityForReview: function () {
                        return $scope.activityForReview();
                    },
                    continueEditing: function () {
                        $scope.layout.marking = false;
                        markingService.clearMarkedAnswers();
                    },
                    tryAgain: function () {
                        $scope.$evalAsync(function () {
                            $scope.tryAgain();
                        });
                    }
                };

                $scope.checkAnswerButton = function () {
                    rcfService.showMarkedAnswers(markingService.getMarkedAnswers(correctAnswersJson));
                    $scope.$evalAsync(function () {
                        $scope.layout.checkingAnswer = true;
                    });
                };

                $scope.cancelButton = function () {
                    $scope.$evalAsync(function () {
                        $scope.reset();
                    });
                };

                $scope.activityForReview = function () {
                    $scope.$evalAsync(function () {
                        $scope.activityMode = ACTIVITY_MODE.PENDING_TEACHER_FEEDBACK;
                        $scope.showDraftTimestamp = false;
                    });
                };

                $scope.$watch('layout.showingAllAnswers', function (newValue) {
                    if (!!newValue) {
                        rcfService.hideMarkedAnswers();
                        rcfService.showCorrectAnswers(correctAnswersJson);
                        rcfService.disableActivity();
                    } else {
                        rcfService.showUserAnswers();
                        rcfService.enableActivity();
                    }
                });

                $scope.$watch('layout.showingCorrectAnswers', function (newValue) {

                    //User has selected 'show submitted answers'
                    //Only occurs for teacher when viewing previous student attempt
                    if (newValue === true) {
                        if ($scope.hasAttempt) {
                            var state = scormService.getStateFromAttempt($scope.attempt);
                            if (state !== false) {
                                rcfService.showCorrectAnswers(state);
                                if ($scope.gradableType === GRADABLE_TYPES.CLOSED_GRADABLE) {
                                    rcfService.showMarkedAnswers(state);
                                }
                            }
                        }
                        rcfService.disableActivity();
                    }

                    //User has selected 'show correct answers'
                    if (newValue === false) {
                        rcfService.showCorrectAnswers(correctAnswersJson);
                        rcfService.hideMarkedAnswers();
                        rcfService.disableActivity();
                    }
                });

                $scope.$watch('activityLoaded', function (newValue) {
                    if (newValue === true) {
                        setGradableType();
                        setIsAnswerKey();
                        hasSuspendData();
                    }
                });

                $scope.$watch('activityMode', function (newValue) {

                    if ($scope.hasAttempt === true || newValue === ACTIVITY_MODE.DEFAULT) {
                        return;
                    }
                    showLastAttemptedActivity();
                    rcfService.disableActivity();

                    if ($scope.isStudent() === true && newValue === ACTIVITY_MODE.PENDING_TEACHER_FEEDBACK) {
                        showMarkByYourTeacherMsg();
                    }
                });

                $scope.$on('$destroy', function () {
                    scormService.terminate($scope.scormInitialised);
                });

                function getUrlParameterFromName(name) {
                    return locationService.search()[name];
                }

                $scope.getActivityLoadedClass = function () {
                    return $scope.activityLoaded ? 'activityLoaded' : '';
                };


                $scope.next = function () {
                    $scope.layout.marking = false;
                    rcfService.hideMarkedAnswers();
                    rcfService.enableActivity();
                    rcfService.showNextAnswer(correctAnswersJson);
                };

                $scope.reset = function () {
                    rcfService.hideMarkedAnswers();
                    rcfService.resetAnswers();
                    rcfService.enableActivity();
                    $scope.layout.marking = false;
                    $scope.layout.checkingAnswer = false;
                    $scope.hasAttempt = false;
                    $scope.layout.showingAllAnswers = false;
                    $scope.layout.showingSubmittedAnswers = false;
                    $scope.showDraftTimestamp = false;
                    $scope.activityMode = ACTIVITY_MODE.DEFAULT;

                };

                $scope.submit = function () {
                    $scope.layout.marking = !$scope.layout.marking;
                    if ($scope.layout.marking === true) {
                        markingService.markAnswers($scope.scormInitialised, $scope.userRole, correctAnswersJson, $scope.hasAttempt, $scope.gradableType, $scope.callbacks);
                    } else {
                        // hide marks
                        markingService.clearMarkedAnswers();
                    }
                };

                $scope.saveDraft = function () {
                    return scormService.setDraft($scope.scormInitialised, rcfService.getUserAnswers()) === true ? dialogService.showSaveDraftDialog(true, $scope.ANSWERS_OR_DRAFT) : dialogService.showSaveDraftDialog(false, $scope.ANSWERS_OR_DRAFT);
                };

                $scope.tryAgain = function () {
                    var markedAnswers = markingService.getMarkedAnswers(correctAnswersJson);
                    rcfService.tryAgain(markedAnswers);
                    rcfService.hideMarkedAnswers();
                    rcfService.enableActivity();
                    $scope.layout.marking = false;
                    $scope.layout.checkingAnswer = false;
                    $scope.layout.showingAllAnswers = false;
                    $scope.hasAttempt = false;
                    $scope.layout.showingSubmittedAnswers = false;
                    $scope.activityMode = ACTIVITY_MODE.DEFAULT;
                };

                $scope.showPlayerButtonBar = function () {
                    return playerButtonService.showPlayerButtonBar($scope.scormInitialised, $scope.isAnswerKey);
                };

                $scope.showAllAnswers = function () {
                    $scope.layout.showingAllAnswers = !$scope.layout.showingAllAnswers;
                };

                $scope.showAllAnswersButton = function () {
                    return playerButtonService.showAllAnswersButton($scope.isAnswerKey, $scope.userRole, $scope.gradableType, $scope.layout.showingAllAnswers, $scope.hasAttempt, $scope.layout.checkingAnswer);
                };

                $scope.showCorrectAnswers = function () {
                    $scope.layout.showingCorrectAnswers = !$scope.layout.showingCorrectAnswers;
                };

                $scope.showCorrectAnswersButton = function () {
                    return playerButtonService.showCorrectAnswersButton($scope.isAnswerKey, $scope.userRole, $scope.gradableType, $scope.layout.showingCorrectAnswers, $scope.hasAttempt);
                };

                $scope.showSubmittedAnswer = function () {
                    $scope.layout.showingCorrectAnswers = !$scope.layout.showingCorrectAnswers;
                };

                $scope.showSubmittedAnswerButton = function () {
                    return playerButtonService.showSubmittedAnswerButton($scope.isAnswerKey, $scope.userRole, $scope.gradableType, $scope.layout.showingCorrectAnswers, $scope.hasAttempt);
                };

                $scope.showNextAnswerButton = function () {
                    return playerButtonService.showNextAnswerButton($scope.isAnswerKey, $scope.userRole, $scope.gradableType, $scope.layout.showingAllAnswers, $scope.hasAttempt, $scope.layout.checkingAnswer);
                };

                $scope.showResetButton = function () {
                    return playerButtonService.showResetButton($scope.isAnswerKey, $scope.userRole, $scope.gradableType, $scope.layout.showingAllAnswers, $scope.activityMode, $scope.layout.checkingAnswer);
                };

                $scope.getResetCaption = function () {
                    return $scope.isStudent() ? 'Reset' : 'Reset activity';
                };

                $scope.getSaveDraftCaption = function () {

                    if ($scope.gradableType === GRADABLE_TYPES.CLOSED_GRADABLE) {
                        $scope.ANSWERS_OR_DRAFT = 'Answers';
                    }

                    return 'Save ' + $scope.ANSWERS_OR_DRAFT.toLowerCase();
                };

                $scope.showScoreButton = function () {
                    return playerButtonService.showScoreButton($scope.isAnswerKey, $scope.gradableType, $scope.layout.showingAllAnswers, $scope.hasAttempt);
                };

                $scope.showSaveDraftButton = function () {
                    return playerButtonService.showSaveDraftButton($scope.isAnswerKey, $scope.gradableType, $scope.activityMode, $scope.layout.showingAllAnswers, $scope.hasAttempt, $scope.layout.checkingAnswer, $scope.userRole);
                };

                $scope.showSubmitButton = function () {
                    return playerButtonService.showSubmitButton($scope.isAnswerKey, $scope.gradableType, $scope.activityMode, $scope.layout.showingAllAnswers, $scope.hasAttempt, $scope.layout.checkingAnswer, $scope.userRole);
                };

                $scope.showTryAgainButton = function () {
                    return playerButtonService.showTryAgainButton($scope.isAnswerKey, $scope.userRole, $scope.activityMode, $scope.gradableType, $scope.layout.checkingAnswer, $scope.hasAttempt);
                };

                $scope.anyButtonShown = function () {
                    return $scope.showAllAnswersButton() || $scope.showCorrectAnswersButton() || $scope.showNextAnswerButton() || $scope.showResetButton() || $scope.showSubmitButton() || $scope.showSaveDraftButton() || $scope.showTryAgainButton() || $scope.showSubmittedAnswerButton();
                };

                function hasSuspendData() {
                    showAttempt();
                    hasDraftInSuspendData();
                }

                function showAttempt() {
                    if ($scope.attempt !== false && !scormService.hasAttemptsInSuspendData()) {
                        $scope.hasAttempt = true;
                        $scope.layout.showingCorrectAnswers = true;
                        return displayNoAttemptFoundMsg($scope.userRole);
                    }

                    if (blinkService.isValidAttempt($scope.attempt)) {
                        $scope.hasAttempt = true;
                        $scope.layout.showingCorrectAnswers = true;
                    }
                }

                function hasDraftInSuspendData() {
                    if (scormService.hasDraftInSuspendData() && $scope.isStudent()) {
                        var data = scormService.getDraft();
                        rcfService.showCorrectAnswers(data.draft);
                        $scope.draftTimestamp = data.timestamp;
                        $scope.showDraftTimestamp = true;
                    }
                }

                function setGradableType() {
                    //Get raw 'gradable type' string from rcf
                    var gradableType = rcfService.getGradableType();

                    //If nothing, default to non-gradable
                    if (!gradableType) {
                        gradableType = GRADABLE_TYPES.NON_GRADABLE;
                    }

                    $scope.gradableType = gradableType;
                    //Blinkmode raw
                    //
                    $scope.activityMode = activityContentService.getActivityMode($scope.userRole, $scope.gradableType, blinkService.scoreRaw(), blinkService.scoreMax());
                }

                function showLastAttemptedActivity() {
                    rcfService.showCorrectAnswers(scormService.getStateFromAttempt('last'));
                }

                function setIsAnswerKey() {
                    var isAnswerKeyActivity = rcfService.isAnswerKeyActivity();
                    $scope.isAnswerKey = !!isAnswerKeyActivity;
                }

                function showMarkByYourTeacherMsg() {
                    /* jshint browser: true */
                    var $activityContainer = angular.element(document).find('.activityContainer');
                    if ($activityContainer) {
                        $activityContainer.prepend('<div class="latest-attempt-msg">The latest attempt of this activity needs to be marked by your teacher before you can attempt again.</div>');
                    }
                }

                function displayNoAttemptFoundMsg(userRole) {
                    /* jshint browser: true */
                    var $activityContainer = angular.element(document).find('.activityContainer');
                    if ($activityContainer) {

                        var message = (userRole === BLINK_ROLES.STUDENT) ? 'You have not yet attempted this activity.' : 'The student has not yet attempted this activity.';
                        $activityContainer.prepend('<div class="no-attempt-msg">' + message + '</div>');
                    }
                }

            }]);
})();
