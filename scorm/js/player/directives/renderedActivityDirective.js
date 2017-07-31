(function () {

    'use strict';

    var module = angular.module('playerApp');

    module.directive('renderedActivityDirective', ['rcfService', function (rcfService) {
        return {
            link: function ($scope, element) {
                // Trigger when number of children changes,
                // including by directives like ng-repeat
                $scope.$watch(function () {
                    return element.children().length;
                }, function () {
                    // Wait for templates to render
                    $scope.$evalAsync(function () {
                        // pass the activity when the content is available
                        if (element.children().length > 0) {
                            rcfService.updateContent(element.children()).then(function() {
                                $scope.activityLoaded = true;
                                //Since this activityLoaded model change has occurred outside the angularJs context,
                                //need to manually trigger a new digest cycle so any watch expression on the scope
                                //can pick up this change.
                                $scope.$digest();
                            });
                        }
                    });
                });
            }
        };
    }]);
}());
