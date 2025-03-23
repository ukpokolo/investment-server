// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['INFO', 'WARNING', 'ERROR', 'SUCCESS'],
        default: 'INFO'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // User field is optional - null means system-wide notification
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        // Optional link to redirect users when they click on notification
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries, sorting by creation date
notificationSchema.index({ createdAt: -1 });
// Index for user-specific notifications
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);