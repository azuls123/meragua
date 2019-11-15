'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable de Mongoose //
var mongoose = require('mongoose');
// la variable schema es una parte del modulo mongoose que permite cargar los esquemas a realizar //
var Schema = mongoose.Schema;
// Variable de entidad que da forma a todos los objetos con este esquema //
var RegisterSchema = Schema({
    lectura: Number,
    consumo: Number,
    year: Number,
    month: Number,
    subtotal: Number,
    updated_at: String,
    cancelado: Boolean,
    excessConsumo: Number,
    excessCosto: Number,
    excessM3: Number,
    base: Number,
    bill: {type: Schema.ObjectId, ref: 'Bill'},
    registered_by: { type: Schema.ObjectId, ref: 'user' },
    meter: {
        // Definicion del tipo de variable como Object Id para establecer un enlace con la tabla Principal //
        type: Schema.ObjectId, ref: 'Meter'
    },
    extra: { type: Schema.ObjectId, ref: 'Extra' }
});
// Exportacion del modelo para habilitarlo en toda la aplicacion //
module.exports = mongoose.model('Register', RegisterSchema);