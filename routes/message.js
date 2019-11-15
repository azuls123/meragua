'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// libreria para la conexion y manipulacion de datos en nodejs //
var express = require('express');
// controlador que se usara en esta ruta //
var MessageController = require('../controllers/message');
// declaracion del uso de rutas //
var api = express.Router();
// importacion del middleware de autenticacion //
var md_auth = require('../middleware/authenticate');
//=================Rutas //
//========Gets //
api.get('/prueba', md_auth.ensureAuth, MessageController.prueba);
api.get('/show-received/:page?',md_auth.ensureAuth,MessageController.showReceiver);
api.get('/show-emitted/:page?',md_auth.ensureAuth, MessageController.showEmitter);
api.get('/unviewed',md_auth.ensureAuth, MessageController.unviewed);
api.get('/viewed',md_auth.ensureAuth, MessageController.viewed);
//========Post //
api.post('/save', md_auth.ensureAuth, MessageController.save);
//========Delete //

module.exports = api;