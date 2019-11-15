'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = Schema({
    text: String,
    created_at: String,
    viewed: Boolean,
    emitter: {type: Schema.ObjectId, ref: 'user'},
    receiver: {type: Schema.ObjectId, ref: 'user'}
});

module.exports = mongoose.model('Message', MessageSchema);