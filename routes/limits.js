'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// libreria para la conexion y manipulacion de datos en nodejs //
var express = require('express');
// controlador que se usara en esta ruta //
var LimitsController = require('../controllers/limits');
// declaracion del uso de rutas //
var api = express.Router();
// controlador de autenticacion //
var md_auth = require('../middleware/authenticate');

//=================Rutas //
//========Gets //
api.get('/show/:rate', md_auth.ensureAuth, LimitsController.show );
api.get('/show-all', md_auth.ensureAuth, LimitsController.showAll );
//========Post //
api.post('/save/:rate', md_auth.ensureAuth, LimitsController.save);
//========Put //
api.put('/update/:id', md_auth.ensureAuth, LimitsController.update);
//========Delete //
api.delete('/delete/:id', md_auth.ensureAuth, LimitsController.remove);

module.exports = api;