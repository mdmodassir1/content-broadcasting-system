module.exports = {
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    USER_ROLES: {
        TEACHER: 'teacher',
        PRINCIPAL: 'principal'
    },
    CONTENT_STATUS: {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected'
    },
    SUBJECTS: ['Maths', 'Science', 'English', 'Social Studies', 'Computer Science']
};