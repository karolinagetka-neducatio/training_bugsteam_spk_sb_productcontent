(function () {

    'use strict';

    var module = angular.module('playerApp');

    module.service('activityContentService', ['BLINK_ROLES', 'GRADABLE_TYPES', 'ACTIVITY_MODE', '$http', '$window', '$q',
        function (BLINK_ROLES, GRADABLE_TYPES, ACTIVITY_MODE, $http, $window, $q) {
            var getContent = function (activityId) {
                var htmlPath = $window.releaseRootHtml + '/' + activityId + '.html';
                var jsonPath = $window.releaseRootJson + '/' + activityId + '.json';
                var content = {};
                var deferred = $q.defer();

                $http.get(htmlPath).then(function (response) {
                    content.activityHtml = response.data;
                    return $http.get(jsonPath);
                }).then(function (response) {
                    content.activityJson = response.data;
                    return content;
                }).then(deferred.resolve, deferred.reject);

                return deferred.promise;
            };

            var getActivityMode = function (userRole, gradableType, rawScore, maxScore) {

                //Workaround to alias default Blink values for max score to default value
                if (maxScore === '100' && rawScore === '') {
                    maxScore = '';
                }

                switch (gradableType) {

                case GRADABLE_TYPES.OPEN_GRADABLE:
                case GRADABLE_TYPES.OPEN_NON_GRADABLE:

                    //No max score previous set = new attempt
                    //Allow new attempt for both students and teachers,
                    //but teachers access in 'practice mode' only, cannot actually submit
                    if (maxScore === '') {
                        return ACTIVITY_MODE.DEFAULT;
                    }
                    else {
                        if (userRole === BLINK_ROLES.STUDENT)  {
                            return (rawScore === '') ? ACTIVITY_MODE.PENDING_TEACHER_FEEDBACK : ACTIVITY_MODE.REVIEW_TEACHER_FEEDBACK;
                        }
                        if (userRole === BLINK_ROLES.TEACHER) {
                            return (rawScore === '') ? ACTIVITY_MODE.LEAVE_TEACHER_FEEDBACK : ACTIVITY_MODE.REVIEW_TEACHER_FEEDBACK;
                        }
                        return ACTIVITY_MODE.DEFAULT;
                    }
                    break;
                default:
                    return ACTIVITY_MODE.DEFAULT;
                }
            };

            return {
                getContent: getContent,
                getActivityMode: getActivityMode
            };
        }]);
})();
