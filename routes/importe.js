'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// libreria para la conexion y manipulacion de datos en nodejs //
var express = require('express');
// controlador que se usara en esta ruta //
var ImporteController = require('../controllers/importe');
// declaracion del uso de rutas //
var api = express.Router();
// controlador de autenticacion //
var md_auth = require('../middleware/authenticate');

//=================Rutas //
//========Gets //
api.get('/show', md_auth.ensureAuth, ImporteController.show );
//========Post //
api.post('/save', md_auth.ensureAuth, ImporteController.save);
//========Put //
api.put('/update/:id', md_auth.ensureAuth, ImporteController.update);
//========Delete //
api.delete('/delete/:id', md_auth.ensureAuth, ImporteController.remove);

module.exports = api;