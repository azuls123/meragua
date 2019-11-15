'user strict'

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ErrorSchema = Schema({
    description: String,
    message: String,
    action: String,
    code: String,
    title: String,
    table: String,
    zone: String,
    updated_at: String,
    repaired: Boolean,
    registered_by:  {type: Schema.ObjectId, ref: 'User' },
    solved_by:  {type: Schema.ObjectId, ref: 'User' }

})
module.exports = mongoose.model('ErrorCatcher', ErrorSchema);
