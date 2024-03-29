'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable de Mongoose //
var mongoose = require('mongoose');
// la variable schema es una parte del modulo mongoose que permite cargar los esquemas a realizar //
var Schema = mongoose.Schema;
// Variable de entidad que da forma a todos los objetos con este esquema //
var userSchema = Schema({
    cuenta: String,
    contrase: String,
    direccion: {
        type: String,
        default: 'Sin Direccion'
    },
    correo: String,
    image: String,
    nombre: String,
    apellido: String,
    cedula: String,
    role_user: String,
    telefono: {type: String, default: 'Sin Telefono'},
    fecha_nacimiento: String,
    sexo: {
        type: String,
        default: 'Indefinido'
    },
    activa: {
        type: Boolean,
        default: true
    },
    updated_at: String,
    edited_by: {
        type: Schema.ObjectId,
        ref: 'user'
    },
});
// Exportacion del modelo para habilitarlo en toda la aplicacion //
module.exports = mongoose.model('user', userSchema);