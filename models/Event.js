const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        require: true,
    },
    eventDate: {
        type: Date,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;