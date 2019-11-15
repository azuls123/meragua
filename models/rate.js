'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable de Mongoose //
var mongoose = require('mongoose');
// la variable schema es una parte del modulo mongoose que permite cargar los esquemas a realizar //
var Schema = mongoose.Schema;
// Variable de entidad que da forma a todos los objetos con este esquema //
var rateSchema = Schema({
    tarifa: String,
    base: Number,
    percent_cost: Boolean,
    edited_by: {type: Schema.ObjectId, ref: 'user'}
});
// Exportacion del modelo para habilitarlo en toda la aplicacion //
module.exports = mongoose.model('Rate', rateSchema);