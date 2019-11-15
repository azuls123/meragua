'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// libreria para la conexion y manipulacion de datos en nodejs //
var express = require('express');
// controlador que se usara en esta ruta //
var TablaController = require('../controllers/tabla');
// declaracion del uso de rutas //
var api = express.Router();
// controlador de autenticacion //
var md_auth = require('../middleware/authenticate');

//=================Rutas //
//========Post //
api.post('/save',md_auth.ensureAuth, TablaController.save);
//========Get //
api.get('/show',md_auth.ensureAuth, TablaController.show);
//========Put //
api.put('/update/:id', md_auth.ensureAuth, TablaController.update);
//========Delete //
api.delete('/delete/:id',md_auth.ensureAuth, TablaController.remove);

module.exports = api;