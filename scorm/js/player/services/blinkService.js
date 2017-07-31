(function () {

    'use strict';

    /**
     * blinkService
     * Encapsulate BlinkLearning specific extensions to the SCORM v1.2 API
     */

    var module = angular.module('playerApp');

    module.service('blinkService', ['locationService', 'scormService', '$window',
        function (locationService, scormService, $window) {

            //Expose updateAttempt api direct on window object for Blink to call
            $window.updateAttempt = updateAttempt;

            function updateAttempt(score, comment) {
                //Allow containing LMS to call in to update score and comment
                var attemptName = getAttempt();
                if (attemptName === false) {
                    attemptName = 'last';
                }
                scormService.updateAttempt(attemptName, score, comment);
            }

			function userRole() {
				return scormService.getValueByKey('cmi.core.user_role');
			}

            function scoreRaw() {
                var teacherScore = scormService.getValueByKey('cmi.core.score.manual_raw');

                if (teacherScore !== null && teacherScore !== '') {

                    //Pick out default value
                    if (teacherScore === '-1') {
                        return '';
                    }

                    teacherScore = Math.round(teacherScore);
                    if (teacherScore > -1) {
                        return teacherScore;
                    } else {

                    }
                }
                return scormService.getValueByKey('cmi.core.score.raw');
            }

            function scoreMax() {
                return scormService.getValueByKey('cmi.core.score.max');
            }

            function getAttempt() {

                var attempt = getUrlParameterFromName('attempt');
                return isValidAttempt(attempt) ? attempt : false;

            }

            function isValidAttempt(attempt){
                return ['first', 'best', 'last'].indexOf(attempt) >= 0;
            }

            function closeBlinkModal(){
                if(typeof ($window.parent.cerrarIFrame) === 'function'){
                    //Calling Blink's close modal function
                    $window.parent.cerrarIFrame();
                }
            }

			function getUrlParameterFromName(name) {
				return locationService.search()[name];
			}

            return {
                userRole: userRole,
                scoreRaw : scoreRaw,
                scoreMax : scoreMax,
                getAttempt: getAttempt,
                isValidAttempt: isValidAttempt,
                closeBlinkModal: closeBlinkModal
            };
        }]);
})();
