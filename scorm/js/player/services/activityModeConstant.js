'use strict';

angular
    .module('playerApp')
    .constant('ACTIVITY_MODE', {
        'PENDING_TEACHER_FEEDBACK' : 'pendingTeacherFeedback',
        'LEAVE_TEACHER_FEEDBACK': 'leaveTeacherFeedback',
        'REVIEW_TEACHER_FEEDBACK': 'reviewTeacherFeedback',
        'DEFAULT': 'default'
    });
