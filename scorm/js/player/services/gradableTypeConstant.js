'use strict';

angular
    .module('playerApp')
    .constant('GRADABLE_TYPES', {
        'CLOSED_GRADABLE': 'closed-gradable',
        'OPEN_GRADABLE': 'open-gradable',
        'NON_GRADABLE': 'non-gradable',
        'OPEN_NON_GRADABLE': 'open-non-gradable'
    });
