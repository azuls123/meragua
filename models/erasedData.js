'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var erasedData = Schema({
    tabla: String,
    contenido: String,
    erased_at: String,
    erased_by: {type: Schema.ObjectId, ref: 'user'}
});
module.exports = mongoose.model('ErasedData', erasedData);