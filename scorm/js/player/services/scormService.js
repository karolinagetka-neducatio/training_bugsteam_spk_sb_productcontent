(function () {

    'use strict';

    var module = angular.module('playerApp');

    module.service('scormService', ['ACTIVITY_MODE', 'activityContentService', '$window', '$log',
        function (ACTIVITY_MODE, activityContentService, $window, $log) {
            var LESSON_STATUS_COMPLETED = 'completed';
            var scorm = $window.pipwerks.SCORM;
            scorm.version = '1.2';

            var MINIMUM_SCORE = 0;
            var CMI_SUSPEND_DATA = 'cmi.suspend_data';

            return {
                init: init,
                submitAnswers: submitAnswers,
                terminate: terminate,
                getValueByKey: getValueByKey,
                getStateFromAttempt: getStateFromAttempt,
                hasAttemptsInSuspendData: hasAttemptsInSuspendData,
                hasDraftInSuspendData: hasDraftInSuspendData,
                setDraft: setDraft,
                getDraft: getDraft,
                calculateBest: calculateBest,
                getSuspendData: getSuspendData,
                updateAttempt : updateAttempt
            };

            function init() {
                var scormStatus = {
                    initialised: false
                };

                if (isScormAvailable()) {
                    scormStatus.initialised = scorm.init();

                } else {
                    scormStatus.error = 'ERROR (Could not find SCORM API)\n\nYour results will not be recorded.';
                }

                return scormStatus;
            }

            function isScormAvailable() {
                return !!scorm.API.find($window);
            }

            function getValueByKey(key) {
                if (key) {
                    return scorm.get(key);
                }

                throw new Error('Invalid key');
            }

            function submitAnswers(scormInitialised, markedAnswers, maximumScoreString, setLessonStatusCompleted) {

                if (!scormInitialised) {
                    return;
                }

                var latestAttempt = {
                    comment: '',
                    min: MINIMUM_SCORE,
                    max: getMaximumScore(maximumScoreString),
                    state: markedAnswers,
                    raw: markedAnswers.score,
                    timestamp: new Date().toISOString()
                };

                try {
                    // set the marking, score and status
                    setMarkingBoundaries(MINIMUM_SCORE, latestAttempt.max);
                    setScore(latestAttempt.raw);
                    if (setLessonStatusCompleted) {
                        setLessonStatus(LESSON_STATUS_COMPLETED);
                    }

                    // now commit the changes
                    setSuspendData(getSuspendData(latestAttempt));

                    //Wipe any previous teacher comment, since this is a new activity attempt
                    setComments('');

                    //Wipe any previous teacher score
                    clearTeacherScore();

                    scormSave();
                    return true;

                } catch (ex) {
                    $log.error(ex.message || ex);
                }
            }

            function setDraft(scormInitialised, userAnswers) {
                if (!scormInitialised) {
                    return;
                }

                var draftData = getCmiSuspendData();

                draftData.draft = userAnswers;
                draftData.timestamp = new Date().toISOString();

                try {
                    setSuspendData(draftData);
                    scormSave();
                    return true;
                } catch (ex) {
                    $log.error(ex.message || ex);
                }
            }

            function getDraft() {
            	var data = getCmiSuspendData();
                return { draft: data.draft, timestamp: data.timestamp };
            }

            function getMaximumScore(maximumScoreString) {

                return parseInt(maximumScoreString);
            }

            function setMarkingBoundaries(min, max) {
                setScormValue('cmi.core.score.min', min);
                setScormValue('cmi.core.score.max', max);
            }

            function setLessonStatus(status) {
                setScormValue('cmi.core.lesson_status', status);
            }

            function setScore(score) {

                //Never set a value that is not a number
                var scoreAsInt = parseInt(score);
                if (isNaN(scoreAsInt)) {
                    return;
                }

                setScormValue('cmi.core.score.raw', scoreAsInt);
            }

            function clearTeacherScore() {
                //Blink holds cmi.core.score.manual_raw as marks out of 100, cmi.core.score.raw as marks out of scorm package reported max score.
                //Reset to -1 so we can detect it has been reset
                setScormValue('cmi.core.score.manual_raw', '-1');
            }

            function setScormValue(key, value) {

                var setScore = scorm.set(key, value);

                if (!setScore) {
                    throw new Error('Failed to set SCORM value: \'' + key + '\' to \'' + value + '\'');
                }
            }

            function setSuspendData(data) {
                return setScormValue(CMI_SUSPEND_DATA, JSON.stringify(data));
            }

            function getSuspendData(latestAttempt) {

                var suspendData = getCmiSuspendData();

                var firstAttempt = getAttempt(suspendData, 'first');

                var updatedData = (firstAttempt === undefined) ? {
                    'attempts': [
                        latestAttempt
                    ],
                    'first': 0,
                    'last': 0

                } : {
                    'attempts': [
                        firstAttempt,
                        latestAttempt
                    ],
                    'first': 0,
                    'last': 1
                };
                updatedData.apiVersion = '1.0.0';

                updatedData.numberOfAttempts = (suspendData.numberOfAttempts | 0) + 1;

                var lastBestAttempt = getAttempt(suspendData, 'best') || {};
                var bestAttempt = calculateBest(updatedData.attempts.concat(lastBestAttempt));

                var bestAttemptIndex = updatedData.attempts.indexOf(bestAttempt);
                if (bestAttemptIndex > -1) {
                    updatedData.best = bestAttemptIndex;
                } else {
                    updatedData.attempts.push(bestAttempt);
                    updatedData.best = updatedData.attempts.length - 1;
                }

                updatedData.timestamp = new Date().toISOString();
                return updatedData;
            }


            function getCmiSuspendData() {
                var cmiSuspendData = getValueByKey(CMI_SUSPEND_DATA);
                return (cmiSuspendData !== undefined && cmiSuspendData !== '') ? JSON.parse(cmiSuspendData) : {};
            }

            function hasAttemptsInSuspendData() {
                return (getCmiSuspendData().attempts !== undefined);
            }

            function hasDraftInSuspendData() {
                return (getCmiSuspendData().draft !== undefined);
            }

            function getAttempt(suspendData, attemptName) {
                return (suspendData.attempts || [])[(suspendData[attemptName] || 0)];
            }

            function getStateFromAttempt(attemptName) {
                var attempt = getAttempt(getCmiSuspendData(), attemptName);
                return (attempt) ? attempt.state : false;
            }

			function setComments(comment) {
				setScormValue('cmi.comments', comment);
			}

            function calculateBest(attempts) {
                var bestAttemptIndex = Object.keys(attempts).reduce(function (a, b) {
                    if(attempts[b].raw === undefined || attempts[a].raw >= attempts[b].raw){
                        return a;
                    } else {
                        return b;
                    }
                });
                return attempts[bestAttemptIndex];
            }

            function scormSave() {
                var result = scorm.save();

                if (!result) {
                    throw new Error('SCORM save failed');
                }
            }

            function terminate(scormInitialised) {

                if (!scormInitialised) {
                    return;
                }

                if (!scorm.quit()) {
                    $log.error('Failed to cleanly detach from SCORM API');
                }
            }

            function updateAttempt(attemptName, score, comment) {

                var suspendData = getCmiSuspendData();

                //Update attempt being viewed with teacher provided score / comment.
                var lastAttempt = getAttempt(suspendData, attemptName);
                if (lastAttempt === undefined) {
                    return;
                }
                lastAttempt.raw = score;
                lastAttempt.comment = comment;

                //Calculate new best attempt
                var newBestAttempt = calculateBest(suspendData.attempts);
                var bestAttemptIndex = suspendData.attempts.indexOf(newBestAttempt);
                if (bestAttemptIndex > -1) {
                    suspendData.best = bestAttemptIndex;
                }
                suspendData.timestamp = new Date().toISOString();

                //Save suspend data
                setSuspendData(suspendData);
                scormSave();

            }
        }]);
})();
