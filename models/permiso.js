'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable de Mongoose //
var mongoose = require('mongoose');
// la variable schema es una parte del modulo mongoose que permite cargar los esquemas a realizar //
var Schema = mongoose.Schema;
// Variable de entidad que da forma a todos los objetos con este esquema //
var PermisoSchema = Schema({
    crear: Boolean,
    leer: Boolean,
    actualizar: Boolean,
    borrar: Boolean,
    tabla: {type: Schema.ObjectId, ref:'Tabla'},
    empleado: {type: Schema.ObjectId, ref: 'user'},
    updated_at: String,
    updated_by: {type: Schema.ObjectId, ref:'user'}
});
// Exportacion del modelo para habilitarlo en toda la aplicacion //
module.exports = mongoose.model('Permiso', PermisoSchema);