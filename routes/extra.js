'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// libreria para la conexion y manipulacion de datos en nodejs //
var express = require('express');
// controlador que se usara en esta ruta //
var ExtraController = require('../controllers/extra');
// declaracion del uso de rutas //
var api = express.Router();
// importacion ed middleware de autenticacion //
var md_auth = require('../middleware/authenticate');

//=================Rutas //
//========Post //
api.post('/save', md_auth.ensureAuth, ExtraController.save);
//========Get //
api.get('/show',md_auth.ensureAuth, ExtraController.show);
//========Put //
api.put('/update/:id',md_auth.ensureAuth, ExtraController.update);
//========Delete //
api.delete('/delete/:id', md_auth.ensureAuth, ExtraController.remove);
module.exports = api;