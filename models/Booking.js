const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },

});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;